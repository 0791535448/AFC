"""
Script to clear all assets from the database
This performs a hard delete of all asset records
"""

import mysql.connector

def clear_all_assets():
    try:
        # Database connection
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='ict_automation'
        )
        cursor = conn.cursor()
        
        # Get count before deletion (including soft-deleted)
        cursor.execute("SELECT COUNT(*) FROM assets")
        count = cursor.fetchone()[0]
        
        # Get active assets count
        cursor.execute("SELECT COUNT(*) FROM assets WHERE is_active = TRUE")
        active_count = cursor.fetchone()[0]
        
        print(f"Found {count} total assets ({active_count} active, {count - active_count} soft-deleted)")
        
        if count == 0:
            print("No assets to delete")
            return
        
        # Hard delete all assets
        cursor.execute("DELETE FROM assets")
        conn.commit()
        print(f"✅ Successfully deleted all {count} assets from database")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    clear_all_assets()
