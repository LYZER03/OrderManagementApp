#!/usr/bin/env python
"""
Script pour nettoyer la table des commandes (orders_order) dans la base de données.
Ce script permet de supprimer toutes les commandes ou de les filtrer selon certains critères.
"""

import os
import sys
import django
import datetime
import argparse
from django.utils import timezone

# Configurer l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Importer les modèles après la configuration de Django
from orders.models import Order
from authentication.models import User

def delete_all_orders():
    """Supprime toutes les commandes de la base de données."""
    count = Order.objects.count()
    Order.objects.all().delete()
    print(f"✅ {count} commandes ont été supprimées avec succès.")

def delete_orders_by_date(before_date=None, after_date=None):
    """
    Supprime les commandes créées avant ou après une date spécifique.
    
    Args:
        before_date (str): Supprimer les commandes créées avant cette date (format: YYYY-MM-DD)
        after_date (str): Supprimer les commandes créées après cette date (format: YYYY-MM-DD)
    """
    queryset = Order.objects.all()
    
    if before_date:
        date_obj = datetime.datetime.strptime(before_date, '%Y-%m-%d').date()
        queryset = queryset.filter(created_at__date__lt=date_obj)
    
    if after_date:
        date_obj = datetime.datetime.strptime(after_date, '%Y-%m-%d').date()
        queryset = queryset.filter(created_at__date__gt=date_obj)
    
    count = queryset.count()
    queryset.delete()
    
    date_info = ""
    if before_date:
        date_info += f" créées avant le {before_date}"
    if after_date:
        date_info += f" créées après le {after_date}"
    
    print(f"✅ {count} commandes{date_info} ont été supprimées avec succès.")

def delete_orders_by_status(status):
    """
    Supprime les commandes ayant un statut spécifique.
    
    Args:
        status (str): Statut des commandes à supprimer (CREATED, PREPARED, CONTROLLED, PACKED)
    """
    status = status.upper()
    valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
    
    if status not in valid_statuses:
        print(f"❌ Statut invalide. Les statuts valides sont: {', '.join(valid_statuses)}")
        return
    
    count = Order.objects.filter(status=status).count()
    Order.objects.filter(status=status).delete()
    print(f"✅ {count} commandes avec le statut '{status}' ont été supprimées avec succès.")

def keep_only_today_orders():
    """Conserve uniquement les commandes créées aujourd'hui et supprime toutes les autres."""
    today = timezone.now().date()
    count = Order.objects.exclude(created_at__date=today).count()
    Order.objects.exclude(created_at__date=today).delete()
    print(f"✅ {count} commandes non créées aujourd'hui ont été supprimées.")
    remaining = Order.objects.count()
    print(f"📊 {remaining} commandes d'aujourd'hui ont été conservées.")

def create_test_orders(count=10):
    """
    Crée des commandes de test pour aujourd'hui.
    
    Args:
        count (int): Nombre de commandes à créer
    """
    # Récupérer les agents
    agents = User.objects.filter(role='AGENT')
    if not agents.exists():
        print("❌ Aucun agent trouvé dans la base de données. Impossible de créer des commandes.")
        return
    
    # Créer les commandes
    orders_created = 0
    statuses = [choice[0] for choice in Order.STATUS_CHOICES]
    
    for i in range(count):
        # Choisir un agent aléatoirement
        agent_index = i % agents.count()
        agent = agents[agent_index]
        
        # Choisir un statut aléatoirement
        status_index = i % len(statuses)
        status = statuses[status_index]
        
        # Créer une référence unique
        reference = f"TEST-{timezone.now().strftime('%Y%m%d')}-{i+1:03d}"
        
        # Créer la commande
        order = Order.objects.create(
            reference=reference,
            status=status,
            creator=agent
        )
        
        # Mettre à jour les timestamps en fonction du statut
        now = timezone.now()
        
        if status in ['PREPARED', 'CONTROLLED', 'PACKED']:
            order.prepared_at = now - datetime.timedelta(minutes=30)
            order.preparer = agent
        
        if status in ['CONTROLLED', 'PACKED']:
            order.controlled_at = now - datetime.timedelta(minutes=20)
            order.controller = agent
        
        if status == 'PACKED':
            order.packed_at = now - datetime.timedelta(minutes=10)
            order.packer = agent
        
        order.save()
        orders_created += 1
    
    print(f"✅ {orders_created} commandes de test ont été créées avec succès.")

