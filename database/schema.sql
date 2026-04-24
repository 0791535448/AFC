-- ICT Infrastructure Automation Database Schema
-- MySQL Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS ict_automation;
USE ict_automation;

-- Configuration Tables for Hardware Register

-- Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) UNIQUE NOT NULL,
    branch_code VARCHAR(20) UNIQUE NOT NULL,
    location_address TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch_code (branch_code),
    INDEX idx_is_active (is_active)
);

-- Device Types Table
CREATE TABLE IF NOT EXISTS device_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_type_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_type_name (device_type_name),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- Hardware Makes Table
CREATE TABLE IF NOT EXISTS hardware_makes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    make_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(255),
    support_contact VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_make_name (make_name),
    INDEX idx_is_active (is_active)
);

-- Hardware Models Table
CREATE TABLE IF NOT EXISTS hardware_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    make_id INT NOT NULL,
    device_type_id INT NOT NULL,
    specifications TEXT,
    release_year INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (make_id) REFERENCES hardware_makes(id) ON DELETE RESTRICT,
    FOREIGN KEY (device_type_id) REFERENCES device_types(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_model (model_name, make_id, device_type_id),
    INDEX idx_model_name (model_name),
    INDEX idx_make_id (make_id),
    INDEX idx_device_type_id (device_type_id),
    INDEX idx_is_active (is_active)
);

-- Hardware Status Table
CREATE TABLE IF NOT EXISTS hardware_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color_code VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_name (status_name),
    INDEX idx_is_active (is_active)
);

-- Hardware Register Table (Modified)
CREATE TABLE IF NOT EXISTS hardware_register (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    branch_id INT NOT NULL,
    device_type_id INT NOT NULL,
    model_id INT NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    purchase_date DATE NOT NULL,
    warranty_expiry DATE,
    status_id INT NOT NULL DEFAULT 1,
    location VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    FOREIGN KEY (device_type_id) REFERENCES device_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (model_id) REFERENCES hardware_models(id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES hardware_status(id) ON DELETE RESTRICT,
    INDEX idx_asset_tag (asset_tag),
    INDEX idx_serial_number (serial_number),
    INDEX idx_branch_id (branch_id),
    INDEX idx_device_type_id (device_type_id),
    INDEX idx_model_id (model_id),
    INDEX idx_status_id (status_id),
    INDEX idx_location (location),
    INDEX idx_assigned_to (assigned_to)
);

-- Repair Register Table
CREATE TABLE IF NOT EXISTS repair_register (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hardware_id INT NOT NULL,
    issue_description TEXT NOT NULL,
    reported_by VARCHAR(255) NOT NULL,
    reported_date DATE NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Pending',
    assigned_to VARCHAR(255),
    resolution_details TEXT,
    resolved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hardware_id) REFERENCES hardware_register(id) ON DELETE CASCADE,
    INDEX idx_hardware_id (hardware_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_reported_date (reported_date)
);

-- Asset Movements Table
CREATE TABLE IF NOT EXISTS asset_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hardware_id INT NOT NULL,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    moved_by VARCHAR(255) NOT NULL,
    move_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hardware_id) REFERENCES hardware_register(id) ON DELETE CASCADE,
    INDEX idx_hardware_id (hardware_id),
    INDEX idx_move_date (move_date),
    INDEX idx_from_location (from_location),
    INDEX idx_to_location (to_location)
);

-- Weekly Tasks Table
CREATE TABLE IF NOT EXISTS weekly_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Completed', 'Overdue') DEFAULT 'Pending',
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- Task Queue Table
CREATE TABLE IF NOT EXISTS task_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_type ENUM('Repair', 'Maintenance', 'Installation', 'Inspection', 'Other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Queued', 'Assigned', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Queued',
    assigned_to VARCHAR(255),
    hardware_id INT,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (hardware_id) REFERENCES hardware_register(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_task_type (task_type),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at)
);

