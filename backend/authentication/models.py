from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('AGENT', 'Agent'),
        ('MANAGER', 'Manager'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='AGENT')
    
    def is_agent(self):
        return self.role == 'AGENT'
    
    def is_manager(self):
        return self.role == 'MANAGER'
