#!/usr/bin/env python3
import mysql.connector
import os

def setup_database():
    try:
        # Connect to MySQL without specifying database
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root'
        )
        
        if connection.is_connected():
            print("Successfully connected to MySQL server")
            
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS ict_automation")
            print("Database 'ict_automation' created or already exists")
            
            # Use the database
            cursor.execute("USE ict_automation")
            
            # Read and execute schema.sql
            with open('database/schema.sql', 'r') as f:
                schema_sql = f.read()
                
            # Split by semicolon and execute each statement
            statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
            
            for statement in statements:
                if statement:
                    cursor.execute(statement)
                    
            connection.commit()
            print("Database schema imported successfully")
            
            # Show tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"Created {len(tables)} tables:")
            for table in tables:
                print(f"  - {table[0]}")
            
    except mysql.connector.Error as e:
        print(f"Error connecting to MySQL: {e}")
        print("Please ensure MySQL is running and the credentials are correct")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed")
    
    return True

if __name__ == "__main__":
    setup_database()
