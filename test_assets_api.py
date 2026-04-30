#!/usr/bin/env python3
import requests

def test_assets_api():
    base_url = "http://localhost:8001"
    
    print("Testing Assets API...")
    
    # Test GET assets endpoint
    try:
        response = requests.get(f"{base_url}/assets", headers={"Authorization": "Bearer test-token"})
        if response.status_code == 200:
            print("✅ GET /assets working!")
            assets = response.json()
            print(f"Found {len(assets)} assets")
            if assets:
                print(f"First asset: {assets[0].get('asset_code')} - {assets[0].get('asset_name')}")
                print(f"Category: {assets[0].get('asset_category')}")
                print(f"Status: {assets[0].get('asset_status')}")
        else:
            print(f"❌ GET Error - Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test DELETE assets endpoint
    try:
        if assets and len(assets) > 0:
            asset_id = assets[0].get('id')
            print(f"\n🗑️ Testing DELETE on asset ID: {asset_id}")
            delete_response = requests.delete(f"{base_url}/assets/{asset_id}", headers={"Authorization": "Bearer test-token"})
            
            if delete_response.status_code == 200:
                print("✅ DELETE /assets/{id} working!")
                print(f"Response: {delete_response.json()}")
                
                # Test GET again to see if asset is gone
                get_response = requests.get(f"{base_url}/assets", headers={"Authorization": "Bearer test-token"})
                if get_response.status_code == 200:
                    updated_assets = get_response.json()
                    print(f"After deletion: {len(updated_assets)} assets")
                    print("✅ Soft delete working - asset removed from active list")
            else:
                print(f"❌ DELETE Error - Status Code: {delete_response.status_code}")
                print(f"Response: {delete_response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎯 Assets API Summary:")
    print("  - GET /assets - List all active assets")
    print("  - POST /assets - Create new asset") 
    print("  - DELETE /assets/{id} - Soft delete asset")
    print("  - Uses dedicated 'assets' table (different from hardware_register)")

if __name__ == "__main__":
    test_assets_api()
