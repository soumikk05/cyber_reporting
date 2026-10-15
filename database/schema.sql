-- Crime Reporting System Database Schema
-- Run this file to create the database and tables

CREATE DATABASE IF NOT EXISTS crime_reporting_db;
USE crime_reporting_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crime Reports Table
CREATE TABLE IF NOT EXISTS crime_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    datetime DATETIME NOT NULL,
    image_path VARCHAR(255),
    status ENUM('Pending', 'Under Investigation', 'Closed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample admin user
-- Password: admin123 (in production, this would be hashed)
INSERT IGNORE INTO users (name, email, username, password, role) VALUES 
('Admin User', 'admin@example.com', 'admin', 'admin123', 'admin');

-- Insert sample regular user
-- Password: user123
INSERT IGNORE INTO users (name, email, username, password, role) VALUES 
('John Doe', 'john@example.com', 'john', 'user123', 'user');

-- Insert sample crime reports (IGNORE prevents duplicates if re-run)
INSERT IGNORE INTO crime_reports (user_id, crime_type, description, location, datetime, status) VALUES
(2, 'Theft', 'My bicycle was stolen from outside the grocery store', '123 Main Street', '2024-02-10 14:30:00', 'Under Investigation'),
(2, 'Vandalism', 'Graffiti on the community center wall', '456 Oak Avenue', '2024-02-12 09:15:00', 'Pending');
