# test_line_count.py
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_login(username, password):
    """Test the login endpoint"""
    print(f"\n--- Testing login with {username} ---")
    url = f"{BASE_URL}/auth/login/"
    data = {
        "username": username,
        "password": password
    }
    
    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Login successful!")
            print(f"User: {result.get('user', {}).get('username')}")
            print(f"Role: {result.get('user', {}).get('role')}")
            print(f"Access Token: {result.get('access')[:20]}...")
            return result.get('access'), result.get('user', {})
        else:
            print(f"Login failed: {response.text}")
            return None, None
    except Exception as e:
        print(f"Error: {e}")
        return None, None

def get_preparation_orders(token):
    """Get orders in preparation"""
    print("\n--- Getting preparation orders ---")
    url = f"{BASE_URL}/orders/preparation/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Number of orders in preparation: {len(result)}")
            if len(result) > 0:
                print(f"First order: {result[0].get('reference')} - Status: {result[0].get('status')}")
            return result
        else:
            print(f"Failed to get preparation orders: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def update_order_with_line_count(token, order_id, line_count):
    """Update an order with line count and mark as prepared"""
    print(f"\n--- Updating order {order_id} with line count {line_count} ---")
    url = f"{BASE_URL}/orders/preparation/{order_id}/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "line_count": line_count
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Order updated successfully!")
            print(f"Order: {result.get('reference')}")
            print(f"Status: {result.get('status')}")
            print(f"Line Count: {result.get('line_count')}")
            return result
        else:
            print(f"Failed to update order: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def get_order_details(token, order_id):
    """Get order details"""
    print(f"\n--- Getting details for order {order_id} ---")
    url = f"{BASE_URL}/orders/{order_id}/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Order: {result.get('reference')}")
            print(f"Status: {result.get('status')}")
            print(f"Line Count: {result.get('line_count')}")
            return result
        else:
            print(f"Failed to get order details: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    # Test with agent credentials
    token, user = test_login("agent1", "password123")
    
    if not token:
        print("Login failed, cannot continue testing")
        return
    
    # Get orders in preparation
    orders = get_preparation_orders(token)
    
    if not orders or len(orders) == 0:
        print("No orders in preparation, cannot continue testing")
        return
    
    # Select the first order
    order_id = orders[0].get('id')
    
    # Update the order with line count
    updated_order = update_order_with_line_count(token, order_id, 5)
    
    if updated_order:
        # Get the updated order details
        get_order_details(token, order_id)

if __name__ == "__main__":
    main()