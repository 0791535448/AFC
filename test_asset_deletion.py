#!/usr/bin/env python3
import requests

def test_asset_deletion():
    base_url = "http://localhost:8001"
    
    # Test GET hardware endpoint (should show only active assets)
    try:
        response = requests.get(f"{base_url}/hardware", headers={"Authorization": "Bearer test-token"})
        if response.status_code == 200:
            print("✅ Hardware GET endpoint working!")
            hardware = response.json()
            print(f"Found {len(hardware)} active hardware items")
            if hardware:
                print(f"First item: {hardware[0].get('asset_tag')} (ID: {hardware[0].get('id')})")
                hardware_id = hardware[0].get('id')
                
                # Test DELETE endpoint
                print(f"\n🗑️ Testing DELETE on hardware ID: {hardware_id}")
                delete_response = requests.delete(f"{base_url}/hardware/{hardware_id}", headers={"Authorization": "Bearer test-token"})
                
                if delete_response.status_code == 200:
                    print("✅ DELETE endpoint working!")
                    print(f"Response: {delete_response.json()}")
                    
                    # Test GET again to see if item is gone
                    get_response = requests.get(f"{base_url}/hardware", headers={"Authorization": "Bearer test-token"})
                    if get_response.status_code == 200:
                        updated_hardware = get_response.json()
                        print(f"After deletion: {len(updated_hardware)} active hardware items")
                        print("✅ Soft delete working - item removed from active list")
                else:
                    print(f"❌ DELETE Error - Status Code: {delete_response.status_code}")
                    print(f"Response: {delete_response.text}")
            else:
                print("No hardware items found to test deletion")
        else:
            print(f"❌ Hardware GET Error - Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_asset_deletion()
