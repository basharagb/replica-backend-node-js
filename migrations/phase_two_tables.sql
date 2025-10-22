-- Phase Two: Warehouse Management System - Additional Tables
-- Adding new tables to existing 'silos' database for Phase Two functionality

USE silos;

-- Material Types Table
CREATE TABLE IF NOT EXISTS material_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    icon_path VARCHAR(255),
    color_code VARCHAR(7) DEFAULT '#4ECDC4',
    density DECIMAL(8,3) DEFAULT 1.000 COMMENT 'Density in kg/m³',
    unit VARCHAR(20) DEFAULT 'tons' COMMENT 'Measurement unit',
    notes TEXT COMMENT 'Optional notes about material type',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Warehouse Inventory Table (extends existing silos)
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    silo_id INT NOT NULL,
    material_type_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000 COMMENT 'Quantity in tons',
    reserved_quantity DECIMAL(10,3) DEFAULT 0.000 COMMENT 'Reserved for outgoing shipments',
    available_quantity DECIMAL(10,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE NULL,
    batch_number VARCHAR(50),
    supplier VARCHAR(100),
    quality_grade VARCHAR(20) DEFAULT 'A',
    purchase_price DECIMAL(10,2),
    notes TEXT COMMENT 'Optional notes about this inventory item',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (silo_id) REFERENCES silos(id) ON DELETE CASCADE,
    FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE RESTRICT,
    INDEX idx_silo_material (silo_id, material_type_id),
    INDEX idx_batch (batch_number),
    INDEX idx_expiry (expiry_date)
);

-- Shipments Table (Incoming & Outgoing)
CREATE TABLE IF NOT EXISTS shipments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shipment_type ENUM('INCOMING', 'OUTGOING') NOT NULL,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    silo_id INT NOT NULL,
    material_type_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    scheduled_date DATETIME NOT NULL,
    actual_date DATETIME NULL,
    truck_plate VARCHAR(20),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    supplier_customer VARCHAR(100) COMMENT 'Supplier for incoming, Customer for outgoing',
    status ENUM('SCHEDULED', 'IN_TRANSIT', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    confirmation_code VARCHAR(10),
    notes TEXT COMMENT 'Optional notes about shipment',
    created_by INT COMMENT 'User ID who created the shipment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (silo_id) REFERENCES silos(id) ON DELETE CASCADE,
    FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE RESTRICT,
    INDEX idx_reference (reference_number),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status),
    INDEX idx_type_status (shipment_type, status)
);

-- Shipment Operations Log
CREATE TABLE IF NOT EXISTS shipment_operations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shipment_id INT NOT NULL,
    operation_type ENUM('LOADING', 'UNLOADING', 'INSPECTION', 'QUALITY_CHECK') NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    operator_name VARCHAR(100),
    quantity_processed DECIMAL(10,3),
    quality_notes TEXT,
    notes TEXT COMMENT 'Optional operation notes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    INDEX idx_shipment_operation (shipment_id, operation_type)
);

-- Silo Notes Table (for additional notes about silos in warehouse context)
CREATE TABLE IF NOT EXISTS silo_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    silo_id INT NOT NULL,
    note_type ENUM('MAINTENANCE', 'CAPACITY', 'RESTRICTION', 'GENERAL') DEFAULT 'GENERAL',
    title VARCHAR(200),
    content TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT COMMENT 'User ID who created the note',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (silo_id) REFERENCES silos(id) ON DELETE CASCADE,
    INDEX idx_silo_type (silo_id, note_type),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active)
);

-- Insert default material types
INSERT INTO material_types (name, name_ar, description, color_code, density, icon_path) VALUES
('Wheat', 'قمح', 'Premium wheat grains', '#F4A460', 0.780, '/icons/wheat.svg'),
('Corn', 'ذرة', 'Yellow corn kernels', '#FFD700', 0.720, '/icons/corn.svg'),
('Barley', 'شعير', 'Barley grains', '#DEB887', 0.650, '/icons/barley.svg'),
('Rice', 'أرز', 'White rice grains', '#F5F5DC', 0.750, '/icons/rice.svg'),
('Soybean', 'فول الصويا', 'Soybean seeds', '#9ACD32', 0.750, '/icons/soybean.svg'),
('Oats', 'شوفان', 'Oat grains', '#D2B48C', 0.410, '/icons/oats.svg');
