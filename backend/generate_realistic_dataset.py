import os
import django
import random
import string
from datetime import datetime, timedelta
import pytz

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'order_management.settings')
django.setup()

from orders.models import Order
from authentication.models import User
from django.db import transaction
from django.utils import timezone

# Constantes
IN_PROGRESS_ORDERS_TODAY = 200  # Commandes en cours aujourd'hui
COMPLETED_ORDERS_PER_DAY = 400  # Commandes complétées par jour

# Dates
TODAY = datetime(2025, 4, 13, tzinfo=pytz.UTC)  # Date actuelle (13 avril 2025)
YESTERDAY = TODAY - timedelta(days=1)
START_DATE = datetime(2022, 1, 1, tzinfo=pytz.UTC)  # Date de début (1er janvier 2022)

# Fonction pour générer une référence unique
def generate_reference(date=None, counter=None):
    prefix = ''.join(random.choices(string.ascii_uppercase, k=3))
    
    # Ajouter un identifiant basé sur la date et un compteur pour garantir l'unicité
    if date:
        # Format: AAAAMMJJ
        date_part = date.strftime('%Y%m%d')
        # Ajouter un compteur pour différencier les commandes du même jour
        counter_part = f"{counter:04d}" if counter is not None else ''
        number = f"{date_part}{counter_part}"
    else:
        # Fallback au comportement précédent si pas de date fournie
        number = ''.join(random.choices(string.digits, k=10))
    
    return f"{prefix}-{number}"

# Fonction pour générer un numéro de chariot
def generate_cart_number():
    return f"CART-{''.join(random.choices(string.digits, k=4))}"

# Fonction pour générer une date aléatoire dans une journée spécifique
def random_time_on_date(date):
    # Ajouter un nombre aléatoire d'heures et de minutes à la date
    hours = random.randint(8, 17)  # Entre 8h et 17h
    minutes = random.randint(0, 59)
    seconds = random.randint(0, 59)
    
    return date.replace(hour=hours, minute=minutes, second=seconds)

# Fonction pour générer des dates cohérentes pour le cycle de vie d'une commande
def generate_order_dates(created_at, status):
    prepared_at = None
    controlled_at = None
    packed_at = None
    completed_at = None
    
    # Temps moyen pour chaque étape (en minutes)
    prep_time = random.randint(10, 30)
    control_time = random.randint(5, 15)
    packing_time = random.randint(5, 20)
    
    if status in ['PREPARED', 'CONTROLLED', 'PACKED']:
        prepared_at = created_at + timedelta(minutes=prep_time)
        
    if status in ['CONTROLLED', 'PACKED']:
        prepared_at = created_at + timedelta(minutes=prep_time)
        controlled_at = prepared_at + timedelta(minutes=control_time)
        
    if status == 'PACKED':
        prepared_at = created_at + timedelta(minutes=prep_time)
        controlled_at = prepared_at + timedelta(minutes=control_time)
        packed_at = controlled_at + timedelta(minutes=packing_time)
        completed_at = packed_at
    
    return prepared_at, controlled_at, packed_at, completed_at

