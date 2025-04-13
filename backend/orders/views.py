from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer
from authentication.models import User
from django.db.models import Q
from rest_framework.decorators import permission_classes
from django.utils.dateparse import parse_datetime

# Create your views here.
class OrderListCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Récupérer les paramètres de pagination et de filtrage
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        status_filter = request.query_params.get('status', None)
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        ordering = request.query_params.get('ordering', '-created_at')
        
        # Construire la requête de base
        if request.user.is_manager():
            queryset = Order.objects.all()
        else:
            # Agents can see orders they created, prepared, controlled, or packed
            queryset = Order.objects.filter(creator=request.user)
        
        # Appliquer les filtres
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
            
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Appliquer le tri
        queryset = queryset.order_by(ordering)
        
        # Calculer le nombre total d'éléments pour la pagination
        total_count = queryset.count()
        
        # Appliquer la pagination
        offset = (page - 1) * page_size
        queryset = queryset[offset:offset + page_size]
        
        # Sérialiser les résultats
        serializer = OrderSerializer(queryset, many=True)
        
        # Retourner les résultats avec les métadonnées de pagination
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })
    
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        # Vérifier si l'utilisateur est un manager (seuls les managers peuvent effectuer une suppression en masse)
        if not request.user.is_manager():
            return Response({"error": "Seuls les managers peuvent effectuer une suppression en masse"}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Récupérer les paramètres de filtrage
            status_filter = request.query_params.get('status', None)
            start_date = request.query_params.get('start_date', None)
            end_date = request.query_params.get('end_date', None)
            
            print(f"Paramètres de suppression en masse reçus: status={status_filter}, start_date={start_date}, end_date={end_date}")
            
            # Construire la requête de base
            queryset = Order.objects.all()
            
            # Appliquer les filtres
            if status_filter:
                queryset = queryset.filter(status=status_filter)
                
            if start_date:
                try:
                    # Essayer de parser la date avec plusieurs formats
                    try:
                        start_date = parse_datetime(start_date)
                    except (ValueError, TypeError):
                        # Si le format ISO ne fonctionne pas, essayer un format plus simple
                        from datetime import datetime
                        start_date = datetime.strptime(start_date, '%Y-%m-%d')
                    
                    queryset = queryset.filter(created_at__gte=start_date)
                    print(f"Filtre de date de début appliqué: {start_date}")
                except Exception as e:
                    print(f"Erreur lors du parsing de la date de début: {e}")
                    return Response({"error": f"Format de date invalide pour start_date: {start_date}. Utilisez le format ISO."}, 
                                    status=status.HTTP_400_BAD_REQUEST)
                
            if end_date:
                try:
                    # Essayer de parser la date avec plusieurs formats
                    try:
                        end_date = parse_datetime(end_date)
                    except (ValueError, TypeError):
                        # Si le format ISO ne fonctionne pas, essayer un format plus simple
                        from datetime import datetime
                        end_date = datetime.strptime(end_date, '%Y-%m-%d')
                        # Ajouter 23:59:59 pour inclure toute la journée
                        end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
                    
                    queryset = queryset.filter(created_at__lte=end_date)
                    print(f"Filtre de date de fin appliqué: {end_date}")
                except Exception as e:
                    print(f"Erreur lors du parsing de la date de fin: {e}")
                    return Response({"error": f"Format de date invalide pour end_date: {end_date}. Utilisez le format ISO."}, 
                                    status=status.HTTP_400_BAD_REQUEST)
            
            # Compter le nombre de commandes qui seront supprimées
            count = queryset.count()
            
            if count == 0:
                return Response({
                    "message": "Aucune commande ne correspond aux critères de filtrage",
                    "count": 0
                }, status=status.HTTP_200_OK)
            
            # Supprimer les commandes
            deleted, details = queryset.delete()
            
            print(f"Suppression en masse réussie: {deleted} commandes supprimées")
            
            return Response({
                "message": f"{deleted} commandes ont été supprimées avec succès",
                "count": deleted
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Erreur lors de la suppression en masse: {str(e)}")
            return Response({
                "error": f"Une erreur est survenue lors de la suppression en masse: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_order(self, pk):
        return get_object_or_404(Order, pk=pk)
    
    def get(self, request, pk):
        order = self.get_order(pk)
        
        # Check if user has permission to view this order
        if not request.user.is_manager() and request.user != order.creator:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    def put(self, request, pk):
        order = self.get_order(pk)
        
        # Check if user has permission to update this order
        if not request.user.is_manager() and request.user != order.creator:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrderUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_order = serializer.save()
        
        return Response(OrderSerializer(updated_order).data)
    
    def delete(self, request, pk):
        order = self.get_order(pk)
        
        # Only managers or the creator can delete an order
        if not request.user.is_manager() and request.user != order.creator:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PreparationView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Get orders in CREATED status
        creator_only = request.query_params.get('creator_only', 'false').lower() == 'true'
        
        if request.user.is_manager() and not creator_only:
            # Manager voit toutes les commandes sauf si creator_only=true
            orders = Order.objects.filter(status='CREATED').order_by('-created_at')
        else:
            # Agent ou manager avec creator_only=true ne voit que ses propres commandes
            orders = Order.objects.filter(status='CREATED', creator=request.user).order_by('-created_at')
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        # Check if order is in the correct status
        if order.status != 'CREATED':
            return Response({"error": "Cette commande n'est pas en attente de préparation"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Get line_count from request data
        line_count = request.data.get('line_count')
        if line_count is not None:
            try:
                line_count = int(line_count)
                if line_count < 1:
                    return Response({"error": "Le nombre de lignes doit être un entier positif"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                order.line_count = line_count
            except (ValueError, TypeError):
                return Response({"error": "Le nombre de lignes doit être un entier positif"}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        # Update order status and preparer
        order.status = 'PREPARED'
        order.preparer = request.user
        order.prepared_at = timezone.now()
        order.save()
        
        return Response(OrderSerializer(order).data)

class ControlView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Get orders in PREPARED status
        # Tous les utilisateurs (agents et managers) peuvent voir toutes les commandes préparées
        orders = Order.objects.filter(status='PREPARED').order_by('-prepared_at')
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        # Check if order is in the correct status
        if order.status != 'PREPARED':
            return Response({"error": "Cette commande n'est pas en attente de contrôle"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Update order status and controller
        order.status = 'CONTROLLED'
        order.controller = request.user
        order.controlled_at = timezone.now()
        order.save()
        
        return Response(OrderSerializer(order).data)

class PackingView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Get orders in CONTROLLED status
        # Tous les utilisateurs (agents et managers) peuvent voir toutes les commandes contrôlées
        orders = Order.objects.filter(status='CONTROLLED').order_by('-controlled_at')
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        # Check if order is in the correct status
        if order.status != 'CONTROLLED':
            return Response({"error": "Cette commande n'est pas en attente d'emballage"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Update order status and packer
        order.status = 'PACKED'
        order.packer = request.user
        order.packed_at = timezone.now()
        order.completed_at = timezone.now()
        order.save()
        
        return Response(OrderSerializer(order).data)

class OrderReferenceView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, reference):
        try:
            # Find the order by reference
            order = Order.objects.get(reference=reference)
            
            # Check if user has permission to view this order
            if not request.user.is_manager() and request.user != order.creator:
                return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({"error": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)

class OrderBulkDeleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        # Only managers can bulk delete orders
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get order IDs from request data
        order_ids = request.data.get('order_ids', [])
        
        if not order_ids:
            return Response({"error": "Aucune commande à supprimer"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete orders
        deleted_count = 0
        for order_id in order_ids:
            try:
                order = Order.objects.get(pk=order_id)
                order.delete()
                deleted_count += 1
            except Order.DoesNotExist:
                pass
        
        return Response({
            "message": f"{deleted_count} commande(s) supprimée(s) avec succès",
            "deleted_count": deleted_count
        })


class DashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Only managers can access the dashboard
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Utiliser des requêtes optimisées avec des agrégations
        from django.db.models import Count, Avg, F, ExpressionWrapper, fields, Q, Sum
        from django.db.models.functions import ExtractMonth, TruncMonth, TruncDay, TruncWeek
        from datetime import datetime, timedelta
        import calendar
        import pytz
        
        # Get counts of orders by status - Utiliser une seule requête avec des annotations
        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        
        # Initialiser les compteurs
        total_orders = 0
        in_progress_orders = 0
        completed_orders = 0
        status_distribution = {}
        
        # Remplir les compteurs à partir des résultats de l'agrégation
        for item in status_counts:
            status = item['status']
            count = item['count']
            total_orders += count
            
            if status == 'PACKED':
                completed_orders = count
            else:
                in_progress_orders += count
                
            status_distribution[status] = count
        
        # Calculer les pourcentages de croissance par rapport à différentes périodes
        now = timezone.now()
        yesterday = now - timedelta(days=1)
        last_week = now - timedelta(days=7)
        last_month = now - timedelta(days=30)
        
        # Calcul pour hier
        yesterday_start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_end = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
        yesterday_total = Order.objects.filter(created_at__range=(yesterday_start, yesterday_end)).count()
        yesterday_completed = Order.objects.filter(status='PACKED', created_at__range=(yesterday_start, yesterday_end)).count()
        yesterday_in_progress = yesterday_total - yesterday_completed
        
        # Calcul pour la semaine dernière
        last_week_start = last_week.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=last_week.weekday())
        current_week_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=now.weekday())
        last_week_total = Order.objects.filter(created_at__range=(last_week_start, current_week_start)).count()
        last_week_completed = Order.objects.filter(status='PACKED', created_at__range=(last_week_start, current_week_start)).count()
        last_week_in_progress = last_week_total - last_week_completed
        
        # Calcul pour le mois dernier
        last_month_start = last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_total = Order.objects.filter(created_at__range=(last_month_start, current_month_start)).count()
        last_month_completed = Order.objects.filter(status='PACKED', created_at__range=(last_month_start, current_month_start)).count()
        last_month_in_progress = last_month_total - last_month_completed
        
        # Calcul des pourcentages de croissance
        def calculate_growth_percentage(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100, 1)
        
        # Croissance par rapport à hier
        daily_growth = {
            'total_orders': calculate_growth_percentage(total_orders, yesterday_total),
            'completed_orders': calculate_growth_percentage(completed_orders, yesterday_completed),
            'in_progress_orders': calculate_growth_percentage(in_progress_orders, yesterday_in_progress)
        }
        
        # Croissance par rapport à la semaine dernière
        weekly_growth = {
            'total_orders': calculate_growth_percentage(total_orders, last_week_total),
            'completed_orders': calculate_growth_percentage(completed_orders, last_week_completed),
            'in_progress_orders': calculate_growth_percentage(in_progress_orders, last_week_in_progress)
        }
        
        # Croissance par rapport au mois dernier
        monthly_growth = {
            'total_orders': calculate_growth_percentage(total_orders, last_month_total),
            'completed_orders': calculate_growth_percentage(completed_orders, last_month_completed),
            'in_progress_orders': calculate_growth_percentage(in_progress_orders, last_month_in_progress)
        }
        
        # Calculer les moyennes de temps directement dans la base de données
        # Utiliser des expressions pour calculer les différences de temps
        time_metrics = Order.objects.filter(status='PACKED').aggregate(
            avg_preparation_time=Avg(
                ExpressionWrapper(
                    (F('prepared_at') - F('created_at')),
                    output_field=fields.DurationField()
                )
            ),
            avg_control_time=Avg(
                ExpressionWrapper(
                    (F('controlled_at') - F('prepared_at')),
                    output_field=fields.DurationField()
                )
            ),
            avg_packing_time=Avg(
                ExpressionWrapper(
                    (F('packed_at') - F('controlled_at')),
                    output_field=fields.DurationField()
                )
            ),
            avg_total_time=Avg(
                ExpressionWrapper(
                    (F('packed_at') - F('created_at')),
                    output_field=fields.DurationField()
                )
            )
        )
        
        # Convertir les durées en minutes
        avg_times = {}
        for key, value in time_metrics.items():
            if value is not None:
                # Convertir timedelta en minutes
                avg_times[key.replace('avg_', '')] = value.total_seconds() / 60
            else:
                avg_times[key.replace('avg_', '')] = 0
        
        # Obtenir les statistiques des agents de manière optimisée
        agents = User.objects.filter(role='AGENT')
        agent_stats = []
        
        # Récupérer les compteurs pour tous les agents en une seule requête par type d'action
        creator_counts = dict(Order.objects.values('creator').annotate(count=Count('id')).values_list('creator', 'count'))
        preparer_counts = dict(Order.objects.values('preparer').annotate(count=Count('id')).values_list('preparer', 'count'))
        controller_counts = dict(Order.objects.values('controller').annotate(count=Count('id')).values_list('controller', 'count'))
        packer_counts = dict(Order.objects.values('packer').annotate(count=Count('id')).values_list('packer', 'count'))
        
        for agent in agents:
            created_count = creator_counts.get(agent.id, 0)
            prepared_count = preparer_counts.get(agent.id, 0)
            controlled_count = controller_counts.get(agent.id, 0)
            packed_count = packer_counts.get(agent.id, 0)
            
            agent_stats.append({
                'id': agent.id,
                'username': agent.username,
                'first_name': agent.first_name,
                'last_name': agent.last_name,
                'created_count': created_count,
                'prepared_count': prepared_count,
                'controlled_count': controlled_count,
                'packed_count': packed_count,
                'total_count': created_count + prepared_count + controlled_count + packed_count
            })
        
        # Générer des données mensuelles optimisées
        # Commandes par mois (pour les 24 derniers mois)
        current_date = timezone.now()
        start_date = current_date - timedelta(days=730)  # ~24 mois
        
        # Requête optimisée pour obtenir le nombre de commandes par mois
        monthly_orders_data = (
            Order.objects
            .filter(created_at__gte=start_date)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        # Requête optimisée pour obtenir le nombre de commandes emballées par mois
        monthly_packed_data = (
            Order.objects
            .filter(status='PACKED', packed_at__gte=start_date)
            .annotate(month=TruncMonth('packed_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        # Convertir les résultats en format attendu par le frontend
        month_names = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        
        # Initialiser les tableaux avec des zéros
        monthly_orders = [{'name': name, 'sales': 0} for name in month_names]
        monthly_packed = [{'name': name, 'tasks': 0} for name in month_names]
        
        # Remplir avec les données réelles
        for item in monthly_orders_data:
            month_idx = item['month'].month - 1  # 0-indexed
            monthly_orders[month_idx]['sales'] += item['count']
            
        for item in monthly_packed_data:
            month_idx = item['month'].month - 1  # 0-indexed
            monthly_packed[month_idx]['tasks'] += item['count']
        
        # Préparer la réponse
        response_data = {
            'order_counts': {
                'total': total_orders,
                'in_progress': in_progress_orders,
                'completed': completed_orders
            },
            'growth': {
                'daily': daily_growth,
                'weekly': weekly_growth,
                'monthly': monthly_growth
            },
            'average_times': avg_times,
            'agent_stats': agent_stats,
            'monthly_orders': monthly_orders,
            'monthly_packed': monthly_packed,
            'status_distribution': [
                {'name': 'Créées', 'value': status_distribution.get('CREATED', 0)},
                {'name': 'Préparées', 'value': status_distribution.get('PREPARED', 0)},
                {'name': 'Contrôlées', 'value': status_distribution.get('CONTROLLED', 0)},
                {'name': 'Emballées', 'value': status_distribution.get('PACKED', 0)}
            ]
        }
        
        return Response(response_data)
