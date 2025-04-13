import os
import django
import random
import string
from datetime import datetime, timedelta
import pytz
from django.db.models import Count
from django.db import transaction

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'order_management.settings')
django.setup()

from orders.models import Order
from authentication.models import User
from django.utils import timezone

# Constantes
TOTAL_ORDERS = 50000
IN_PROGRESS_ORDERS = 300
COMPLETED_ORDERS = TOTAL_ORDERS - IN_PROGRESS_ORDERS

# Répartition des commandes en cours
IN_PROGRESS_DISTRIBUTION = {
    'CREATED': 0.4,     # 40% des commandes en cours sont en statut CREATED (120)
    'PREPARED': 0.35,   # 35% des commandes en cours sont en statut PREPARED (105)
    'CONTROLLED': 0.25, # 25% des commandes en cours sont en statut CONTROLLED (75)
}

# Dates
TODAY = datetime(2025, 4, 13, tzinfo=pytz.UTC)  # Date actuelle (13 avril 2025)
END_DATE = datetime(2025, 3, 31, tzinfo=pytz.UTC)  # Fin mars 2025 pour les commandes complétées
START_DATE = datetime(2022, 1, 1, tzinfo=pytz.UTC)  # Date de début (1er janvier 2022)

# Fonction pour générer une référence unique
def generate_reference(date=None, counter=None):
    prefix = ''.join(random.choices(string.ascii_uppercase, k=3))
    
    # Ajouter un identifiant basé sur la date et un compteur pour garantir l'unicité
    if date:
        # Format: AAAAMMJJ
        date_part = date.strftime('%Y%m%d')
        # Ajouter un compteur pour différencier les commandes du même jour
        counter_part = f"{counter:06d}" if counter is not None else ''
        number = f"{date_part}{counter_part}"
    else:
        # Fallback au comportement précédent si pas de date fournie
        number = ''.join(random.choices(string.digits, k=10))
    
    return f"{prefix}-{number}"

# Fonction pour générer un numéro de chariot
def generate_cart_number():
    return f"CART-{''.join(random.choices(string.digits, k=4))}"