def main():
    print("Récupération des utilisateurs...")
    agents = list(User.objects.filter(role='AGENT'))
    
    if not agents:
        print("Aucun agent trouvé dans la base de données. Veuillez créer des agents avant d'exécuter ce script.")
        return
    
    # Calculer le nombre total de jours et de commandes
    total_days = (YESTERDAY - START_DATE).days + 1
    total_completed_orders = total_days * COMPLETED_ORDERS_PER_DAY
    total_orders = total_completed_orders + IN_PROGRESS_ORDERS_TODAY
    
    print(f"Génération de {total_orders} commandes sur {total_days} jours...")
    print(f"- {total_completed_orders} commandes complétées entre le {START_DATE.date()} et le {YESTERDAY.date()}")
    print(f"- {IN_PROGRESS_ORDERS_TODAY} commandes en cours pour aujourd'hui ({TODAY.date()})")
    
    # Générer les commandes par lots
    batch_size = 1000
    orders_created = 0
    
    # 1. Générer les commandes complétées (PACKED) pour chaque jour passé
    current_date = START_DATE
    while current_date <= YESTERDAY:
        print(f"Génération des commandes pour le {current_date.date()}...")
        
        # Créer un lot de commandes pour cette journée
        batch = []
        for i in range(COMPLETED_ORDERS_PER_DAY):
            # Générer une heure aléatoire pour cette journée
            created_at = random_time_on_date(current_date)
            
            # Générer les dates des étapes suivantes (toutes complétées)
            prepared_at, controlled_at, packed_at, completed_at = generate_order_dates(created_at, 'PACKED')
            
            # Sélectionner des agents aléatoires pour chaque étape
            creator = random.choice(agents)
            preparer = random.choice(agents)
            controller = random.choice(agents)
            packer = random.choice(agents)
            
            # Créer l'objet Order
            order = Order(
                reference=generate_reference(date=current_date, counter=i),
                status='PACKED',
                cart_number=generate_cart_number(),
                line_count=random.randint(1, 50),
                creator=creator,
                preparer=preparer,
                controller=controller,
                packer=packer,
                created_at=created_at,
                prepared_at=prepared_at,
                controlled_at=controlled_at,
                packed_at=packed_at,
                completed_at=completed_at
            )
            
            batch.append(order)
        
        # Enregistrer le lot dans la base de données
        with transaction.atomic():
            Order.objects.bulk_create(batch)
        
        orders_created += len(batch)
        print(f"Progression: {orders_created}/{total_orders} commandes créées ({(orders_created/total_orders*100):.1f}%)")
        
        # Passer au jour suivant
        current_date += timedelta(days=1)
    
    # 2. Générer les commandes en cours pour aujourd'hui
    print(f"Génération des {IN_PROGRESS_ORDERS_TODAY} commandes en cours pour aujourd'hui...")
    
    # Distribution des statuts pour les commandes en cours
    status_distribution = {
        'CREATED': 0.4,     # 40% des commandes en cours sont en statut CREATED
        'PREPARED': 0.35,   # 35% des commandes en cours sont en statut PREPARED
        'CONTROLLED': 0.25, # 25% des commandes en cours sont en statut CONTROLLED
    }
    
    # Calculer le nombre de commandes pour chaque statut
    status_counts = {
        status: int(IN_PROGRESS_ORDERS_TODAY * percentage)
        for status, percentage in status_distribution.items()
    }
    
    # Ajuster pour s'assurer que la somme est égale à IN_PROGRESS_ORDERS_TODAY
    total = sum(status_counts.values())
    if total < IN_PROGRESS_ORDERS_TODAY:
        status_counts['CREATED'] += (IN_PROGRESS_ORDERS_TODAY - total)
    
    # Générer les commandes en cours par statut
    for status, count in status_counts.items():
        print(f"Génération de {count} commandes avec le statut {status} pour aujourd'hui...")
        
        batch = []
        for i in range(count):
            # Générer une heure aléatoire pour aujourd'hui
            created_at = random_time_on_date(TODAY)
            
            # Générer les dates des étapes suivantes
            prepared_at, controlled_at, packed_at, completed_at = generate_order_dates(created_at, status)
            
            # Sélectionner des agents aléatoires pour chaque étape
            creator = random.choice(agents)
            preparer = random.choice(agents) if status in ['PREPARED', 'CONTROLLED'] else None
            controller = random.choice(agents) if status == 'CONTROLLED' else None
            
            # Créer l'objet Order
            order = Order(
                reference=generate_reference(date=TODAY, counter=orders_created + i),
                status=status,
                cart_number=generate_cart_number(),
                line_count=random.randint(1, 50),
                creator=creator,
                preparer=preparer,
                controller=controller,
                packer=None,
                created_at=created_at,
                prepared_at=prepared_at,
                controlled_at=controlled_at,
                packed_at=None,
                completed_at=None
            )
            
            batch.append(order)
        
        # Enregistrer le lot dans la base de données
        with transaction.atomic():
            Order.objects.bulk_create(batch)
        
        orders_created += len(batch)
        print(f"Progression: {orders_created}/{total_orders} commandes créées ({(orders_created/total_orders*100):.1f}%)")
    
    print(f"Génération terminée! {orders_created} commandes ont été créées avec succès.")
    print(f"- {total_completed_orders} commandes complétées entre le {START_DATE.date()} et le {YESTERDAY.date()}")
    print(f"- {IN_PROGRESS_ORDERS_TODAY} commandes en cours pour aujourd'hui ({TODAY.date()})")

if __name__ == "__main__":
    main()
