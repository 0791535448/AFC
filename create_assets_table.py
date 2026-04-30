#!/usr/bin/env python3
import mysql.connector
import os

def create_assets_table():
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
            
            # Check if assets table already exists
            cursor.execute("""
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'ict_automation' 
                AND TABLE_NAME = 'assets'
            """)
            
            result = cursor.fetchone()
            
            if result:
                print("⚠️  Assets table already exists")
                # Show table structure
                cursor.execute("DESCRIBE assets")
                columns = cursor.fetchall()
                print(f"Assets table structure:")
                for column in columns:
                    print(f"  - {column[0]} ({column[1]})")
            else:
                print("➕ Creating assets table...")
                
                # Create assets table
                create_table_query = """
                CREATE TABLE assets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    asset_tag VARCHAR(50) UNIQUE NOT NULL,
                    serial_number VARCHAR(100),
                    device_type VARCHAR(100),
                    make VARCHAR(100),
                    model VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'Active',
                    location VARCHAR(255),
                    assigned_to VARCHAR(255),
                    purchase_date DATE,
                    warranty_expiry DATE,
                    purchase_cost DECIMAL(10, 2),
                    notes TEXT,
                    branch_id INT,
                    device_type_id INT,
                    model_id INT,
                    status_id INT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_asset_tag (asset_tag),
                    INDEX idx_device_type (device_type),
                    INDEX idx_make (make),
                    INDEX idx_status (status),
                    INDEX idx_location (location),
                    INDEX idx_is_active (is_active),
                    FOREIGN KEY (branch_id) REFERENCES branches(id),
                    FOREIGN KEY (device_type_id) REFERENCES device_types(id),
                    FOREIGN KEY (model_id) REFERENCES hardware_models(id),
                    FOREIGN KEY (status_id) REFERENCES hardware_status(id)
                )
                """
                
                cursor.execute(create_table_query)
                connection.commit()
                print("✅ Assets table created successfully")
                
                # Show table structure
                cursor.execute("DESCRIBE assets")
                columns = cursor.fetchall()
                print(f"Assets table has {len(columns)} columns:")
                for column in columns:
                    print(f"  - {column[0]} ({column[1]})")
            
            # Copy data from hardware_register to assets if assets table is new and empty
            cursor.execute("SELECT COUNT(*) FROM assets")
            assets_count = cursor.fetchone()[0]
            
            if assets_count == 0:
                print("\n📋 Copying data from hardware_register to assets...")
                copy_query = """
                INSERT INTO assets (
                    asset_tag, serial_number, device_type, make, model, status, 
                    location, assigned_to, purchase_date, warranty_expiry, 
                    notes, is_active, created_at, updated_at
                )
                SELECT 
                    asset_tag, serial_number, device_type, make, model, status,
                    location, assigned_to, purchase_date, warranty_expiry,
                    notes, is_active, created_at, updated_at
                FROM hardware_register
                WHERE is_active = TRUE
                """
                
                cursor.execute(copy_query)
                connection.commit()
                
                cursor.execute("SELECT COUNT(*) FROM assets")
                new_count = cursor.fetchone()[0]
                print(f"✅ Copied {new_count} records from hardware_register to assets")
            else:
                cursor.execute("SELECT COUNT(*) FROM assets")
                count = cursor.fetchone()[0]
                print(f"📊 Assets table currently has {count} records")
            
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
    create_assets_table()
