from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        max_length=128,
        min_length=1,
        write_only=True
    )
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role')
        read_only_fields = ('id',)
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    token = serializers.CharField(max_length=255, read_only=True)
    
    def validate(self, data):
        username = data.get('username', None)
        password = data.get('password', None)
        
        if username is None:
            raise serializers.ValidationError(
                'Un nom d\'utilisateur est requis pour se connecter.'
            )
        
        if password is None:
            raise serializers.ValidationError(
                'Un mot de passe est requis pour se connecter.'
            )
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise serializers.ValidationError(
                'Nom d\'utilisateur ou mot de passe incorrect.'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'Cet utilisateur a été désactivé.'
            )
        
        return {
            'username': user.username,
            'token': user.id
        }
