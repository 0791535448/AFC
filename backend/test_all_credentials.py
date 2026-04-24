import requests

def test_all_credentials():
    url = "http://localhost:8001/login"
    headers = {"Content-Type": "application/json"}
    
    credentials = [
        {"username": "superadmin", "password": "password123"},
        {"username": "admin", "password": "password123"},
        {"username": "jdoe", "password": "password123"},
        {"username": "jsmith", "password": "password123"},
    ]
    
    for cred in credentials:
        try:
            response = requests.post(url, headers=headers, json=cred)
            if response.status_code == 200:
                print(f"SUCCESS: {cred['username']} - Login successful")
            else:
                print(f"FAILED: {cred['username']} - Status {response.status_code}")
        except Exception as e:
            print(f"ERROR: {cred['username']} - {e}")

if __name__ == "__main__":
    test_all_credentials()
