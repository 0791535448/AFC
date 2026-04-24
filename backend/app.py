"""
ICT Infrastructure Automation System
Backend API using FastAPI
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import mysql.connector
from datetime import datetime
import os

app = FastAPI(title="ICT Infrastructure Automation API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ict_automation')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection error: {err}")

# Pydantic models
class HardwareItem(BaseModel):
    id: Optional[int] = None
    asset_tag: str
    device_type: str
    make: str
    model: str
    serial_number: str
    purchase_date: str
    warranty_expiry: str
    status: str
    location: str
    assigned_to: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class RepairRecord(BaseModel):
    id: Optional[int] = None
    hardware_id: int
    issue_description: str
    reported_by: str
    reported_date: str
    priority: str
    status: str
    assigned_to: Optional[str] = None
    resolution_details: Optional[str] = None
    resolved_date: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class AssetMovement(BaseModel):
    id: Optional[int] = None
    hardware_id: int
    from_location: str
    to_location: str
    moved_by: str
    move_date: str
    reason: str
    created_at: Optional[datetime] = None

# API Routes
@app.get("/")
async def root():
    return {"message": "ICT Infrastructure Automation API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Hardware endpoints
@app.get("/hardware", response_model=List[HardwareItem])
async def get_hardware():
    """Get all hardware items"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM hardware_register ORDER BY created_at DESC")
        hardware = cursor.fetchall()
        return hardware
    finally:
        cursor.close()
        conn.close()

@app.post("/hardware", response_model=HardwareItem)
async def create_hardware(hardware: HardwareItem):
    """Create new hardware item"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO hardware_register 
        (asset_tag, device_type, make, model, serial_number, purchase_date, 
         warranty_expiry, status, location, assigned_to, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            hardware.asset_tag, hardware.device_type, hardware.make, hardware.model,
            hardware.serial_number, hardware.purchase_date, hardware.warranty_expiry,
            hardware.status, hardware.location, hardware.assigned_to,
            datetime.now(), datetime.now()
        )
        cursor.execute(query, values)
        conn.commit()
        hardware.id = cursor.lastrowid
        return hardware
    finally:
        cursor.close()
        conn.close()

# Repair endpoints
@app.get("/repairs", response_model=List[RepairRecord])
async def get_repairs():
    """Get all repair records"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM repair_register ORDER BY reported_date DESC")
        repairs = cursor.fetchall()
        return repairs
    finally:
        cursor.close()
        conn.close()

@app.post("/repairs", response_model=RepairRecord)
async def create_repair(repair: RepairRecord):
    """Create new repair record"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO repair_register 
        (hardware_id, issue_description, reported_by, reported_date, priority, 
         status, assigned_to, resolution_details, resolved_date, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            repair.hardware_id, repair.issue_description, repair.reported_by,
            repair.reported_date, repair.priority, repair.status, repair.assigned_to,
            repair.resolution_details, repair.resolved_date, datetime.now(), datetime.now()
        )
        cursor.execute(query, values)
        conn.commit()
        repair.id = cursor.lastrowid
        return repair
    finally:
        cursor.close()
        conn.close()

# Asset Movement endpoints
@app.get("/asset-movements", response_model=List[AssetMovement])
async def get_asset_movements():
    """Get all asset movement records"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM asset_movements ORDER BY move_date DESC")
        movements = cursor.fetchall()
        return movements
    finally:
        cursor.close()
        conn.close()

@app.post("/asset-movements", response_model=AssetMovement)
async def create_asset_movement(movement: AssetMovement):
    """Create new asset movement record"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO asset_movements 
        (hardware_id, from_location, to_location, moved_by, move_date, reason, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            movement.hardware_id, movement.from_location, movement.to_location,
            movement.moved_by, movement.move_date, movement.reason, datetime.now()
        )
        cursor.execute(query, values)
        conn.commit()
        movement.id = cursor.lastrowid
        return movement
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
