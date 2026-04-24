import mysql.connector
import os

# Test database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ict_automation')
}

try:
    print("Testing database connection...")
    print(f"DB_CONFIG: {DB_CONFIG}")
    
    # First try to connect without database
    conn = mysql.connector.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password']
    )
    print("✓ Connected to MySQL server")
    
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SHOW DATABASES LIKE 'ict_automation'")
    result = cursor.fetchone()
    
    if result:
        print("✓ Database 'ict_automation' exists")
        
        # Connect to the specific database
        conn.close()
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        result = cursor.fetchone()
        
        if result:
            print("✓ Users table exists")
            
            # Check users in table
            cursor.execute("SELECT username, full_name, role FROM users")
            users = cursor.fetchall()
            print(f"✓ Found {len(users)} users:")
            for user in users:
                print(f"  - {user[0]} ({user[1]}) - {user[2]}")
        else:
            print("✗ Users table does not exist")
    else:
        print("✗ Database 'ict_automation' does not exist")
        print("Available databases:")
        cursor.execute("SHOW DATABASES")
        databases = cursor.fetchall()
        for db in databases:
            if db[0] not in ['information_schema', 'mysql', 'performance_schema', 'sys']:
                print(f"  - {db[0]}")
    
    cursor.close()
    conn.close()
    print("✓ Database test completed successfully")
    
except mysql.connector.Error as err:
    print(f"✗ Database error: {err}")
except Exception as e:
    print(f"✗ General error: {e}")
