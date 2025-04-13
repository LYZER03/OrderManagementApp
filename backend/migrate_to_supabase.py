import os
import django
import sys
import time

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'order_management.settings')
django.setup()

from django.db import connections
from django.db.utils import OperationalError
from django.core.management import call_command
from authentication.models import User
from orders.models import Order

def check_database_connection():
    """Vérifie si la connexion à la base de données PostgreSQL est établie"""
    try:
        db_conn = connections['default']
        db_conn.cursor()
        print("✅ Connexion à la base de données PostgreSQL établie avec succès!")
        return True
    except OperationalError as e:
        print(f"❌ Erreur de connexion à la base de données: {e}")
        return False

def run_migrations():
    """Exécute les migrations Django"""
    print("\n🔄 Exécution des migrations...")
    try:
        call_command('migrate')
        print("✅ Migrations terminées avec succès!")
        return True
    except Exception as e:
        print(f"❌ Erreur lors des migrations: {e}")
        return False

def create_superuser():
    """Crée un superutilisateur si aucun n'existe"""
    if User.objects.filter(is_superuser=True).exists():
        print("👤 Un superutilisateur existe déjà")
        return
    
    print("\n🔑 Création d'un superutilisateur...")
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'
    
    try:
        User.objects.create_superuser(username=username, email=email, password=password, role='MANAGER')
        print(f"✅ Superutilisateur '{username}' créé avec succès!")
    except Exception as e:
        print(f"❌ Erreur lors de la création du superutilisateur: {e}")

def create_test_users():
    """Crée des utilisateurs de test si nécessaire"""
    if User.objects.filter(username='manager').exists():
        print("👥 Des utilisateurs de test existent déjà")
        return
    
    print("\n👥 Création des utilisateurs de test...")
    try:
        # Créer un manager
        User.objects.create_user(username='manager', email='manager@example.com', 
                                password='password123', role='MANAGER')
        
        # Créer 5 agents
        for i in range(1, 6):
            User.objects.create_user(username=f'agent{i}', email=f'agent{i}@example.com', 
                                    password='password123', role='AGENT')
        
        print(f"✅ Utilisateurs de test créés avec succès!")
    except Exception as e:
        print(f"❌ Erreur lors de la création des utilisateurs de test: {e}")

def check_data_status():
    """Affiche des statistiques sur les données migrées"""
    user_count = User.objects.count()
    order_count = Order.objects.count()
    
    print("\n📊 Statistiques des données:")
    print(f"👤 Nombre d'utilisateurs: {user_count}")
    print(f"📦 Nombre de commandes: {order_count}")
    
    # Statistiques des commandes par statut
    if order_count > 0:
        statuses = Order.objects.values('status').distinct()
        print("\n📊 Répartition des commandes par statut:")
        for status in statuses:
            status_name = status['status']
            count = Order.objects.filter(status=status_name).count()
            percentage = (count / order_count) * 100
            print(f"  - {status_name}: {count} ({percentage:.1f}%)")

def main():
    print("=" * 80)
    print("🚀 MIGRATION VERS SUPABASE POSTGRESQL")
    print("=" * 80)
    
    # Vérifier la connexion à la base de données
    if not check_database_connection():
        print("\n❌ Impossible de se connecter à la base de données PostgreSQL.")
        print("   Vérifiez vos paramètres de connexion dans le fichier .env")
        print("   Format attendu: DATABASE_URL=postgres://postgres:password@db.project-id.supabase.co:5432/postgres")
        sys.exit(1)
    
    # Exécuter les migrations
    if not run_migrations():
        print("\n❌ Échec des migrations. Correction nécessaire avant de continuer.")
        sys.exit(1)
    
    # Créer un superutilisateur
    create_superuser()
    
    # Créer des utilisateurs de test
    create_test_users()
    
    # Vérifier l'état des données
    check_data_status()
    
    print("\n✅ Migration terminée avec succès!")
    print("   Vous pouvez maintenant exécuter le script generate_realistic_dataset.py")
    print("   pour générer des données de test réalistes dans votre base PostgreSQL.")

if __name__ == "__main__":
    main()
