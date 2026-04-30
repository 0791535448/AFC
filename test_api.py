#!/usr/bin/env python3
import requests

def test_branches_api():
    try:
        response = requests.get("http://localhost:8001/api/branches")
        
        if response.status_code == 200:
            print("✅ Branches API working!")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ API Error - Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_branches_api()
