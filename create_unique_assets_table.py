#!/usr/bin/env python3
import mysql.connector
import os

def create_unique_assets_table():
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
            
            # Drop existing assets table if it exists
            cursor.execute("DROP TABLE IF EXISTS assets")
            connection.commit()
            print("🗑️  Dropped existing assets table")
            
            # Create unique assets table - different structure from hardware_register
            create_table_query = """
            CREATE TABLE assets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_code VARCHAR(20) UNIQUE NOT NULL,
                asset_name VARCHAR(200) NOT NULL,
                asset_category VARCHAR(100) NOT NULL,
                asset_type VARCHAR(100),
                brand VARCHAR(100),
                serial_number VARCHAR(100) UNIQUE,
                model_number VARCHAR(100),
                purchase_date DATE,
                purchase_cost DECIMAL(12, 2),
                current_value DECIMAL(12, 2),
                depreciation_rate DECIMAL(5, 2) DEFAULT 0.00,
                warranty_start DATE,
                warranty_end DATE,
                maintenance_contract BOOLEAN DEFAULT FALSE,
                contract_expiry DATE,
                location VARCHAR(255),
                department VARCHAR(100),
                assigned_user VARCHAR(255),
                asset_status ENUM('Active', 'Inactive', 'Under Maintenance', 'Retired', 'Lost', 'Stolen') DEFAULT 'Active',
                condition_rating ENUM('Excellent', 'Good', 'Fair', 'Poor') DEFAULT 'Good',
                last_inspection DATE,
                next_inspection DATE,
                notes TEXT,
                barcode VARCHAR(50),
                qr_code VARCHAR(50),
                is_active BOOLEAN DEFAULT TRUE,
                created_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(100),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_asset_code (asset_code),
                INDEX idx_asset_name (asset_name),
                INDEX idx_category (asset_category),
                INDEX idx_brand (brand),
                INDEX idx_status (asset_status),
                INDEX idx_location (location),
                INDEX idx_department (department),
                INDEX idx_is_active (is_active),
                INDEX idx_serial_number (serial_number)
            )
            """
            
            cursor.execute(create_table_query)
            connection.commit()
            print("✅ Unique assets table created successfully")
            
            # Show table structure
            cursor.execute("DESCRIBE assets")
            columns = cursor.fetchall()
            print(f"Assets table has {len(columns)} columns:")
            for column in columns:
                print(f"  - {column[0]} ({column[1]})")
            
            # Insert sample data
            print("\n📋 Inserting sample assets data...")
            sample_assets = [
                ('AST001', 'Dell Laptop XPS 15', 'Computer', 'Laptop', 'Dell', 'DLX123456789', 'XPS15-9530', '2023-01-15', 1899.99, 1519.99, 10.00, '2023-01-15', '2025-01-15', True, '2025-01-15', 'IT Department', 'IT', 'John Doe', 'Active', 'Excellent', '2023-12-01', '2024-03-01', 'High-performance laptop for development', 'AST001BAR', 'AST001QR', True, 'Admin'),
                ('AST002', 'HP OfficeJet Pro Printer', 'Office Equipment', 'Printer', 'HP', 'HP901234567', 'OfficeJet-9010', '2023-02-20', 449.99, 359.99, 15.00, '2023-02-20', '2024-02-20', True, '2024-02-20', 'Reception', 'Administration', 'Reception', 'Active', 'Good', '2023-12-15', '2024-03-15', 'Multi-function printer for reception', 'AST002BAR', 'AST002QR', True, 'Admin'),
                ('AST003', 'Cisco Router 2960', 'Network Equipment', 'Router', 'Cisco', 'CS789456123', 'Catalyst-2960', '2022-09-15', 1299.99, 1039.99, 12.00, '2022-09-15', '2024-09-15', True, '2024-09-15', 'Server Room', 'IT', 'Network Team', 'Active', 'Excellent', '2023-12-01', '2024-02-01', 'Main network router', 'AST003BAR', 'AST003QR', True, 'Admin'),
                ('AST004', 'Samsung Monitor 27"', 'Display Equipment', 'Monitor', 'Samsung', 'SS456789123', 'S27B350', '2023-03-05', 299.99, 239.99, 8.00, '2023-03-05', '2025-03-05', False, None, 'Finance', 'Finance', 'Jane Smith', 'Active', 'Good', '2023-12-10', '2024-03-10', '27-inch monitor for finance', 'AST004BAR', 'AST004QR', True, 'Admin'),
                ('AST005', 'Lenovo ThinkStation', 'Computer', 'Desktop', 'Lenovo', 'LN321654987', 'ThinkStation-P360', '2023-04-12', 2499.99, 1999.99, 10.00, '2023-04-12', '2025-04-12', True, '2025-04-12', 'Engineering', 'Engineering', 'Mike Johnson', 'Active', 'Excellent', '2023-12-20', '2024-03-20', 'High-performance workstation', 'AST005BAR', 'AST005QR', True, 'Admin')
            ]
            
            insert_query = """
            INSERT INTO assets (
                asset_code, asset_name, asset_category, asset_type, brand, serial_number, 
                model_number, purchase_date, purchase_cost, current_value, depreciation_rate,
                warranty_start, warranty_end, maintenance_contract, contract_expiry,
                location, department, assigned_user, asset_status, condition_rating,
                last_inspection, next_inspection, notes, barcode, qr_code, is_active, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.executemany(insert_query, sample_assets)
            connection.commit()
            
            cursor.execute("SELECT COUNT(*) FROM assets")
            count = cursor.fetchone()[0]
            print(f"✅ Inserted {count} sample assets")
            
            # Show sample data
            cursor.execute("SELECT asset_code, asset_name, asset_category, asset_status FROM assets LIMIT 5")
            sample_data = cursor.fetchall()
            print("\n📊 Sample data in assets table:")
            for row in sample_data:
                print(f"  - {row[0]}: {row[1]} ({row[2]}) - {row[3]}")
            
            print(f"\n🎯 Assets table created with unique structure:")
            print(f"  - Different from hardware_register")
            print(f"  - Asset categories and types")
            print(f"  - Financial tracking (cost, value, depreciation)")
            print(f"  - Maintenance contracts")
            print(f"  - Condition ratings")
            print(f"  - Barcode/QR code support")
            print(f"  - Enhanced status tracking")
            
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
    create_unique_assets_table()
