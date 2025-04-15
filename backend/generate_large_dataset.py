import os
import django
import random
import string
from datetime import datetime, timedelta
from django.utils import timezone

# Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'order_management.settings')
django.setup()

# Import des modèles après la configuration de Django
from orders.models import Order
from authentication.models import User

def generate_reference():
    """Génère une référence unique pour une commande."""
    prefix = random.choice(['CMD', 'ORD', 'REF'])
    numbers = ''.join(random.choices(string.digits, k=6))
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    return f"{prefix}-{numbers}-{letters}"

def generate_cart_number():
    """Génère un numéro de chariot."""
    prefix = random.choice(['CART', 'CH', 'TR'])
    numbers = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{numbers}"

def get_random_date(start_date, end_date):
    """Génère une date aléatoire entre start_date et end_date avec une distribution réaliste."""
    time_delta = end_date - start_date
    total_days = time_delta.days
    
    # Utiliser une distribution qui favorise certaines périodes
    # Cela crée une tendance à la hausse avec des pics saisonniers
    
    # Distribution de base - légèrement croissante dans le temps
    weight = random.triangular(0, total_days, total_days * 0.7)
    
    # Ajouter des variations saisonnières
    month_factor = {
        1: 0.8,  # Janvier (après les fêtes)
        2: 0.7,  # Février
        3: 0.9,  # Mars
        4: 1.0,  # Avril
        5: 1.1,  # Mai
        6: 1.0,  # Juin
        7: 0.7,  # Juillet (vacances)
        8: 0.6,  # Août (vacances)
        9: 1.2,  # Septembre (rentrée)
        10: 1.3, # Octobre
        11: 1.4, # Novembre (avant fêtes)
        12: 1.5  # Décembre (fêtes)
    }
    
    # Appliquer la distribution
    random_days = int(weight)
    # Limiter à l'intervalle valide
    random_days = max(0, min(random_days, total_days))
    
    # Générer la date de base
    date = start_date + timedelta(days=random_days)
    
    # Ajuster en fonction du facteur mensuel
    if random.random() < month_factor[date.month] / 1.5:  # Normaliser par le max
        # Garder cette date (plus probable pour les mois à forte activité)
        pass
    else:
        # Réessayer pour les mois à faible activité (peut donner un autre mois)
        new_weight = random.triangular(0, total_days, total_days * 0.7)
        random_days = int(new_weight)
        random_days = max(0, min(random_days, total_days))
        date = start_date + timedelta(days=random_days)
    
    # Ajouter des heures aléatoires - plus de commandes pendant les heures de travail
    hour = random.choices(
        range(24),
        weights=[1, 1, 1, 1, 1, 2, 5, 10, 15, 20, 20, 15, 10, 15, 20, 20, 15, 10, 5, 3, 2, 2, 1, 1]
    )[0]
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    
    # Créer une date sans fuseau horaire
    naive_datetime = datetime.combine(
        date.date(),
        datetime.min.time().replace(hour=hour, minute=minute, second=second)
    )
    # Convertir en date avec fuseau horaire
    return timezone.make_aware(naive_datetime)