def show_order_stats():
    """Affiche des statistiques sur les commandes dans la base de données."""
    total_count = Order.objects.count()
    
    if total_count == 0:
        print("📊 Aucune commande dans la base de données.")
        return
    
    # Compter par statut
    status_counts = {}
    for status_choice in Order.STATUS_CHOICES:
        status_code = status_choice[0]
        count = Order.objects.filter(status=status_code).count()
        status_counts[status_choice[1]] = count
    
    # Compter par date
    today = timezone.now().date()
    today_count = Order.objects.filter(created_at__date=today).count()
    yesterday = today - datetime.timedelta(days=1)
    yesterday_count = Order.objects.filter(created_at__date=yesterday).count()
    this_month = Order.objects.filter(created_at__date__month=today.month, created_at__date__year=today.year).count()
    
    # Afficher les statistiques
    print("\n📊 STATISTIQUES DES COMMANDES 📊")
    print(f"Nombre total de commandes: {total_count}")
    print("\nPar statut:")
    for status, count in status_counts.items():
        print(f"  - {status}: {count} ({round(count/total_count*100, 1)}%)")
    
    print("\nPar période:")
    print(f"  - Aujourd'hui: {today_count}")
    print(f"  - Hier: {yesterday_count}")
    print(f"  - Ce mois-ci: {this_month}")
    
    # Afficher les 5 commandes les plus récentes
    print("\nCommandes les plus récentes:")
    recent_orders = Order.objects.order_by('-created_at')[:5]
    for order in recent_orders:
        print(f"  - {order.reference} ({order.status}) créée le {order.created_at.strftime('%Y-%m-%d %H:%M')}")

def main():
    parser = argparse.ArgumentParser(description='Outil de nettoyage de la table des commandes')
    
    # Créer un groupe d'arguments mutuellement exclusifs
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--all', action='store_true', help='Supprimer toutes les commandes')
    group.add_argument('--before', type=str, help='Supprimer les commandes créées avant une date (format: YYYY-MM-DD)')
    group.add_argument('--after', type=str, help='Supprimer les commandes créées après une date (format: YYYY-MM-DD)')
    group.add_argument('--status', type=str, help='Supprimer les commandes avec un statut spécifique')
    group.add_argument('--keep-today', action='store_true', help='Conserver uniquement les commandes créées aujourd\'hui')
    group.add_argument('--create-test', type=int, nargs='?', const=10, help='Créer des commandes de test (nombre par défaut: 10)')
    group.add_argument('--stats', action='store_true', help='Afficher des statistiques sur les commandes')
    
    args = parser.parse_args()
    
    # Confirmation avant suppression
    if args.all or args.before or args.after or args.status or args.keep_today:
        confirm = input("⚠️ Cette opération va supprimer des commandes de la base de données. Continuer? (o/n): ")
        if confirm.lower() != 'o':
            print("Opération annulée.")
            return
    
    # Exécuter l'action demandée
    if args.all:
        delete_all_orders()
    elif args.before:
        delete_orders_by_date(before_date=args.before)
    elif args.after:
        delete_orders_by_date(after_date=args.after)
    elif args.status:
        delete_orders_by_status(args.status)
    elif args.keep_today:
        keep_only_today_orders()
    elif args.create_test is not None:
        create_test_orders(args.create_test)
    elif args.stats:
        show_order_stats()

if __name__ == "__main__":
    main()
