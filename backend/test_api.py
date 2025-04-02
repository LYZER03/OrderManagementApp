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

def test_orders(token):
    """Test the orders endpoint"""
    print("\n--- Testing orders endpoint ---")
    url = f"{BASE_URL}/orders/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Number of orders: {len(result)}")
            if len(result) > 0:
                print(f"First order: {result[0].get('reference')} - Status: {result[0].get('status')}")
            return result
        else:
            print(f"Failed to get orders: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_preparation_orders(token):
    """Test the preparation orders endpoint"""
    print("\n--- Testing preparation orders endpoint ---")
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

def main():
    # Test with manager credentials
    manager_token, manager_user = test_login("manager1", "password123")
    
    if manager_token:
        # Test orders endpoints with manager token
        test_orders(manager_token)
        test_preparation_orders(manager_token)
    
    print("\n" + "-" * 50 + "\n")
    
    # Test with agent credentials
    agent_token, agent_user = test_login("agent1", "password123")
    
    if agent_token:
        # Test orders endpoints with agent token
        test_orders(agent_token)
        test_preparation_orders(agent_token)

if __name__ == "__main__":
    main()