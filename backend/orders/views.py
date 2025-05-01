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

# Importer le gestionnaire de plages de dates
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from date_range_handler import get_date_range

# Create your views here.
class OrderListCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Obtenir le paramètre de date (aujourd'hui par défaut)
        date_param = request.query_params.get('date', 'today')
        
        # Définir la plage de dates pour le filtrage
        today = timezone.now().date()
        start_date = today
        end_date = today + timedelta(days=1)
        
        # Si un paramètre de date spécifique est fourni
        if date_param != 'today':
            try:
                # Format attendu: YYYY-MM-DD
                start_date = timezone.datetime.strptime(date_param, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=1)
            except ValueError:
                # En cas d'erreur de format, utiliser la date d'aujourd'hui
                pass
        
        # Convertir les dates en datetime avec timezone
        start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
        end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
        
        # Préparer la requête de base
        if request.user.is_manager() or request.user.is_super_agent():
            query = Order.objects.all()
        else:
            # Agents can see orders they created, prepared, controlled, or packed
            query = Order.objects.filter(creator=request.user)
        
        # Appliquer le filtre de date si nécessaire
        if start_date and end_date:
            # Convertir les dates en datetime avec timezone
            start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
            end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
            
            query = query.filter(
                created_at__gte=start_datetime,
                created_at__lt=end_datetime
            )
        
        # Trier par date de création décroissante
        orders = query.order_by('-created_at')
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_order(self, pk):
        return get_object_or_404(Order, pk=pk)
    
    def get(self, request, pk):
        order = self.get_order(pk)
        
        # Check if user has permission to view this order
        if not (request.user.is_manager() or request.user.is_super_agent()) and request.user != order.creator:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    def put(self, request, pk):
        order = self.get_order(pk)
        
        # Check if user has permission to update this order
        if not (request.user.is_manager() or request.user.is_super_agent()) and request.user != order.creator:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrderUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_order = serializer.save()
        
        return Response(OrderSerializer(updated_order).data)
    
    def delete(self, request, pk):
        order = self.get_order(pk)
        
        # Only managers, super agents, or the creator can delete an order
        if not (request.user.is_manager() or request.user.is_super_agent()) and request.user != order.creator:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PreparationView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Get orders in CREATED status
        creator_only = request.query_params.get('creator_only', 'false').lower() == 'true'
        
        # Obtenir le paramètre de date (aujourd'hui par défaut)
        date_param = request.query_params.get('date', 'today')
        
        # Définir la plage de dates pour le filtrage
        today = timezone.now().date()
        start_date = today
        end_date = today + timedelta(days=1)
        
        # Si un paramètre de date spécifique est fourni
        if date_param != 'today':
            try:
                # Format attendu: YYYY-MM-DD
                start_date = timezone.datetime.strptime(date_param, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=1)
            except ValueError:
                # En cas d'erreur de format, utiliser la date d'aujourd'hui
                pass
        
        # Convertir les dates en datetime avec timezone
        start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
        end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
        
        # Filtrer les commandes par date de création et statut
        if request.user.is_manager() and not creator_only:
            # Manager voit toutes les commandes sauf si creator_only=true
            orders = Order.objects.filter(
                status='CREATED',
                created_at__gte=start_datetime,
                created_at__lt=end_datetime
            ).order_by('-created_at')
        else:
            # Agent ou manager avec creator_only=true ne voit que ses propres commandes
            orders = Order.objects.filter(
                status='CREATED', 
                creator=request.user,
                created_at__gte=start_datetime,
                created_at__lt=end_datetime
            ).order_by('-created_at')
        
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
        # Obtenir le paramètre de date (aujourd'hui par défaut)
        date_param = request.query_params.get('date', 'today')
        
        # Définir la plage de dates pour le filtrage
        today = timezone.now().date()
        start_date = today
        end_date = today + timedelta(days=1)
        
        # Si un paramètre de date spécifique est fourni
        if date_param != 'today':
            try:
                # Format attendu: YYYY-MM-DD
                start_date = timezone.datetime.strptime(date_param, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=1)
            except ValueError:
                # En cas d'erreur de format, utiliser la date d'aujourd'hui
                pass
        
        # Convertir les dates en datetime avec timezone
        start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
        end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
        
        # Filtrer les commandes par date de création et statut
        orders = Order.objects.filter(
            status='PREPARED',
            created_at__gte=start_datetime,
            created_at__lt=end_datetime
        ).order_by('-created_at')
        
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
        # Obtenir le paramètre de date (aujourd'hui par défaut)
        date_param = request.query_params.get('date', 'today')
        
        # Définir la plage de dates pour le filtrage
        today = timezone.now().date()
        start_date = today
        end_date = today + timedelta(days=1)
        
        # Si un paramètre de date spécifique est fourni
        if date_param != 'today':
            try:
                # Format attendu: YYYY-MM-DD
                start_date = timezone.datetime.strptime(date_param, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=1)
            except ValueError:
                # En cas d'erreur de format, utiliser la date d'aujourd'hui
                pass
        
        # Convertir les dates en datetime avec timezone
        start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
        end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
        
        # Filtrer les commandes par date de création et statut
        orders = Order.objects.filter(
            status='CONTROLLED',
            created_at__gte=start_datetime,
            created_at__lt=end_datetime
        ).order_by('-created_at')
        
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
        
        # Obtenir le paramètre de date (aujourd'hui par défaut)
        date_param = request.query_params.get('date', 'today')
        
        # Définir la plage de dates pour le filtrage
        today = timezone.now().date()
        start_date = today
        end_date = today + timedelta(days=1)
        
        # Si un paramètre de date spécifique est fourni
        if date_param != 'today':
            try:
                # Format attendu: YYYY-MM-DD
                start_date = timezone.datetime.strptime(date_param, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=1)
            except ValueError:
                # En cas d'erreur de format, utiliser la date d'aujourd'hui
                pass
        
        # Convertir les dates en datetime avec timezone
        start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
        end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
        
        # Get counts of orders by status for the specified date
        total_orders = Order.objects.filter(
            created_at__gte=start_datetime,
            created_at__lt=end_datetime
        ).count()
        
        in_progress_orders = Order.objects.filter(
            created_at__gte=start_datetime,
            created_at__lt=end_datetime
        ).exclude(status='PACKED').count()
        
        completed_orders = Order.objects.filter(
            created_at__gte=start_datetime,
            created_at__lt=end_datetime,
            status='PACKED'
        ).count()
        
        # Calculate average times for orders completed today
        all_orders = Order.objects.filter(
            status='PACKED',
            packed_at__gte=start_datetime,
            packed_at__lt=end_datetime
        )
        
        avg_preparation_time = 0
        avg_control_time = 0
        avg_packing_time = 0
        avg_total_time = 0
        
        if all_orders.exists():
            preparation_times = [order.preparation_time() for order in all_orders if order.preparation_time() is not None]
            control_times = [order.control_time() for order in all_orders if order.control_time() is not None]
            packing_times = [order.packing_time() for order in all_orders if order.packing_time() is not None]
            total_times = [order.total_time() for order in all_orders if order.total_time() is not None]
            
            if preparation_times:
                avg_preparation_time = sum(preparation_times) / len(preparation_times)
            if control_times:
                avg_control_time = sum(control_times) / len(control_times)
            if packing_times:
                avg_packing_time = sum(packing_times) / len(packing_times)
            if total_times:
                avg_total_time = sum(total_times) / len(total_times)
        
        # Get agent statistics
        agents = User.objects.filter(role='AGENT')
        agent_stats = []
        
        for agent in agents:
            created_count = Order.objects.filter(creator=agent).count()
            prepared_count = Order.objects.filter(preparer=agent).count()
            controlled_count = Order.objects.filter(controller=agent).count()
            packed_count = Order.objects.filter(packer=agent).count()
            
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
        
        return Response({
            'order_counts': {
                'total': total_orders,
                'in_progress': in_progress_orders,
                'completed': completed_orders
            },
            'average_times': {
                'preparation': avg_preparation_time,
                'control': avg_control_time,
                'packing': avg_packing_time,
                'total': avg_total_time
            },
            'agent_stats': agent_stats
        })
