# ICT Infrastructure Automation System

A comprehensive system to automate manual ICT infrastructure processes including repair registers, hardware registers, task management, and asset tracking.

## Technology Stack

- **Backend**: Python with FastAPI
- **Database**: MySQL
- **Frontend**: NodeJS with Next.js and React
- **UI Framework**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
ict_automation/
├── backend/                 # Python FastAPI backend
│   ├── app.py              # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── ...                 # Additional backend files
├── frontend/               # Next.js frontend
│   ├── package.json        # Node.js dependencies
│   └── ...                 # Additional frontend files
├── database/              # Database schema and migrations
│   └── schema.sql         # MySQL database schema
├── docs/                  # Documentation
└── README.md             # This file
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- MySQL Server
- Git

### 1. Virtual Environment Setup
```bash
# Create virtual environment
python -m venv ict_automation_env

# Activate virtual environment (Windows)
PowerShell -ExecutionPolicy Bypass -Command "& 'path\to\ict_automation_env\Scripts\Activate.ps1'"

# Activate virtual environment (Linux/Mac)
source ict_automation_env/bin/activate
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Create database and tables
mysql -u root -p < database/schema.sql
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Environment Configuration
Create `.env` file in backend directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ict_automation
```

## Running the Application

### Backend Server
```bash
cd backend
python app.py
```
Server will run on http://localhost:8000

### Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

### Phase 1 (Core Foundation)
- ✅ Hardware Register
- ✅ Asset Movement Tracking
- ✅ Repair Register

### Phase 2 (Operational Efficiency)
- 🔄 Task Queuing System
- 🔄 Weekly Tasks Management
- 🔄 Repair Forms

### Phase 3 (Advanced Features)
- 📋 Issue Notes System
- 📊 Reporting Dashboard

## Database Schema

The system includes the following main tables:
- `hardware_register` - ICT hardware inventory
- `repair_register` - Repair and maintenance records
- `asset_movements` - Asset location tracking
- `task_queue` - Task management system
- `weekly_tasks` - Scheduled maintenance tasks
- `issue_notes` - Communication and documentation
- `users` - User management and authentication

## Development Workflow

1. **Backend Development**: API endpoints and business logic
2. **Database Design**: Schema creation and migrations
3. **Frontend Development**: UI components and user experience
4. **Integration**: Connecting frontend to backend APIs
5. **Testing**: Unit tests and integration tests
6. **Deployment**: Production setup and configuration

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details
