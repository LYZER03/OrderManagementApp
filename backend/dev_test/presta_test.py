import requests
from datetime import datetime

url = "http://192.168.1.114/presta16/api/orders"
params = {
    "output_format": "JSON",
    "ws_key": "6Y9TCUSXG5N3HRBV46D4EMV5ILW1FV6F",
    "display": "full"
}
response = requests.get(url, params=params)
orders = response.json().get("orders", [])

# Date du jour au format YYYY-MM-DD
aujourdhui = datetime.now().strftime("%Y-%m-%d")

for order in orders:
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
        print(f"ID: {order.get('id')}, Référence: {order.get('reference')}, Date: {order.get('date_add')}, Client: {customer_name}")