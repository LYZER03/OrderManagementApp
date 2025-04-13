from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserView, UserListView,
    UserDetailView, UserRoleView, UserPasswordResetView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserView.as_view(), name='user'),
    path('users/', UserListView.as_view(), name='users'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/role/', UserRoleView.as_view(), name='user_role'),
    path('users/<int:pk>/reset-password/', UserPasswordResetView.as_view(), name='user_reset_password'),
]
