#!/usr/bin/env python3
import mysql.connector
import os

def add_is_active_to_hardware_register():
    try:
        # Connect to MySQL
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='ict_automation'
        )
        
        if connection.is_connected():
            print("Successfully connected to database")
            
            cursor = connection.cursor()
            
            # Check if is_active column exists
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'hardware_register' 
                AND COLUMN_NAME = 'is_active'
                AND TABLE_SCHEMA = 'ict_automation'
            """)
            
            result = cursor.fetchone()
            
            if result:
                print("✅ is_active column already exists in hardware_register table")
            else:
                print("➕ Adding is_active column to hardware_register table...")
                cursor.execute("""
                    ALTER TABLE hardware_register 
                    ADD COLUMN is_active BOOLEAN DEFAULT TRUE
                """)
                connection.commit()
                print("✅ is_active column added successfully")
            
            # Update existing records to have is_active = TRUE
            cursor.execute("""
                UPDATE hardware_register 
                SET is_active = TRUE 
                WHERE is_active IS NULL
            """)
            connection.commit()
            print("✅ Existing records updated with is_active = TRUE")
            
            # Show table structure
            cursor.execute("DESCRIBE hardware_register")
            columns = cursor.fetchall()
            print(f"\nHardware register table has {len(columns)} columns:")
            for column in columns:
                print(f"  - {column[0]} ({column[1]})")
            
    except mysql.connector.Error as e:
        print(f"❌ Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("Database connection closed")
    
    return True

if __name__ == "__main__":
    add_is_active_to_hardware_register()
