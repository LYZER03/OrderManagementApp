from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import requests
from datetime import datetime
from .models import Order
from authentication.models import User

class PrestaOrdersView(APIView):
    """
    Vue pour récupérer les commandes PrestaShop du jour.
    Accessible uniquement aux managers.
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # Vérifier que l'utilisateur est un manager
        if not request.user.is_manager():
            return Response(
                {"error": "Accès restreint aux managers"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Configuration de l'API PrestaShop
            url = "http://192.168.1.114/presta16/api/orders"
            params = {
                "output_format": "JSON",
                "ws_key": "6Y9TCUSXG5N3HRBV46D4EMV5ILW1FV6F",
                "display": "full"
            }
            
            # Appel à l'API PrestaShop
            response = requests.get(url, params=params)
            
            if response.status_code != 200:
                return Response(
                    {"error": f"Erreur lors de la connexion à l'API PrestaShop: {response.status_code}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )
            
            orders_data = response.json().get("orders", [])
            
            # Date du jour au format YYYY-MM-DD
            aujourdhui = datetime.now().strftime("%Y-%m-%d")
            
            # Filtrer les commandes du jour
            today_orders = []
            
            for order in orders_data:
                date_add = order.get('date_add', '')
                # On ne garde que les commandes du jour
                if date_add.startswith(aujourdhui):
                    id_customer = order.get('id_customer')
                    # Récupération du nom du client
                    customer_name = "N/A"
                    
                    if id_customer:
                        cust_url = f"http://192.168.1.114/presta16/api/customers/{id_customer}"
                        cust_params = {
                            "output_format": "JSON",
                            "ws_key": "6Y9TCUSXG5N3HRBV46D4EMV5ILW1FV6F"
                        }
                        cust_resp = requests.get(cust_url, params=cust_params)
                        
                        if cust_resp.status_code == 200:
                            customer = cust_resp.json().get("customer", {})
                            firstname = customer.get("firstname", "")
                            lastname = customer.get("lastname", "")
                            customer_name = f"{firstname} {lastname}".strip()
                    
                    # Récupération des détails des produits commandés
                    order_details = []
                    if order.get('associations') and order.get('associations').get('order_rows'):
                        for row in order.get('associations').get('order_rows'):
                            product_name = row.get('product_name', 'N/A')
                            product_quantity = row.get('product_quantity', 0)
                            product_price = row.get('unit_price_tax_incl', '0.00')
                            
                            order_details.append({
                                'product_name': product_name,
                                'quantity': product_quantity,
                                'price': product_price
                            })
                    
                    # Vérifier si la commande existe dans notre système interne (par référence)
                    reference = order.get('reference')
                    internal_order = None
                    order_handlers = {}
                    
                    # Récupérer la commande interne correspondante si elle existe
                    try:
                        internal_order = Order.objects.filter(reference=reference).first()
                        if internal_order:
                            # Déterminer le statut basé sur l'état de la commande interne
                            app_status = '1'  # Par défaut: en attente
                            
                            if internal_order.status == 'CREATED':
                                app_status = '2'  # Commande créée et validée
                            elif internal_order.status == 'PREPARED':
                                app_status = '4'  # Préparée, en attente de contrôle
                            elif internal_order.status == 'CONTROLLED':
                                app_status = '5'  # Contrôlée, en attente d'emballage
                            elif internal_order.status == 'PACKED':
                                app_status = '6'  # Emballée, terminée
                            
                            # Récupérer les informations sur les utilisateurs qui ont traité la commande
                            order_handlers = {
                                'creator': {
                                    'user': self._get_user_info(internal_order.creator) if internal_order.creator else None,
                                    'timestamp': internal_order.created_at.isoformat() if internal_order.created_at else None
                                },
                                'preparer': {
                                    'user': self._get_user_info(internal_order.preparer) if internal_order.preparer else None,
                                    'timestamp': internal_order.prepared_at.isoformat() if internal_order.prepared_at else None
                                },
                                'controller': {
                                    'user': self._get_user_info(internal_order.controller) if internal_order.controller else None,
                                    'timestamp': internal_order.controlled_at.isoformat() if internal_order.controlled_at else None
                                },
                                'packer': {
                                    'user': self._get_user_info(internal_order.packer) if internal_order.packer else None,
                                    'timestamp': internal_order.packed_at.isoformat() if internal_order.packed_at else None
                                }
                            }
                            
                            # Utilisez le statut de notre application plutôt que celui de PrestaShop
                            current_state = app_status
                        else:
                            current_state = order.get('current_state')
                    except Exception as e:
                        print(f"Erreur lors de la recherche de la commande interne: {e}")
                        current_state = order.get('current_state')
                    
                    # Formattage des détails de la commande pour le frontend
                    formatted_order = {
                        'id': order.get('id'),
                        'reference': order.get('reference'),
                        'date': order.get('date_add'),
                        'status': current_state,
                        'customer_name': customer_name,
                        'total_paid': order.get('total_paid_tax_incl'),
                        'payment_method': order.get('payment'),
                        'products': order_details,
                        'internal_order_id': internal_order.id if internal_order else None,
                        'internal_order_status': internal_order.status if internal_order else None,
                        'handlers': order_handlers
                    }
                    
                    today_orders.append(formatted_order)
            
            return Response(today_orders)
                
        except Exception as e:
            return Response(
                {"error": f"Erreur lors de la récupération des commandes PrestaShop: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    def _get_user_info(self, user):
        """Récupère les informations de base d'un utilisateur"""
        if not user:
            return None
            
        return {
            'id': user.id,
            'username': user.username,
            'full_name': f"{user.first_name} {user.last_name}".strip(),
            'role': user.role
        }
