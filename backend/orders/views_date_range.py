from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer
from authentication.models import User
from django.db.models import Q, Count
from rest_framework.decorators import permission_classes

# Vue pour gérer les commandes avec filtrage par plage de dates
class OrderListCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Définir la plage de dates pour le filtrage
        today = timezone.now().date()
        start_date = today
        end_date = today + timedelta(days=1)
        
        # Vérifier si des paramètres de plage de dates sont fournis
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')
        date_param = request.query_params.get('date', 'today')
        creator_id = request.query_params.get('creator_id')
        
        # Journaliser les paramètres reçus pour débogage
        print(f"Paramètres reçus: date={date_param}, start_date={start_date_param}, end_date={end_date_param}, creator_id={creator_id}")
        
        # Traiter les paramètres de plage de dates s'ils sont fournis
        if start_date_param:
            try:
                start_date = timezone.datetime.strptime(start_date_param, '%Y-%m-%d').date()
            except ValueError:
                # En cas d'erreur de format, utiliser la date par défaut
                pass
            
        if end_date_param:
            try:
                # Ajouter un jour à end_date pour inclure tous les événements de ce jour
                end_date = timezone.datetime.strptime(end_date_param, '%Y-%m-%d').date() + timedelta(days=1)
            except ValueError:
                # En cas d'erreur de format, utiliser la date par défaut
                if start_date != today:  # Si start_date a été modifié
                    end_date = start_date + timedelta(days=1)
        
        # Traiter le paramètre 'yesterday'
        elif date_param == 'yesterday':
            # Définir la plage de dates pour hier
            start_date = today - timedelta(days=1)
            end_date = today
            print(f"Paramètre 'yesterday' détecté: filtrage du {start_date} au {end_date}")
            
        # Traiter le paramètre 'week'
        elif date_param == 'week':
            # Pour la semaine, commencer 7 jours avant aujourd'hui
            start_date = today - timedelta(days=6)  # 7 jours incluant aujourd'hui
            end_date = today + timedelta(days=1)    # Jusqu'à la fin d'aujourd'hui
            print(f"Paramètre 'week' détecté: filtrage du {start_date} au {end_date}")
            
        # Traiter le paramètre 'month'
        elif date_param == 'month':
            # Pour le mois, commencer 30 jours avant aujourd'hui
            start_date = today - timedelta(days=29)  # 30 jours incluant aujourd'hui
            end_date = today + timedelta(days=1)     # Jusqu'à la fin d'aujourd'hui
            print(f"Paramètre 'month' détecté: filtrage du {start_date} au {end_date}")
            
        # Si un paramètre de date spécifique est fourni (et pas de plage de dates)
        elif date_param != 'today' and date_param != 'all':
            try:
                # Format attendu: YYYY-MM-DD
                start_date = timezone.datetime.strptime(date_param, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=1)
            except ValueError:
                # En cas d'erreur de format, utiliser la date d'aujourd'hui
                pass
        
        # Si le paramètre est 'all', ne pas filtrer par date
        # Suppression de la condition "and not (start_date_param or end_date_param)" qui empêchait le traitement correct du paramètre 'all'
        if date_param == 'all':
            print("Paramètre 'all' détecté: aucun filtrage par date ne sera appliqué")
            # Préparer la requête sans filtre de date
            if request.user.is_manager() or request.user.is_super_agent():
                query = Order.objects.all()
                
                # Filtrer par créateur si spécifié
                if creator_id:
                    query = query.filter(creator_id=creator_id)
                    print(f"Filtrage par créateur: {creator_id}")
                    
                orders = query.order_by('-created_at')
                print(f"Nombre total de commandes récupérées: {orders.count()}")
            else:
                # Agents can see orders they created
                orders = Order.objects.filter(creator=request.user).order_by('-created_at')
                print(f"Nombre de commandes de l'agent: {orders.count()}")
        else:
            # Convertir les dates en datetime avec timezone
            start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
            end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
            
            # Filtrer les commandes par date de création
            if request.user.is_manager() or request.user.is_super_agent():
                query = Order.objects.filter(
                    created_at__gte=start_datetime,
                    created_at__lt=end_datetime
                )
                
                # Filtrer par créateur si spécifié
                if creator_id:
                    query = query.filter(creator_id=creator_id)
                    
                orders = query.order_by('-created_at')
            else:
                # Agents can see orders they created
                orders = Order.objects.filter(
                    creator=request.user,
                    created_at__gte=start_datetime,
                    created_at__lt=end_datetime
                ).order_by('-created_at')
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