def generate_large_dataset(num_orders=50000, include_today=True):
    """Génère un grand jeu de données de commandes.
    
    Args:
        num_orders (int): Nombre de commandes historiques à générer
        include_today (bool): Si True, ajoute 200 commandes terminées pour aujourd'hui
    """
    print(f"Début de la génération de {num_orders} commandes historiques...")
    
    # Dates de début et de fin
    start_date = timezone.make_aware(datetime(2023, 1, 1))
    # Définir la date de fin comme étant 7 jours avant aujourd'hui
    end_date = timezone.now() - timedelta(days=7)
    
    # Récupérer tous les utilisateurs
    agents = list(User.objects.filter(role='AGENT'))
    managers = list(User.objects.filter(role='MANAGER'))
    all_users = agents + managers
    
    if not agents:
        print("Erreur: Aucun agent trouvé dans la base de données.")
        return
    
    # Toutes les commandes auront le statut PACKED (terminé)
    statuses = {
        'PACKED': 1.0,  # 100% des commandes sont terminées
    }
    
    # Compteurs pour les statistiques
    status_counts = {status: 0 for status in statuses}
    monthly_counts = {}
    
    # Créer les commandes
    batch_size = 1000
    orders_to_create = []
    
    for i in range(1, num_orders + 1):
        # Générer une date de création aléatoire
        created_at = get_random_date(start_date, end_date)
        
        # Compter par mois
        month_key = f"{created_at.year}-{created_at.month:02d}"
        if month_key not in monthly_counts:
            monthly_counts[month_key] = 0
        monthly_counts[month_key] += 1
        
        # Choisir un statut basé sur les probabilités
        status = random.choices(list(statuses.keys()), weights=list(statuses.values()))[0]
        status_counts[status] += 1
        
        # Choisir des utilisateurs aléatoires pour chaque rôle
        creator = random.choice(all_users)
        
        # Initialiser les champs qui dépendent du statut
        preparer = None
        controller = None
        packer = None
        prepared_at = None
        controlled_at = None
        packed_at = None
        completed_at = None
        
        # Comme toutes les commandes sont PACKED, définir tous les temps de traitement
        # Choisir des agents aléatoires pour chaque étape
        preparer = random.choice(agents)
        controller = random.choice(agents)
        packer = random.choice(agents)
        
        # La préparation prend entre 10 et 60 minutes
        preparation_time = timedelta(minutes=random.randint(10, 60))
        prepared_at = created_at + preparation_time
        
        # Le contrôle prend entre 5 et 30 minutes
        control_time = timedelta(minutes=random.randint(5, 30))
        controlled_at = prepared_at + control_time
        
        # L'emballage prend entre 10 et 45 minutes
        packing_time = timedelta(minutes=random.randint(10, 45))
        packed_at = controlled_at + packing_time
        
        # 80% des commandes emballées sont également complétées
        if random.random() < 0.8:
            completed_at = packed_at + timedelta(minutes=random.randint(1, 10))
        
        # Créer l'objet commande avec la date de création spécifiée
        order = Order(
            reference=generate_reference(),
            status=status,
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
        
        orders_to_create.append(order)
        
        # Enregistrer par lots pour optimiser les performances
        if len(orders_to_create) >= batch_size:
            Order.objects.bulk_create(orders_to_create)
            orders_to_create = []
            print(f"Progression: {i}/{num_orders} commandes historiques générées.")
    
    # Enregistrer les commandes restantes
    if orders_to_create:
        Order.objects.bulk_create(orders_to_create)
    
    # Afficher les statistiques des commandes historiques
    print("\nStatistiques de génération des commandes historiques:")
    print(f"Total des commandes historiques générées: {num_orders}")
    
    # Afficher les statistiques par statut uniquement si des commandes historiques ont été générées
    if num_orders > 0:
        print("\nRépartition par statut:")
        for status, count in status_counts.items():
            percentage = (count / num_orders) * 100
            print(f"  {status}: {count} ({percentage:.1f}%)")
        
        print("\nRépartition par mois:")
        for month, count in sorted(monthly_counts.items()):
            print(f"  {month}: {count} commandes")
    
    # Générer 200 commandes terminées pour aujourd'hui si demandé
    if include_today:
        print("\nGénération de 200 commandes terminées pour aujourd'hui...")
        today_orders = []
        today = timezone.now()
        
        for i in range(1, 201):
            # Générer une heure aléatoire aujourd'hui (entre minuit et maintenant)
            hours_ago = random.uniform(0, today.hour + today.minute/60)
            created_at = today - timedelta(hours=hours_ago)
            
            # Choisir des agents aléatoires
            creator = random.choice(all_users)
            preparer = random.choice(agents)
            controller = random.choice(agents)
            packer = random.choice(agents)
            
            # Calculer les temps de traitement (plus courts pour les commandes d'aujourd'hui)
            prepared_at = created_at + timedelta(minutes=random.randint(5, 30))
            controlled_at = prepared_at + timedelta(minutes=random.randint(3, 15))
            packed_at = controlled_at + timedelta(minutes=random.randint(5, 20))
            completed_at = packed_at + timedelta(minutes=random.randint(1, 5))
            
            # S'assurer que toutes les dates sont antérieures à maintenant
            now = timezone.now()
            if completed_at > now:
                completed_at = now
                packed_at = now - timedelta(minutes=random.randint(1, 5))
                controlled_at = packed_at - timedelta(minutes=random.randint(3, 10))
                prepared_at = controlled_at - timedelta(minutes=random.randint(5, 15))
                created_at = prepared_at - timedelta(minutes=random.randint(5, 20))
            
            # Créer la commande terminée
            order = Order(
                reference=f"TODAY-{i:03d}-{generate_reference()}",
                status="PACKED",  # Toutes les commandes sont terminées
                cart_number=generate_cart_number(),
                line_count=random.randint(1, 30),
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
            
            today_orders.append(order)
            
            # Enregistrer par lots
            if len(today_orders) >= 50:
                Order.objects.bulk_create(today_orders)
                today_orders = []
                print(f"Progression: {i}/200 commandes d'aujourd'hui générées.")
        
        # Enregistrer les commandes restantes
        if today_orders:
            Order.objects.bulk_create(today_orders)
        
        print("\n✅ 200 commandes terminées ont été générées pour aujourd'hui.")
    
    print("\nGénération terminée avec succès!")

if __name__ == "__main__":
    # Vérifier si des commandes existent déjà
    existing_count = Order.objects.count()
    if existing_count > 0:
        print(f"ATTENTION: {existing_count} commandes existent déjà dans la base de données.")
        confirmation = input("Voulez-vous continuer et ajouter des commandes supplémentaires? (o/n): ")
        if confirmation.lower() != 'o':
            print("Opération annulée.")
            exit()
    
    # Options pour la génération
    generate_historical = input("Voulez-vous générer des commandes historiques? (o/n): ")
    num_historical = 0
    if generate_historical.lower() == 'o':
        num_input = input("Combien de commandes historiques voulez-vous générer? [50000]: ")
        num_historical = int(num_input) if num_input.strip() else 50000
    
    generate_today = input("Voulez-vous générer 200 commandes terminées pour aujourd'hui? (o/n): ")
    include_today = generate_today.lower() == 'o'
    
    if not num_historical and not include_today:
        print("Aucune commande à générer. Opération annulée.")
        exit()
    
    # Générer les données
    generate_large_dataset(num_historical, include_today)
