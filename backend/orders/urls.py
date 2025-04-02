from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView,
    PreparationView, ControlView, PackingView,
    DashboardView, OrderReferenceView
)

urlpatterns = [
    # Basic order management
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('reference/<str:reference>/', OrderReferenceView.as_view(), name='order-by-reference'),
    
    # Module-specific endpoints
    path('preparation/', PreparationView.as_view(), name='preparation-list'),
    path('<int:pk>/prepare/', PreparationView.as_view(), name='preparation-validate'),
    
    path('control/', ControlView.as_view(), name='control-list'),
    path('<int:pk>/control/', ControlView.as_view(), name='control-validate'),
    
    path('packing/', PackingView.as_view(), name='packing-list'),
    path('<int:pk>/pack/', PackingView.as_view(), name='packing-validate'),
    
    # Dashboard for managers
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
