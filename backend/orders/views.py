from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer
from authentication.models import User

# Create your views here.
class OrderListCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Managers can see all orders, agents can only see their own orders
        if request.user.is_manager():
            orders = Order.objects.all().order_by('-created_at')
        else:
            # Agents can see orders they created, prepared, controlled, or packed
            orders = Order.objects.filter(
                creator=request.user
            ).order_by('-created_at')
        
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
        if request.user.is_manager():
            orders = Order.objects.filter(status='CREATED').order_by('-created_at')
        else:
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
        if request.user.is_manager():
            orders = Order.objects.filter(status='PREPARED').order_by('-prepared_at')
        else:
            orders = Order.objects.filter(status='PREPARED', preparer=request.user).order_by('-prepared_at')
        
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
        if request.user.is_manager():
            orders = Order.objects.filter(status='CONTROLLED').order_by('-controlled_at')
        else:
            orders = Order.objects.filter(status='CONTROLLED', controller=request.user).order_by('-controlled_at')
        
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

class DashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Only managers can access the dashboard
        if not request.user.is_manager():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get counts of orders by status
        total_orders = Order.objects.count()
        in_progress_orders = Order.objects.exclude(status='PACKED').count()
        completed_orders = Order.objects.filter(status='PACKED').count()
        
        # Calculate average times
        all_orders = Order.objects.filter(status='PACKED')
        
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
