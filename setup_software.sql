-- Create Software Table
CREATE TABLE IF NOT EXISTS software (
    id INT AUTO_INCREMENT PRIMARY KEY,
    software_name VARCHAR(255) NOT NULL,
    software_provider VARCHAR(255) NOT NULL,
    license_update_date DATE,
    license_expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_software_name (software_name),
    INDEX idx_is_active (is_active)
);

-- Insert Predefined Software Data
INSERT INTO software (software_name, software_provider, license_update_date, license_expiry_date, is_active) VALUES
('BR Net', 'BR Systems', '2024-01-15', '2025-01-15', TRUE),
('FITNES', 'FITNES Corp', '2024-02-20', '2025-02-20', TRUE),
('Perpay', 'Perpay Solutions', '2024-03-10', '2025-03-10', TRUE),
('SOPHOS', 'Sophos Ltd', '2024-04-05', '2025-04-05', TRUE),
('Zimbra', 'Zimbra Inc', '2024-05-12', '2025-05-12', TRUE),
('GP', 'Microsoft Dynamics', '2024-06-18', '2025-06-18', TRUE),
('Kaspersky', 'Kaspersky Lab', '2024-07-22', '2025-07-22', TRUE);

-- Verify Data
SELECT * FROM software ORDER BY software_name;
