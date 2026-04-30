#!/usr/bin/env python3
import requests

def test_apis():
    base_url = "http://localhost:8001/api"
    
    # Test device types
    try:
        response = requests.get(f"{base_url}/device-types")
        if response.status_code == 200:
            print("✅ Device Types API working!")
            device_types = response.json()
            print(f"Found {len(device_types.get('device_types', []))} device types")
            for dt in device_types.get('device_types', [])[:3]:
                print(f"  - {dt.get('device_type_name')} ({dt.get('category', 'N/A')})")
        else:
            print(f"❌ Device Types API Error - Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Device Types Error: {e}")
    
    print()
    
    # Test hardware makes
    try:
        response = requests.get(f"{base_url}/makes")
        if response.status_code == 200:
            print("✅ Hardware Makes API working!")
            makes = response.json()
            print(f"Found {len(makes.get('makes', []))} hardware makes")
            for make in makes.get('makes', [])[:3]:
                print(f"  - {make.get('make_name')}")
        else:
            print(f"❌ Hardware Makes API Error - Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Hardware Makes Error: {e}")

if __name__ == "__main__":
    test_apis()
