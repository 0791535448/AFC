"""
ICT Infrastructure Automation System
Backend API using FastAPI
"""

from fastapi import FastAPI, HTTPException, Depends, status
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
    'password': os.getenv('DB_PASSWORD', ''),
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
    # Temporary plain text comparison for demo
    return plain_password == stored_password

def get_password_hash(password):
    # Return password as-is for temporary solution
    return password

def get_user_by_username(username: str):
    # Temporary hardcoded users until database is set up
    users = {
        "superadmin": {
            "id": 1,
            "username": "superadmin",
            "email": "superadmin@company.com",
            "full_name": "Super Administrator",
            "role": "Super Admin",
            "department": "IT",
            "password_hash": "password123",
            "is_active": True
        },
        "admin": {
            "id": 2,
            "username": "admin",
            "email": "admin@company.com",
            "full_name": "System Administrator",
            "role": "Admin",
            "department": "IT",
            "password_hash": "password123",
            "is_active": True
        },
        "jdoe": {
            "id": 3,
            "username": "jdoe",
            "email": "john.doe@company.com",
            "full_name": "John Doe",
            "role": "Technician",
            "department": "IT",
            "password_hash": "password123",
            "is_active": True
        },
        "jsmith": {
            "id": 4,
            "username": "jsmith",
            "email": "jane.smith@company.com",
            "full_name": "Jane Smith",
            "role": "Manager",
            "department": "Finance",
            "password_hash": "password123",
            "is_active": True
        }
    }
    return users.get(username)

def authenticate_user(username: str, password: str):
    user = get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user["password_hash"]):
        return False
    return user

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

# Hardware endpoints (protected)
@app.get("/hardware", response_model=List[HardwareItem])
async def get_hardware(current_user: dict = Depends(get_current_active_user)):
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
async def create_hardware(hardware: HardwareItem, current_user: dict = Depends(get_current_active_user)):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
