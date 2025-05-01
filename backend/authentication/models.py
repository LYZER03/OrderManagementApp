from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('AGENT', 'Agent'),
        ('SUPER_AGENT', 'Super Agent'),
        ('MANAGER', 'Manager'),
    )
    
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='AGENT')
    
    def is_agent(self):
        return self.role == 'AGENT'
    
    def is_manager(self):
        return self.role == 'MANAGER'
    
    def is_super_agent(self):
        return self.role == 'SUPER_AGENT'
