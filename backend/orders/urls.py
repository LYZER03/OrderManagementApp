from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView,
    PreparationView, ControlView, PackingView,
    DashboardView
)

urlpatterns = [
    # Basic order management
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    
    # Module-specific endpoints
    path('preparation/', PreparationView.as_view(), name='preparation-list'),
    path('preparation/<int:pk>/validate/', PreparationView.as_view(), name='preparation-validate'),
    
    path('control/', ControlView.as_view(), name='control-list'),
    path('control/<int:pk>/validate/', ControlView.as_view(), name='control-validate'),
    
    path('packing/', PackingView.as_view(), name='packing-list'),
    path('packing/<int:pk>/validate/', PackingView.as_view(), name='packing-validate'),
    
    # Dashboard for managers
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
