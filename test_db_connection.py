#!/usr/bin/env python3
import mysql.connector
import os

def test_backend_db_connection():
    # Use the same configuration as the backend
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'root'),
        'database': os.getenv('DB_NAME', 'ict_automation')
    }
    
    try:
        print(f"Testing connection to database: {DB_CONFIG['database']}")
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            print("✅ Successfully connected to the database!")
            
            cursor = connection.cursor()
            
            # Test basic query
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"MySQL Version: {version[0]}")
            
            # Show tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"Found {len(tables)} tables:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Test a simple query on branches table
            cursor.execute("SELECT COUNT(*) FROM branches")
            count = cursor.fetchone()
            print(f"Branches table has {count[0]} records")
            
            return True
            
    except mysql.connector.Error as e:
        print(f"❌ Error connecting to database: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("Database connection closed")

if __name__ == "__main__":
    test_backend_db_connection()
