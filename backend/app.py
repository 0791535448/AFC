"""
ICT Infrastructure Automation System
Backend API using FastAPI
"""

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import mysql.connector
from datetime import datetime, timedelta
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
import secrets
import json
import bcrypt

app = FastAPI(title="ICT Infrastructure Automation API", version="1.0.0")

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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
    'password': os.getenv('DB_PASSWORD', 'root'),
    'database': os.getenv('DB_NAME', 'ict_automation')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection error: {err}")

# Authentication functions
def verify_password(plain_password, stored_password):
    # Supports bcrypt hashes and legacy plaintext passwords
    if stored_password and stored_password.startswith('$2'):
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8')[:72],
                stored_password.encode('utf-8'),
            )
        except Exception:
            return False
    return plain_password == stored_password

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt()).decode('utf-8')

def get_user_by_username(username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, username, email, full_name, role, department, password_hash, is_active FROM users WHERE username = %s",
            (username,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

def authenticate_user(username: str, password: str):
    user = get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user["password_hash"]):
        return False
    return user

def touch_last_login(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET last_login = %s WHERE username = %s", (datetime.now(), username))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user_by_username(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_active"):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Authentication models
class User(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str
    department: Optional[str] = None
    is_active: bool = True

class UserCreate(User):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

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

# Authentication endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    touch_last_login(user["username"])
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(user_login: UserLogin):
    user = authenticate_user(user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    touch_last_login(user["username"])
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return current_user

@app.post("/users", response_model=User)
async def create_user(user: UserCreate, current_user: dict = Depends(get_current_active_user)):
    # Only admins can create users
    if current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")
    
    # Check if user already exists
    existing_user = get_user_by_username(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        hashed_password = get_password_hash(user.password)
        query = """
        INSERT INTO users (username, email, full_name, role, department, password_hash, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            user.username, user.email, user.full_name, user.role, user.department,
            hashed_password, user.is_active, datetime.now(), datetime.now()
        )
        cursor.execute(query, values)
        conn.commit()
        user_dict = user.dict()
        user_dict.pop("password")  # Remove password from response
        return user_dict
    finally:
        cursor.close()
        conn.close()

# Users API (development - no auth required, mirrors /api/branches pattern)
USER_SELECT = """
    SELECT id, username, email, full_name, role, department, phone, last_login,
           specialization, skills, certifications, experience_level, on_call,
           is_active, created_at, updated_at
    FROM users
"""

def serialize_user(row):
    user = dict(row)
    for field in ('skills', 'certifications'):
        try:
            user[field] = json.loads(user[field]) if user.get(field) else []
        except (json.JSONDecodeError, TypeError):
            user[field] = []
    for field in ('assigned_equipment', 'tickets_assigned', 'tickets_resolved'):
        user[field] = 0
    user['avg_resolution_time'] = '0 hours'
    return user

@app.get("/api/users")
async def get_users_api(role: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = USER_SELECT
        params = []
        if role:
            query += " WHERE role = %s"
            params.append(role)
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        users = [serialize_user(row) for row in cursor.fetchall()]
        return {"users": users}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/users")
async def create_user_api(user: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        password = user.get('password') or 'password123'
        cursor.execute("""
            SELECT id FROM users WHERE username = %s OR email = %s
        """, (user.get('username'), user.get('email')))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")

        cursor.execute("""
            INSERT INTO users
            (username, email, full_name, role, department, password_hash,
             phone, specialization, skills, certifications, experience_level, on_call, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user.get('username'), user.get('email'), user.get('full_name'),
            user.get('role', 'User'), user.get('department'),
            get_password_hash(password),
            user.get('phone'), user.get('specialization'),
            json.dumps(user.get('skills') or []),
            json.dumps(user.get('certifications') or []),
            user.get('experience_level'),
            1 if user.get('on_call') else 0,
            1 if user.get('is_active', True) else 0,
        ))
        conn.commit()
        return {"message": "User created successfully", "user_id": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.put("/api/users/{user_id}")
async def update_user_api(user_id: int, user: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = {}
        direct_fields = ['username', 'email', 'full_name', 'role', 'department', 'phone',
                         'specialization', 'experience_level']
        for field in direct_fields:
            if user.get(field) is not None:
                updates[field] = user[field]
        if user.get('skills') is not None:
            updates['skills'] = json.dumps(user['skills'])
        if user.get('certifications') is not None:
            updates['certifications'] = json.dumps(user['certifications'])
        if user.get('on_call') is not None:
            updates['on_call'] = 1 if user['on_call'] else 0
        if user.get('is_active') is not None:
            updates['is_active'] = 1 if user['is_active'] else 0
        if user.get('password'):
            updates['password_hash'] = get_password_hash(user['password'])

        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        set_clause = ', '.join(f"{field} = %s" for field in updates)
        cursor.execute(
            f"UPDATE users SET {set_clause} WHERE id = %s",
            tuple(updates.values()) + (user_id,),
        )
        conn.commit()
        return {"message": "User updated successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/users/{user_id}")
async def delete_user_api(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        return {"message": "User deleted successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

# Hardware endpoints (protected)
@app.get("/hardware", response_model=List[HardwareItem])
async def get_hardware(current_user: dict = Depends(get_current_active_user)):
    """Get all hardware items"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM hardware_register WHERE is_active = TRUE ORDER BY created_at DESC")
        hardware = cursor.fetchall()
        return hardware
    finally:
        cursor.close()
        conn.close()

@app.post("/hardware", response_model=HardwareItem)
async def create_hardware(hardware: HardwareItem, current_user: dict = Depends(get_current_active_user)):
    """Create new hardware item"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO hardware_register 
        (asset_tag, device_type, make, model, serial_number, purchase_date, 
         warranty_expiry, status, location, assigned_to, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            hardware.asset_tag, hardware.device_type, hardware.make, hardware.model,
            hardware.serial_number, hardware.purchase_date, hardware.warranty_expiry,
            hardware.status, hardware.location, hardware.assigned_to, True,
            datetime.now(), datetime.now()
        )
        cursor.execute(query, values)
        conn.commit()
        hardware.id = cursor.lastrowid
        return hardware
    finally:
        cursor.close()
        conn.close()

# Repair endpoints (protected)
@app.get("/repairs", response_model=List[RepairRecord])
async def get_repairs(current_user: dict = Depends(get_current_active_user)):
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
async def create_repair(repair: RepairRecord, current_user: dict = Depends(get_current_active_user)):
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

@app.delete("/hardware/{hardware_id}")
async def delete_hardware(hardware_id: int, current_user: dict = Depends(get_current_active_user)):
    """Delete hardware item (soft delete)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE hardware_register SET is_active = FALSE WHERE id = %s", (hardware_id,))
        conn.commit()
        return {"message": "Hardware item deleted successfully"}
    finally:
        cursor.close()
        conn.close()

# Assets endpoints (protected)
ASSETS_SELECT = """
    SELECT a.id,
           a.asset_tag AS asset_code,
           dt.device_type_name AS asset_name,
           dt.category AS asset_category,
           hm.make_name AS asset_type,
           m.model_name AS brand,
           a.serial_number,
           '' AS model_number,
           '' AS department,
           b.branch_name AS location,
           a.assigned_to AS assigned_user,
           hs.status_name AS asset_status,
           a.notes,
           '' AS barcode,
           '' AS qr_code,
           a.is_active,
           a.acknowledged_at,
           a.created_at,
           a.updated_at
    FROM assets a
    LEFT JOIN device_types dt ON a.device_type_id = dt.id
    LEFT JOIN hardware_models m ON a.model_id = m.id
    LEFT JOIN hardware_makes hm ON m.make_id = hm.id
    LEFT JOIN branches b ON a.branch_id = b.id
    LEFT JOIN hardware_status hs ON a.status_id = hs.id
"""

def lookup_config_id(cursor, table, column, value):
    """Look up a config row id by name; returns None if blank or not found."""
    if not value:
        return None
    cursor.execute(
        f"SELECT id FROM {table} WHERE {column} = %s AND is_active = TRUE LIMIT 1",
        (value,),
    )
    row = cursor.fetchone()
    return row[0] if row else None

def resolve_asset_write_fields(asset, cursor):
    """Map flat frontend asset fields to assets table columns."""
    fields = {}
    if asset.get('asset_code') is not None:
        fields['asset_tag'] = asset['asset_code']
    if asset.get('serial_number') is not None:
        fields['serial_number'] = asset['serial_number']
    if asset.get('assigned_user') is not None:
        fields['assigned_to'] = asset['assigned_user']
    if asset.get('notes') is not None:
        fields['notes'] = asset['notes']
    if asset.get('location') is not None:
        fields['location'] = asset['location']
        branch_id = lookup_config_id(cursor, 'branches', 'branch_name', asset['location'])
        if branch_id:
            fields['branch_id'] = branch_id
    if asset.get('asset_name'):
        device_type_id = lookup_config_id(cursor, 'device_types', 'device_type_name', asset['asset_name'])
        if device_type_id:
            fields['device_type_id'] = device_type_id
    if asset.get('brand'):
        model_id = lookup_config_id(cursor, 'hardware_models', 'model_name', asset['brand'])
        if model_id:
            fields['model_id'] = model_id
    if asset.get('asset_status'):
        status_id = lookup_config_id(cursor, 'hardware_status', 'status_name', asset['asset_status'])
        if status_id:
            fields['status_id'] = status_id
    return fields

@app.get("/assets", response_model=List[dict])
async def get_assets(current_user: dict = Depends(get_current_active_user)):
    """Get all assets"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(ASSETS_SELECT + " WHERE a.is_active = TRUE ORDER BY a.created_at DESC")
        assets = cursor.fetchall()
        return assets
    finally:
        cursor.close()
        conn.close()

# Development endpoint - no auth required (for testing)
@app.get("/dev/assets", response_model=List[dict])
async def get_assets_dev():
    """Get all assets - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(ASSETS_SELECT + " WHERE a.is_active = TRUE ORDER BY a.created_at DESC")
        assets = cursor.fetchall()
        return assets
    finally:
        cursor.close()
        conn.close()

@app.post("/dev/assets", response_model=dict)
async def create_asset_dev(asset: dict):
    """Create new asset - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = resolve_asset_write_fields(asset, cursor)
        if not fields.get('asset_tag'):
            raise HTTPException(status_code=400, detail="asset_code is required")
        fields['is_active'] = True

        columns = ', '.join(fields.keys())
        placeholders = ', '.join(['%s'] * len(fields))
        cursor.execute(
            f"INSERT INTO assets ({columns}) VALUES ({placeholders})",
            tuple(fields.values()),
        )
        conn.commit()
        return {"message": "Asset created successfully", "asset_id": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.post("/assets", response_model=dict)
async def create_asset(asset: dict, current_user: dict = Depends(get_current_active_user)):
    """Create new asset"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = resolve_asset_write_fields(asset, cursor)
        if not fields.get('asset_tag'):
            raise HTTPException(status_code=400, detail="asset_code is required")
        fields['is_active'] = True

        columns = ', '.join(fields.keys())
        placeholders = ', '.join(['%s'] * len(fields))
        cursor.execute(
            f"INSERT INTO assets ({columns}) VALUES ({placeholders})",
            tuple(fields.values()),
        )
        conn.commit()
        return {"message": "Asset created successfully", "asset_id": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.put("/dev/assets/{asset_id}")
async def update_asset_dev(asset_id: int, asset: dict):
    """Update asset - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = resolve_asset_write_fields(asset, cursor)
        if not fields:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        set_clause = ', '.join(f"{field} = %s" for field in fields)
        cursor.execute(
            f"UPDATE assets SET {set_clause} WHERE id = %s",
            tuple(fields.values()) + (asset_id,),
        )
        conn.commit()

        return {"message": "Asset updated successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.put("/assets/{asset_id}")
async def update_asset(asset_id: int, asset: dict, current_user: dict = Depends(get_current_active_user)):
    """Update asset"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = resolve_asset_write_fields(asset, cursor)
        if not fields:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        set_clause = ', '.join(f"{field} = %s" for field in fields)
        cursor.execute(
            f"UPDATE assets SET {set_clause} WHERE id = %s",
            tuple(fields.values()) + (asset_id,),
        )
        conn.commit()

        return {"message": "Asset updated successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.delete("/dev/assets/{asset_id}")
async def delete_asset_dev(asset_id: int):
    """Delete asset (soft delete) - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE assets SET is_active = FALSE WHERE id = %s", (asset_id,))
        conn.commit()
        return {"message": "Asset deleted successfully"}
    finally:
        cursor.close()
        conn.close()

@app.delete("/assets/{asset_id}")
async def delete_asset(asset_id: int, current_user: dict = Depends(get_current_active_user)):
    """Delete asset (soft delete)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE assets SET is_active = FALSE WHERE id = %s", (asset_id,))
        conn.commit()
        return {"message": "Asset deleted successfully"}
    finally:
        cursor.close()
        conn.close()

# Asset Movement endpoints (protected)
@app.get("/asset-movements", response_model=List[AssetMovement])
async def get_asset_movements(current_user: dict = Depends(get_current_active_user)):
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
async def create_asset_movement(movement: AssetMovement, current_user: dict = Depends(get_current_active_user)):
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

# Settings API Endpoints

# Branches API (Development - no auth)
@app.get("/dev/branches")
async def get_branches_dev():
    """Get all branches - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM branches WHERE is_active = TRUE ORDER BY branch_name")
        branches = cursor.fetchall()
        return {"branches": branches}
    finally:
        cursor.close()
        conn.close()

# Branches API (Protected)
@app.get("/api/branches")
async def get_branches():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM branches WHERE is_active = TRUE ORDER BY branch_name")
        branches = cursor.fetchall()
        return {"branches": branches}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/branches")
async def create_branch(branch: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO branches (branch_name, branch_code, location_address, contact_person, contact_phone, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (branch.get('branch_name'), branch.get('branch_code'), branch.get('location_address'), 
              branch.get('contact_person'), branch.get('contact_phone'), branch.get('is_active', True)))
        conn.commit()
        branch['id'] = cursor.lastrowid
        return branch
    finally:
        cursor.close()
        conn.close()

@app.put("/api/branches/{branch_id}")
async def update_branch(branch_id: int, branch: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE branches 
            SET branch_name = %s, branch_code = %s, location_address = %s, 
                contact_person = %s, contact_phone = %s, is_active = %s
            WHERE id = %s
        """, (branch.get('branch_name'), branch.get('branch_code'), branch.get('location_address'), 
              branch.get('contact_person'), branch.get('contact_phone'), branch.get('is_active'), branch_id))
        conn.commit()
        return {**branch, "id": branch_id}
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/branches/{branch_id}")
async def delete_branch(branch_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE branches SET is_active = FALSE WHERE id = %s", (branch_id,))
        conn.commit()
        return {"message": "Branch deleted successfully"}
    finally:
        cursor.close()
        conn.close()

# Device Types API (Development - no auth)
@app.get("/dev/device-types")
async def get_device_types_dev():
    """Get all device types - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM device_types WHERE is_active = TRUE ORDER BY device_type_name")
        device_types = cursor.fetchall()
        return {"device_types": device_types}
    finally:
        cursor.close()
        conn.close()

# Device Types API (Protected)
@app.get("/api/device-types")
async def get_device_types():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM device_types WHERE is_active = TRUE ORDER BY device_type_name")
        device_types = cursor.fetchall()
        return {"device_types": device_types}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/device-types")
async def create_device_type(device_type: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO device_types (device_type_name, description, category, is_active)
            VALUES (%s, %s, %s, %s)
        """, (device_type.get('device_type_name'), device_type.get('description'), 
              device_type.get('category'), device_type.get('is_active', True)))
        conn.commit()
        device_type['id'] = cursor.lastrowid
        return device_type
    finally:
        cursor.close()
        conn.close()

@app.put("/api/device-types/{device_type_id}")
async def update_device_type(device_type_id: int, device_type: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE device_types 
            SET device_type_name = %s, description = %s, category = %s, is_active = %s
            WHERE id = %s
        """, (device_type.get('device_type_name'), device_type.get('description'), 
              device_type.get('category'), device_type.get('is_active'), device_type_id))
        conn.commit()
        return {**device_type, "id": device_type_id}
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/device-types/{device_type_id}")
async def delete_device_type(device_type_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE device_types SET is_active = FALSE WHERE id = %s", (device_type_id,))
        conn.commit()
        return {"message": "Device type deleted successfully"}
    finally:
        cursor.close()
        conn.close()

# Makes API (Development - no auth)
@app.get("/dev/makes")
async def get_makes_dev():
    """Get all hardware makes - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM hardware_makes WHERE is_active = TRUE ORDER BY make_name")
        makes = cursor.fetchall()
        return {"makes": makes}
    finally:
        cursor.close()
        conn.close()

# Makes API (Protected)
@app.get("/api/makes")
async def get_makes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM hardware_makes WHERE is_active = TRUE ORDER BY make_name")
        makes = cursor.fetchall()
        return {"makes": makes}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/makes")
async def create_make(make: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO hardware_makes (make_name, description, website, support_contact, is_active)
            VALUES (%s, %s, %s, %s, %s)
        """, (make.get('make_name'), make.get('description'), make.get('website'), 
              make.get('support_contact'), make.get('is_active', True)))
        conn.commit()
        make['id'] = cursor.lastrowid
        return make
    finally:
        cursor.close()
        conn.close()

@app.put("/api/makes/{make_id}")
async def update_make(make_id: int, make: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE hardware_makes 
            SET make_name = %s, description = %s, website = %s, support_contact = %s, is_active = %s
            WHERE id = %s
        """, (make.get('make_name'), make.get('description'), make.get('website'), 
              make.get('support_contact'), make.get('is_active'), make_id))
        conn.commit()
        return {**make, "id": make_id}
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/makes/{make_id}")
async def delete_make(make_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE hardware_makes SET is_active = FALSE WHERE id = %s", (make_id,))
        conn.commit()
        return {"message": "Make deleted successfully"}
    finally:
        cursor.close()
        conn.close()

# Models API (Development - no auth)
@app.get("/dev/models")
async def get_models_dev():
    """Get all hardware models - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT m.*, hm.make_name, dt.device_type_name 
            FROM hardware_models m
            JOIN hardware_makes hm ON m.make_id = hm.id
            JOIN device_types dt ON m.device_type_id = dt.id
            WHERE m.is_active = TRUE 
            ORDER BY m.model_name
        """)
        models = cursor.fetchall()
        return {"models": models}
    finally:
        cursor.close()
        conn.close()

# Models API (Protected)
@app.get("/api/models")
async def get_models():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT m.*, hm.make_name, dt.device_type_name 
            FROM hardware_models m
            JOIN hardware_makes hm ON m.make_id = hm.id
            JOIN device_types dt ON m.device_type_id = dt.id
            WHERE m.is_active = TRUE 
            ORDER BY m.model_name
        """)
        models = cursor.fetchall()
        return {"models": models}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/models")
async def create_model(model: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO hardware_models (model_name, make_id, device_type_id, specifications, release_year, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (model.get('model_name'), model.get('make_id'), model.get('device_type_id'), 
              model.get('specifications'), model.get('release_year'), model.get('is_active', True)))
        conn.commit()
        model['id'] = cursor.lastrowid
        return model
    finally:
        cursor.close()
        conn.close()

@app.put("/api/models/{model_id}")
async def update_model(model_id: int, model: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE hardware_models 
            SET model_name = %s, make_id = %s, device_type_id = %s, specifications = %s, release_year = %s, is_active = %s
            WHERE id = %s
        """, (model.get('model_name'), model.get('make_id'), model.get('device_type_id'), 
              model.get('specifications'), model.get('release_year'), model.get('is_active'), model_id))
        conn.commit()
        return {**model, "id": model_id}
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/models/{model_id}")
async def delete_model(model_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE hardware_models SET is_active = FALSE WHERE id = %s", (model_id,))
        conn.commit()
        return {"message": "Model deleted successfully"}
    finally:
        cursor.close()
        conn.close()

# Statuses API (Development - no auth)
@app.get("/dev/statuses")
async def get_statuses_dev():
    """Get all hardware statuses - development endpoint without authentication"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM hardware_status WHERE is_active = TRUE ORDER BY status_name")
        statuses = cursor.fetchall()
        return {"statuses": statuses}
    finally:
        cursor.close()
        conn.close()

# Statuses API (Protected)
@app.get("/api/statuses")
async def get_statuses():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM hardware_status WHERE is_active = TRUE ORDER BY status_name")
        statuses = cursor.fetchall()
        return {"statuses": statuses}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/statuses")
async def create_status(status: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO hardware_status (status_name, description, color_code, is_active)
            VALUES (%s, %s, %s, %s)
        """, (status.get('status_name'), status.get('description'), 
              status.get('color_code'), status.get('is_active', True)))
        conn.commit()
        status['id'] = cursor.lastrowid
        return status
    finally:
        cursor.close()
        conn.close()

@app.put("/api/statuses/{status_id}")
async def update_status(status_id: int, status: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE hardware_status 
            SET status_name = %s, description = %s, color_code = %s, is_active = %s
            WHERE id = %s
        """, (status.get('status_name'), status.get('description'), 
              status.get('color_code'), status.get('is_active'), status_id))
        conn.commit()
        return {**status, "id": status_id}
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/statuses/{status_id}")
async def delete_status(status_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE hardware_status SET is_active = FALSE WHERE id = %s", (status_id,))
        conn.commit()
        return {"message": "Status deleted successfully"}
    finally:
        cursor.close()
        conn.close()

# Software CRUD endpoints
@app.get("/api/software", response_model=List[dict])
async def get_software():
    """Get all software"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM software ORDER BY software_name")
        software = cursor.fetchall()
        return {"software": software}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/software", response_model=dict)
async def create_software(software: dict):
    """Create new software"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO software (software_name, software_provider, license_update_date, license_expiry_date, is_active)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            software['software_name'],
            software['software_provider'],
            software['license_update_date'],
            software['license_expiry_date'],
            software.get('is_active', True)
        ))
        conn.commit()
        return {"message": "Software created successfully", "id": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.put("/api/software/{software_id}", response_model=dict)
async def update_software(software_id: int, software: dict):
    """Update software"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
        UPDATE software SET 
        software_name = %s, software_provider = %s, license_update_date = %s, 
        license_expiry_date = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        """
        cursor.execute(query, (
            software['software_name'],
            software['software_provider'],
            software['license_update_date'],
            software['license_expiry_date'],
            software.get('is_active', True),
            software_id
        ))
        conn.commit()
        return {"message": "Software updated successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/software/{software_id}", response_model=dict)
async def delete_software(software_id: int):
    """Delete software"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM software WHERE id = %s", (software_id,))
        conn.commit()
        return {"message": "Software deleted successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

# Fault reports / support tickets API
@app.get("/api/fault-reports")
async def get_fault_reports(reported_by: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM fault_reports WHERE is_active = TRUE"
        params = []
        if reported_by:
            query += " AND reported_by = %s"
            params.append(reported_by)
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        return {"fault_reports": cursor.fetchall()}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/fault-reports")
async def create_fault_report(report: dict):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(*) AS cnt FROM fault_reports")
        ticket_number = f"FR-{datetime.now().year}-{cursor.fetchone()['cnt'] + 1:04d}"

        cursor.execute("""
            INSERT INTO fault_reports
            (ticket_number, subject, description, category, priority, reported_by, assigned_to, department, asset_tag)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            ticket_number,
            report.get('subject'),
            report.get('description'),
            report.get('category', 'other'),
            report.get('priority', 'Medium'),
            report.get('reported_by'),
            report.get('assigned_to'),
            report.get('department'),
            report.get('asset_tag'),
        ))
        conn.commit()
        return {"message": "Fault report submitted successfully", "ticket_number": ticket_number}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.put("/api/fault-reports/{report_id}")
async def update_fault_report(report_id: int, report: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = {}
        for field in ['subject', 'description', 'category', 'priority', 'status',
                      'resolution_notes', 'department', 'asset_tag', 'assigned_to', 'reported_by']:
            if report.get(field) is not None:
                updates[field] = report[field]
        if report.get('status') in ('Resolved', 'Closed') and 'resolved_at' not in updates:
            updates['resolved_at'] = datetime.now()
        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        set_clause = ', '.join(f"{f} = %s" for f in updates)
        cursor.execute(f"UPDATE fault_reports SET {set_clause} WHERE id = %s",
                       tuple(updates.values()) + (report_id,))
        conn.commit()
        return {"message": "Fault report updated successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.post("/api/assets/{asset_id}/assign")
async def assign_asset(asset_id: int, assignment: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE assets SET assigned_to = %s, acknowledged_at = NULL WHERE id = %s",
            (assignment.get('assigned_to'), asset_id),
        )
        conn.commit()
        return {"message": "Asset assigned successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.post("/api/assets/{asset_id}/acknowledge")
async def acknowledge_asset(asset_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE assets SET acknowledged_at = %s WHERE id = %s AND acknowledged_at IS NULL",
            (datetime.now(), asset_id),
        )
        conn.commit()
        return {"message": "Equipment receipt acknowledged"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/repair-forms")
async def get_repair_forms():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM repair_forms WHERE is_active = TRUE ORDER BY created_at DESC")
        return {"repair_forms": cursor.fetchall()}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/repair-forms")
async def create_repair_form(data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        devices = data.get('devices') or data.get('items') or []
        cursor.execute("""
            INSERT INTO repair_forms
            (branch, date_in, received_by, devices,
             prepared_by_name, prepared_by_signature, prepared_by_date,
             confirmed_by_name, confirmed_by_signature, confirmed_by_date,
             comment_by_hod,
             received_by_hod_name, received_by_hod_signature, received_by_hod_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get('branch'),
            data.get('date_in') or data.get('dateIn'),
            data.get('received_by') or data.get('receivedBy'),
            json.dumps(devices),
            data.get('prepared_by_name') or data.get('preparedByName'),
            data.get('prepared_by_signature') or data.get('preparedBySign'),
            data.get('prepared_by_date') or data.get('preparedByDate'),
            data.get('confirmed_by_name') or data.get('confirmedByName'),
            data.get('confirmed_by_signature') or data.get('confirmedBySign'),
            data.get('confirmed_by_date') or data.get('confirmedByDate'),
            data.get('comment_by_hod') or data.get('commentByHod'),
            data.get('received_by_hod_name') or data.get('receivedByHodName'),
            data.get('received_by_hod_signature') or data.get('receivedByHodSign'),
            data.get('received_by_hod_date') or data.get('receivedByHodDate'),
        ))
        conn.commit()
        return {"message": "Repair form saved successfully", "id": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/issue-notes")
async def get_issue_notes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM issue_notes WHERE is_active = TRUE ORDER BY created_at DESC")
        return {"issue_notes": cursor.fetchall()}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/issue-notes")
async def create_issue_note(data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        items = data.get('items') or []
        first = items[0] if items else {}
        cursor.execute("""
            INSERT INTO issue_notes
            (to_department, from_location, date_in, ref, subject, items,
             asset_tag, serial_number, issuing_officer, issuing_officer_role, message,
             received_by_name, received_by_designation, date_out)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get('to_department') or data.get('to') or '',
            data.get('from_location') or data.get('from_location') or 'ICT',
            data.get('date') or data.get('date_in'),
            data.get('ref') or '',
            data.get('subject') or data.get('re') or '',
            json.dumps(items),
            first.get('tag_number') or first.get('tagNo') or '',
            first.get('serial_number') or first.get('serialNumber') or '',
            data.get('issuing_officer'),
            data.get('issuing_officer_role'),
            data.get('message'),
            data.get('received_by_name'),
            data.get('received_by_designation'),
            data.get('date_out'),
        ))
        conn.commit()
        return {"message": "Issue note saved successfully", "id": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

SHEET_DEVICE_TYPE = {
    'all in one pc': 'Desktop',
    'laptops': 'Laptop',
    'scanners': 'Scanner',
    'printers': 'Printer',
    'telephones': 'Telephone',
    'cpu': 'Desktop',
    'ups': 'UPS',
}

def ensure_lookup_id(cursor, table, name_col, name, extra_cols=None):
    """Get or create a lookup row (branches, device_types, hardware_status) by name."""
    cursor.execute(f"SELECT id FROM {table} WHERE {name_col} = %s LIMIT 1", (name,))
    row = cursor.fetchone()
    if row:
        return row[0]
    cols = [name_col] + list((extra_cols or {}).keys())
    vals = [name] + list((extra_cols or {}).values())
    placeholders = ', '.join(['%s'] * len(vals))
    cursor.execute(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders})", vals)
    return cursor.lastrowid

def map_import_status(raw):
    s = (raw or '').strip().lower()
    if not s or s in ('n/a', 'na', 'none', '-'):
        return 'In Storage'
    if 'retir' in s or 'obsolet' in s or 'disposed' in s:
        return 'Retired'
    if 'lost' in s:
        return 'Lost'
    if 'storage' in s:
        return 'In Storage'
    if 'pend' in s:
        return 'Pending Assignment'
    if 'repair' in s or 'not working' in s or 'fault' in s or 'broken' in s or 'challenge' in s or 'old with' in s:
        return 'Under Repair'
    return 'Active'

def clean_import_tag(raw, fallback):
    tag = str(raw).strip() if raw is not None else ''
    if not tag or tag.upper() in ('N/A', 'NA', 'NO TAG', 'NOT TAGGED', 'NONE', '-'):
        return fallback
    return tag[:50]

def clean_import_serial(raw):
    if raw is None:
        return None
    if isinstance(raw, float):
        if raw != raw or raw == 0:
            return None
        s = str(int(raw)) if raw.is_integer() else str(raw).rstrip('0').rstrip('.')
    else:
        s = str(raw).strip()
    if not s or s.upper() in ('N/A', 'NA', 'NONE', '-') or s == '0':
        return None
    return s[:100]

@app.post("/api/assets/import")
async def import_assets(file: UploadFile = File(...)):
    """Import assets from an .xlsx workbook. Each sheet is a device category;
    columns: Branch, Model/Brand, Serial Number, Tag Number, Status."""
    import openpyxl
    import io
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        content = await file.read()
        wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)

        imported = updated = skipped = 0
        errors = []
        seq = 0

        for ws in wb.worksheets:
            device_type_name = SHEET_DEVICE_TYPE.get(ws.title.strip().lower())
            if not device_type_name:
                device_type_name = ws.title.strip()[:100] or 'Other'
            device_type_id = ensure_lookup_id(cursor, 'device_types', 'device_type_name', device_type_name,
                                               {'category': 'Imported', 'description': f'Imported from {ws.title}', 'is_active': 1})

            for row in ws.iter_rows(min_row=3, values_only=True):
                if not row or not row[0]:
                    continue
                branch_name = str(row[0]).strip()
                model_brand = str(row[1]).strip() if len(row) > 1 and row[1] is not None else ''
                serial = clean_import_serial(row[2] if len(row) > 2 else None)
                tag_raw = row[3] if len(row) > 3 else None
                status_raw = row[4] if len(row) > 4 else None

                if not model_brand and not serial and not tag_raw:
                    skipped += 1
                    continue
                if all(str(v).strip().upper() in ('N/A', 'NA', 'NONE', '-', '') for v in row[:5] if v is not None):
                    skipped += 1
                    continue

                seq += 1
                asset_tag = clean_import_tag(tag_raw, f"IMP-{ws.title[:10].upper()}-{seq:04d}")
                status_name = map_import_status(status_raw)
                status_id = ensure_lookup_id(cursor, 'hardware_status', 'status_name', status_name,
                                              {'description': f'Imported status: {status_name}', 'color_code': '#64748b', 'is_active': 1})
                branch_id = ensure_lookup_id(cursor, 'branches', 'branch_name', branch_name,
                                             {'branch_code': f"IMP{seq % 1000:03d}", 'location_address': '',
                                              'contact_person': '', 'contact_phone': '', 'is_active': 1}) if branch_name else None

                notes = f"Model/Brand: {model_brand} | Source: {file.filename}/{ws.title}".strip(' |')

                cursor.execute("SELECT id FROM assets WHERE asset_tag = %s", (asset_tag,))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                        UPDATE assets SET serial_number=%s, branch_id=%s, device_type_id=%s,
                            status_id=%s, notes=%s, is_active=TRUE
                        WHERE id=%s
                    """, (serial, branch_id, device_type_id, status_id, notes, existing[0]))
                    updated += 1
                else:
                    cursor.execute("""
                        INSERT INTO assets (asset_tag, serial_number, branch_id, device_type_id,
                            status_id, notes, is_active)
                        VALUES (%s, %s, %s, %s, %s, %s, TRUE)
                    """, (asset_tag, serial, branch_id, device_type_id, status_id, notes))
                    imported += 1

        conn.commit()
        return {"message": "Import complete", "imported": imported, "updated": updated, "skipped": skipped}
    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
