#!/usr/bin/env python
"""
Script pour supprimer toutes les commandes de la base de données.
Utilisation: python delete_all_orders.py
"""

import os
import django

# Configurer l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'order_management.settings')
django.setup()

# Importer le modèle Order après la configuration de Django
from orders.models import Order

def delete_all_orders():
    """Supprime toutes les commandes de la base de données."""
    count = Order.objects.count()
    Order.objects.all().delete()
    print(f"✅ {count} commandes ont été supprimées avec succès.")

if __name__ == "__main__":
    # Demander confirmation avant de supprimer
    confirm = input("⚠️ Cette opération va supprimer TOUTES les commandes de la base de données. Continuer? (o/n): ")
    if confirm.lower() == 'o':
        delete_all_orders()
    else:
        print("Opération annulée.")