# Fonction pour générer une date aléatoire dans une plage donnée
def random_date_between(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    
    # Ajouter une heure aléatoire
    hours = random.randint(8, 17)  # Entre 8h et 17h
    minutes = random.randint(0, 59)
    seconds = random.randint(0, 59)
    
    return random_date.replace(hour=hours, minute=minutes, second=seconds)

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
    
    print(f"Génération de {TOTAL_ORDERS} commandes...")
    print(f"- {COMPLETED_ORDERS} commandes complétées entre {START_DATE.date()} et {END_DATE.date()}")
    print(f"- {IN_PROGRESS_ORDERS} commandes en cours pour aujourd'hui ({TODAY.date()})")
    
    # Calculer le nombre de commandes pour chaque statut en cours
    status_counts = {
        status: int(IN_PROGRESS_ORDERS * percentage)
        for status, percentage in IN_PROGRESS_DISTRIBUTION.items()
    }
    
    # Ajuster pour s'assurer que la somme est égale à IN_PROGRESS_ORDERS
    total = sum(status_counts.values())
    if total < IN_PROGRESS_ORDERS:
        status_counts['CREATED'] += (IN_PROGRESS_ORDERS - total)
    
    # Générer les commandes par lots
    batch_size = 1000
    orders_created = 0
    
    # 1. Générer les commandes complétées (PACKED)
    print(f"Génération de {COMPLETED_ORDERS} commandes complétées...")
    
    # Répartir les commandes complétées sur la période
    days_between = (END_DATE - START_DATE).days
    
    # Calculer la distribution des commandes par mois
    # Plus de commandes dans les mois récents pour une distribution plus réaliste
    months_between = days_between // 30
    monthly_distribution = []
    
    # Distribution croissante sur la période
    total_weight = 0
    for i in range(months_between):
        # Formule pour augmenter progressivement le poids des mois plus récents
        weight = 1 + (i / months_between) * 2
        monthly_distribution.append(weight)
        total_weight += weight
    
    # Normaliser pour obtenir des pourcentages
    monthly_distribution = [w / total_weight for w in monthly_distribution]
    
    # Calculer le nombre de commandes par mois
    monthly_orders = [int(COMPLETED_ORDERS * pct) for pct in monthly_distribution]
    
    # Ajuster pour s'assurer que la somme est égale à COMPLETED_ORDERS
    diff = COMPLETED_ORDERS - sum(monthly_orders)
    monthly_orders[-1] += diff
    
    # Générer les commandes complétées par mois
    current_date = START_DATE
    order_counter = 0
    
    for month_idx, order_count in enumerate(monthly_orders):
        month_end = current_date + timedelta(days=30)
        if month_end > END_DATE:
            month_end = END_DATE
        
        print(f"Génération de {order_count} commandes pour {current_date.strftime('%B %Y')}...")
        
        current_batch = []
        
        for i in range(order_count):
            # Générer une date aléatoire dans ce mois
            created_at = random_date_between(current_date, month_end)
            
            # Générer les dates des étapes suivantes (toutes complétées)
            prepared_at, controlled_at, packed_at, completed_at = generate_order_dates(created_at, 'PACKED')
            
            # Sélectionner des agents aléatoires pour chaque étape
            creator = random.choice(agents)
            preparer = random.choice(agents)
            controller = random.choice(agents)
            packer = random.choice(agents)
            
            # Créer l'objet Order
            order = Order(
                reference=generate_reference(date=created_at, counter=order_counter),
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
            
            current_batch.append(order)
            order_counter += 1
            
            # Enregistrer le lot lorsqu'il atteint la taille maximale
            if len(current_batch) >= batch_size:
                with transaction.atomic():
                    Order.objects.bulk_create(current_batch)
                
                orders_created += len(current_batch)
                print(f"Progression: {orders_created}/{TOTAL_ORDERS} commandes créées ({(orders_created/TOTAL_ORDERS*100):.1f}%)")
                current_batch = []
        
        # Passer au mois suivant
        current_date = month_end
    
    # Enregistrer les commandes restantes
    if current_batch:
        with transaction.atomic():
            Order.objects.bulk_create(current_batch)
        
        orders_created += len(current_batch)
        print(f"Progression: {orders_created}/{TOTAL_ORDERS} commandes créées ({(orders_created/TOTAL_ORDERS*100):.1f}%)")
    
    # 2. Générer les commandes en cours pour aujourd'hui
    print(f"Génération de {IN_PROGRESS_ORDERS} commandes en cours...")
    
    # Répartition équilibrée des commandes entre les agents
    agent_distribution = {}
    for agent in agents:
        agent_distribution[agent.id] = 0
    
    current_batch = []
    
    for status, count in status_counts.items():
        print(f"Génération de {count} commandes avec le statut {status}...")
        
        for i in range(count):
            # Générer une heure aléatoire pour aujourd'hui
            created_at = TODAY.replace(
                hour=random.randint(8, 17),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            # Générer les dates des étapes suivantes
            prepared_at, controlled_at, packed_at, completed_at = generate_order_dates(created_at, status)
            
            # Sélectionner des agents en fonction de la distribution
            # Trouver l'agent avec le moins de commandes
            creator_id = min(agent_distribution, key=agent_distribution.get)
            creator = next(agent for agent in agents if agent.id == creator_id)
            agent_distribution[creator_id] += 1
            
            # Sélectionner des agents pour les autres étapes
            if status in ['PREPARED', 'CONTROLLED']:
                preparer_id = min(agent_distribution, key=agent_distribution.get)
                preparer = next(agent for agent in agents if agent.id == preparer_id)
                agent_distribution[preparer_id] += 1
            else:
                preparer = None
                
            if status == 'CONTROLLED':
                controller_id = min(agent_distribution, key=agent_distribution.get)
                controller = next(agent for agent in agents if agent.id == controller_id)
                agent_distribution[controller_id] += 1
            else:
                controller = None
            
            # Créer l'objet Order
            order = Order(
                reference=generate_reference(date=created_at, counter=COMPLETED_ORDERS + i),
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
            
            current_batch.append(order)
            
            # Enregistrer le lot lorsqu'il atteint la taille maximale
            if len(current_batch) >= batch_size:
                with transaction.atomic():
                    Order.objects.bulk_create(current_batch)
                
                orders_created += len(current_batch)
                print(f"Progression: {orders_created}/{TOTAL_ORDERS} commandes créées ({(orders_created/TOTAL_ORDERS*100):.1f}%)")
                current_batch = []
    
    # Enregistrer les commandes restantes
    if current_batch:
        with transaction.atomic():
            Order.objects.bulk_create(current_batch)
        
        orders_created += len(current_batch)
        print(f"Progression: {orders_created}/{TOTAL_ORDERS} commandes créées ({(orders_created/TOTAL_ORDERS*100):.1f}%)")
    
    # Vérifier les statistiques finales
    total_count = Order.objects.count()
    completed_count = Order.objects.filter(status='PACKED').count()
    created_count = Order.objects.filter(status='CREATED').count()
    prepared_count = Order.objects.filter(status='PREPARED').count()
    controlled_count = Order.objects.filter(status='CONTROLLED').count()
    
    # Statistiques par agent
    agent_stats = {}
    for agent in agents:
        created = Order.objects.filter(creator=agent).count()
        prepared = Order.objects.filter(preparer=agent).count()
        controlled = Order.objects.filter(controller=agent).count()
        packed = Order.objects.filter(packer=agent).count()
        
        agent_stats[agent.username] = {
            'created': created,
            'prepared': prepared,
            'controlled': controlled,
            'packed': packed,
            'total': created + prepared + controlled + packed
        }
    
    print("\nStatistiques finales:")
    print(f"Total des commandes: {total_count}")
    print(f"Commandes complétées: {completed_count}")
    print(f"Commandes en cours: {total_count - completed_count}")
    print(f"  - CREATED: {created_count}")
    print(f"  - PREPARED: {prepared_count}")
    print(f"  - CONTROLLED: {controlled_count}")
    
    print("\nStatistiques par agent:")
    for username, stats in agent_stats.items():
        print(f"Agent {username}:")
        print(f"  - Commandes créées: {stats['created']}")
        print(f"  - Commandes préparées: {stats['prepared']}")
        print(f"  - Commandes contrôlées: {stats['controlled']}")
        print(f"  - Commandes emballées: {stats['packed']}")
        print(f"  - Total des actions: {stats['total']}")

if __name__ == "__main__":
    main()
