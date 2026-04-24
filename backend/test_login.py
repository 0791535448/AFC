import requests
import json

def test_login():
    url = "http://localhost:8001/login"
    headers = {"Content-Type": "application/json"}
    data = {
        "username": "superadmin",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✓ Login successful!")
            result = response.json()
            print(f"Token: {result.get('access_token', 'No token')}")
        else:
            print("✗ Login failed")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    test_login()
