from django.db import models
from authentication.models import User

# Create your models here.
class Order(models.Model):
    STATUS_CHOICES = (
        ('CREATED', 'Créée'),
        ('PREPARED', 'Préparée'),
        ('CONTROLLED', 'Contrôlée'),
        ('PACKED', 'Emballée'),
        ('COMPLETED', 'Terminée'),
    )
    
    reference = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED')
    cart_number = models.CharField(max_length=50, verbose_name="Numéro de chariot")
    
    # Nombre de lignes (articles) dans la commande
    line_count = models.PositiveIntegerField(null=True, blank=True, verbose_name="Nombre de lignes")
    
    # User relationships
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_orders')
    preparer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='prepared_orders')
    controller = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='controlled_orders')
    packer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='packed_orders')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    prepared_at = models.DateTimeField(null=True, blank=True)
    controlled_at = models.DateTimeField(null=True, blank=True)
    packed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def preparation_time(self):
        if self.prepared_at and self.created_at:
            return (self.prepared_at - self.created_at).total_seconds() / 60
        return None
    
    def control_time(self):
        if self.controlled_at and self.prepared_at:
            return (self.controlled_at - self.prepared_at).total_seconds() / 60
        return None
    
    def packing_time(self):
        if self.packed_at and self.controlled_at:
            return (self.packed_at - self.controlled_at).total_seconds() / 60
        return None
    
    def total_time(self):
        if self.completed_at and self.created_at:
            return (self.completed_at - self.created_at).total_seconds() / 60
        return None
    
    def __str__(self):
        return f"Commande {self.reference} ({self.get_status_display()})"
