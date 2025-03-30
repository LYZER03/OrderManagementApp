import os
import django
import random
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'order_management.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from orders.models import Order

User = get_user_model()

def create_test_users():
    """Create test users with different roles"""
    # Create manager users
    if not User.objects.filter(username='manager1').exists():
        User.objects.create_user(
            username='manager1',
            email='manager1@example.com',
            password='password123',
            first_name='Jean',
            last_name='Dupont',
            role='MANAGER',
            is_staff=True
        )
    
    if not User.objects.filter(username='manager2').exists():
        User.objects.create_user(
            username='manager2',
            email='manager2@example.com',
            password='password123',
            first_name='Marie',
            last_name='Martin',
            role='MANAGER',
            is_staff=True
        )
    
    # Create agent users
    agent_data = [
        {'username': 'agent1', 'first_name': 'Pierre', 'last_name': 'Bernard'},
        {'username': 'agent2', 'first_name': 'Sophie', 'last_name': 'Dubois'},
        {'username': 'agent3', 'first_name': 'Thomas', 'last_name': 'Petit'},
        {'username': 'agent4', 'first_name': 'Julie', 'last_name': 'Robert'},
        {'username': 'agent5', 'first_name': 'Nicolas', 'last_name': 'Richard'},
    ]
    
    for data in agent_data:
        if not User.objects.filter(username=data['username']).exists():
            User.objects.create_user(
                username=data['username'],
                email=f"{data['username']}@example.com",
                password='password123',
                first_name=data['first_name'],
                last_name=data['last_name'],
                role='AGENT'
            )
    
    print(f"Created {User.objects.filter(role='MANAGER').count()} managers and {User.objects.filter(role='AGENT').count()} agents")

def create_test_orders():
    """Create test orders with different statuses and timestamps"""
    # Get users
    managers = User.objects.filter(role='MANAGER')
    agents = User.objects.filter(role='AGENT')
    
    if not managers or not agents:
        print("No users found. Please run create_test_users() first.")
        return
    
    # Create orders with different statuses
    order_statuses = {
        'CREATED': 20,    # 20 orders in CREATED status
        'PREPARED': 15,   # 15 orders in PREPARED status
        'CONTROLLED': 10, # 10 orders in CONTROLLED status
        'PACKED': 30,     # 30 orders in PACKED (completed) status
    }
    
    # Clear existing orders
    Order.objects.all().delete()
    
    current_time = timezone.now()
    order_count = 0
    
    for status, count in order_statuses.items():
        for i in range(count):
            # Generate a unique reference
            reference = f"CMD-{order_count+1:04d}"
            cart_number = f"CART-{random.randint(100, 999)}"
            
            # Select random users for each role
            creator = random.choice(agents)
            preparer = random.choice(agents) if status != 'CREATED' else None
            controller = random.choice(agents) if status in ['CONTROLLED', 'PACKED'] else None
            packer = random.choice(agents) if status == 'PACKED' else None
            
            # Create timestamps based on status
            created_at = current_time - timedelta(hours=random.randint(24, 240))
            prepared_at = created_at + timedelta(minutes=random.randint(30, 120)) if status != 'CREATED' else None
            controlled_at = prepared_at + timedelta(minutes=random.randint(15, 60)) if status in ['CONTROLLED', 'PACKED'] else None
            packed_at = controlled_at + timedelta(minutes=random.randint(15, 45)) if status == 'PACKED' else None
            completed_at = packed_at if status == 'PACKED' else None
            
            # Create the order
            Order.objects.create(
                reference=reference,
                status=status,
                cart_number=cart_number,
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
            
            order_count += 1
    
    print(f"Created {order_count} test orders")

if __name__ == '__main__':
    print("Creating test data...")
    create_test_users()
    create_test_orders()
    print("Test data creation completed!")
