import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'order_management.settings')
django.setup()

from orders.models import Order
from django.db import transaction

def main():
    try:
        with transaction.atomic():
            # Compter les commandes avant suppression
            count_before = Order.objects.count()
            print(f"Nombre de commandes avant suppression: {count_before}")
            
            # Supprimer toutes les commandes
            Order.objects.all().delete()
            
            # Vérifier que toutes les commandes ont été supprimées
            count_after = Order.objects.count()
            print(f"Nombre de commandes après suppression: {count_after}")
            
            print(f"Suppression réussie: {count_before - count_after} commandes supprimées.")
    except Exception as e:
        print(f"Erreur lors de la suppression des commandes: {e}")

if __name__ == "__main__":
    main()
