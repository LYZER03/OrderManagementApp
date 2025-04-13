from django.shortcuts import render, get_object_or_404
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import User
from django.contrib.auth.hashers import make_password

# Create your views here.
class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = User.objects.get(username=serializer.validated_data['username'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Only managers can see the list of users
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().order_by('username')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Only managers can create users
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)
    
    def get(self, request, pk):
        # Only managers can view user details
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def put(self, request, pk):
        # Only managers can update users
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object(pk)
        data = request.data.copy()
        
        # Handle password separately
        if 'password' in data and data['password']:
            password = data.pop('password')
            user.password = make_password(password)
            user.save()
        
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        # Only managers can delete users
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent self-deletion
        if int(pk) == request.user.id:
            return Response({"error": "Vous ne pouvez pas supprimer votre propre compte"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserRoleView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def patch(self, request, pk):
        # Only managers can change roles
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, pk=pk)
        
        # Prevent changing own role
        if user.id == request.user.id:
            return Response({"error": "Vous ne pouvez pas modifier votre propre rôle"}, status=status.HTTP_400_BAD_REQUEST)
        
        role = request.data.get('role')
        if not role or role not in [r[0] for r in User.ROLE_CHOICES]:
            return Response({"error": "Rôle invalide"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.role = role
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data)


class UserPasswordResetView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, pk):
        # Only managers can reset passwords
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, pk=pk)
        password = request.data.get('password')
        
        if not password or len(password) < 8:
            return Response({"error": "Le mot de passe doit contenir au moins 8 caractères"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.password = make_password(password)
        user.save()
        
        return Response({"message": "Mot de passe réinitialisé avec succès"}, status=status.HTTP_200_OK)
