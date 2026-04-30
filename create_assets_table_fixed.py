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
            
            # Drop existing assets table if it exists to recreate with correct structure
            cursor.execute("DROP TABLE IF EXISTS assets")
            connection.commit()
            print("🗑️  Dropped existing assets table")
            
            # Create assets table with correct structure
            create_table_query = """
            CREATE TABLE assets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_tag VARCHAR(50) UNIQUE NOT NULL,
                serial_number VARCHAR(100),
                branch_id INT,
                device_type_id INT,
                model_id INT,
                purchase_date DATE,
                warranty_expiry DATE,
                status_id INT,
                location VARCHAR(255),
                assigned_to VARCHAR(255),
                notes TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_asset_tag (asset_tag),
                INDEX idx_branch_id (branch_id),
                INDEX idx_device_type_id (device_type_id),
                INDEX idx_model_id (model_id),
                INDEX idx_status_id (status_id),
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
            
            # Copy data from hardware_register to assets
            print("\n📋 Copying data from hardware_register to assets...")
            copy_query = """
            INSERT INTO assets (
                asset_tag, serial_number, branch_id, device_type_id, model_id,
                purchase_date, warranty_expiry, status_id, location, assigned_to,
                notes, is_active, created_at, updated_at
            )
            SELECT 
                asset_tag, serial_number, branch_id, device_type_id, model_id,
                purchase_date, warranty_expiry, status_id, location, assigned_to,
                notes, is_active, created_at, updated_at
            FROM hardware_register
            WHERE is_active = TRUE
            """
            
            cursor.execute(copy_query)
            connection.commit()
            
            cursor.execute("SELECT COUNT(*) FROM assets")
            new_count = cursor.fetchone()[0]
            print(f"✅ Copied {new_count} records from hardware_register to assets")
            
            # Show some sample data
            cursor.execute("SELECT asset_tag, serial_number, location FROM assets LIMIT 5")
            sample_data = cursor.fetchall()
            print("\n📊 Sample data in assets table:")
            for row in sample_data:
                print(f"  - {row[0]} ({row[1]}) at {row[2]}")
            
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