-- Issue Notes Table
CREATE TABLE IF NOT EXISTS issue_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    related_table ENUM('hardware_register', 'repair_register', 'task_queue', 'weekly_tasks') NOT NULL,
    related_id INT NOT NULL,
    note_text TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_internal BOOLEAN DEFAULT FALSE,
    INDEX idx_related (related_table, related_id),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- Users Table (for authentication and authorization)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('Super Admin', 'Admin', 'Manager', 'Technician', 'User') DEFAULT 'User',
    department VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insert sample data for configuration tables

-- Branches
INSERT INTO branches (branch_name, branch_code, location_address, contact_person, contact_phone) VALUES
('Head Office', 'HO', '123 Main Street, Nairobi, Kenya', 'John Manager', '+254-712-345-678'),
('IT Department', 'IT', '456 Tech Avenue, Nairobi, Kenya', 'Jane IT', '+254-723-456-789'),
('Finance Department', 'FIN', '789 Finance Road, Nairobi, Kenya', 'Mike Finance', '+254-734-567-890'),
('Reception', 'REC', '321 Reception Lane, Nairobi, Kenya', 'Sarah Reception', '+254-745-678-901');

-- Device Types
INSERT INTO device_types (device_type_name, description, category) VALUES
('Laptop', 'Portable computer for mobile work', 'Computer'),
('Desktop', 'Desktop computer for office work', 'Computer'),
('Printer', 'Document printing device', 'Peripheral'),
('Monitor', 'Display screen for computers', 'Peripheral'),
('Server', 'Enterprise server equipment', 'Infrastructure'),
('Router', 'Network routing device', 'Network'),
('Switch', 'Network switching device', 'Network'),
('Scanner', 'Document scanning device', 'Peripheral');

-- Hardware Makes
INSERT INTO hardware_makes (make_name, description, website, support_contact) VALUES
('Dell', 'Dell Inc. computer hardware', 'https://www.dell.com', 'support@dell.com'),
('HP', 'Hewlett-Packard computer hardware', 'https://www.hp.com', 'support@hp.com'),
('Canon', 'Canon printing and imaging equipment', 'https://www.canon.com', 'support@canon.com'),
('LG', 'LG Electronics displays and electronics', 'https://www.lg.com', 'support@lg.com'),
('Cisco', 'Cisco networking equipment', 'https://www.cisco.com', 'support@cisco.com'),
('Lenovo', 'Lenovo computer hardware', 'https://www.lenovo.com', 'support@lenovo.com'),
('Epson', 'Epson printing equipment', 'https://www.epson.com', 'support@epson.com'),
('Samsung', 'Samsung electronics and displays', 'https://www.samsung.com', 'support@samsung.com');

-- Hardware Models
INSERT INTO hardware_models (model_name, make_id, device_type_id, specifications, release_year) VALUES
('Latitude 7420', 1, 1, 'Intel Core i7, 16GB RAM, 512GB SSD', 2023),
('EliteDesk 800', 2, 2, 'Intel Core i5, 8GB RAM, 256GB SSD', 2022),
('IR-ADV 4535', 3, 3, 'Multi-function printer, 45ppm, Color', 2021),
('27UL850', 4, 4, '27-inch 4K UHD Monitor, USB-C', 2022),
('ThinkPad X1 Carbon', 6, 1, 'Intel Core i7, 16GB RAM, 1TB SSD', 2023),
('Epson EcoTank L3150', 7, 3, 'Ink Tank Printer, Wireless', 2022),
('Cisco Catalyst 2960', 5, 6, '24-port Gigabit Switch', 2021);

-- Hardware Status
INSERT INTO hardware_status (status_name, description, color_code) VALUES
('Active', 'Device is in use and operational', '#22c55e'),
('Under Repair', 'Device is being repaired', '#f59e0b'),
('Retired', 'Device is no longer in service', '#64748b'),
('Lost', 'Device has been lost', '#ef4444'),
('Disposed', 'Device has been disposed', '#991b1b'),
('In Storage', 'Device is in storage', '#8b5cf6'),
('Pending Assignment', 'Device awaiting assignment', '#06b6d4');

-- Insert sample data for hardware register (updated with foreign keys)
INSERT INTO hardware_register (asset_tag, branch_id, device_type_id, model_id, serial_number, purchase_date, warranty_expiry, status_id, location, assigned_to, notes) VALUES
('ICT001', 2, 1, 1, 'DL74202023001', '2023-01-15', '2026-01-15', 1, 'IT Office', 'John Doe', 'Primary laptop for IT support'),
('ICT002', 3, 2, 2, 'HPED8002022001', '2022-06-20', '2025-06-20', 1, 'Finance Office', 'Jane Smith', 'Finance department desktop'),
('ICT003', 4, 3, 3, 'CN45352021001', '2021-03-10', '2024-03-10', 2, 'Reception', NULL, 'Main reception printer - under repair'),
('ICT004', 1, 4, 4, 'LG27UL8502022001', '2022-11-05', '2025-11-05', 1, 'Conference Room', NULL, 'Conference room monitor'),
('ICT005', 2, 1, 5, 'TPX1C2023002', '2023-03-01', '2026-03-01', 1, 'IT Office', 'Jane IT', 'IT manager laptop'),
('ICT006', 3, 3, 6, 'EPL3150202201', '2022-08-15', '2025-08-15', 1, 'Finance Office', 'Mike Finance', 'Finance department backup printer');

INSERT INTO users (username, email, full_name, role, department, password_hash) VALUES
('superadmin', 'superadmin@company.com', 'Super Administrator', 'Super Admin', 'IT', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe'),
('admin', 'admin@company.com', 'System Administrator', 'Admin', 'IT', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe'),
('jdoe', 'john.doe@company.com', 'John Doe', 'Technician', 'IT', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe'),
('jsmith', 'jane.smith@company.com', 'Jane Smith', 'Manager', 'Finance', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe');

-- Create views for common queries (updated for foreign keys)
CREATE VIEW hardware_status_summary AS
SELECT 
    dt.device_type_name as device_type,
    hs.status_name as status,
    COUNT(*) as count
FROM hardware_register hr
JOIN device_types dt ON hr.device_type_id = dt.id
JOIN hardware_status hs ON hr.status_id = hs.id
GROUP BY dt.device_type_name, hs.status_name;

CREATE VIEW repair_summary AS
SELECT 
    priority,
    status,
    COUNT(*) as count
FROM repair_register
GROUP BY priority, status;

CREATE VIEW pending_tasks AS
SELECT 
    tq.*,
    hr.asset_tag,
    dt.device_type_name as device_type
FROM task_queue tq
LEFT JOIN hardware_register hr ON tq.hardware_id = hr.id
LEFT JOIN device_types dt ON hr.device_type_id = dt.id
WHERE tq.status IN ('Queued', 'Assigned', 'In Progress')
ORDER BY tq.priority DESC, tq.created_at ASC;

-- Additional useful views for the new schema
CREATE VIEW hardware_inventory_details AS
SELECT 
    hr.id,
    hr.asset_tag,
    b.branch_name,
    dt.device_type_name,
    hm.make_name,
    hmodel.model_name,
    hr.serial_number,
    hr.purchase_date,
    hr.warranty_expiry,
    hs.status_name,
    hs.color_code,
    hr.location,
    hr.assigned_to,
    hr.notes,
    hr.created_at,
    hr.updated_at
FROM hardware_register hr
JOIN branches b ON hr.branch_id = b.id
JOIN device_types dt ON hr.device_type_id = dt.id
JOIN hardware_models hmodel ON hr.model_id = hmodel.id
JOIN hardware_makes hm ON hmodel.make_id = hm.id
JOIN hardware_status hs ON hr.status_id = hs.id;

CREATE VIEW branch_hardware_summary AS
SELECT 
    b.branch_name,
    b.branch_code,
    COUNT(hr.id) as total_hardware,
    SUM(CASE WHEN hs.status_name = 'Active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN hs.status_name = 'Under Repair' THEN 1 ELSE 0 END) as repair_count,
    SUM(CASE WHEN hs.status_name = 'In Storage' THEN 1 ELSE 0 END) as storage_count
FROM branches b
LEFT JOIN hardware_register hr ON b.id = hr.branch_id
LEFT JOIN hardware_status hs ON hr.status_id = hs.id
GROUP BY b.branch_name, b.branch_code
ORDER BY b.branch_name;
