-- StockSense Database Schema (PostgreSQL)

-- 1. Users Table (Auth & OTP Verification)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'warehouse_staff', -- 'inventory_manager', 'warehouse_staff'
    is_verified BOOLEAN DEFAULT FALSE,
    verification_otp VARCHAR(6),
    otp_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Locations / Warehouses Table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'vendor', 'customer', 'internal', 'inventory_loss'
    parent_id INT REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suppliers (Vendors) Table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- 5. Products Catalog Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INT REFERENCES product_categories(id) ON DELETE SET NULL,
    uom VARCHAR(50) NOT NULL, -- e.g., 'kg', 'units', 'meters'
    min_reorder_qty INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Stock Quants Table (Current Stock per Location with Database Constraints)
CREATE TABLE IF NOT EXISTS stock_quants (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT unique_product_location UNIQUE (product_id, location_id),
    CONSTRAINT check_positive_quantity CHECK (quantity >= 0.00)
);

-- 7. Stock Operations (Receipts, Deliveries, Transfers, Adjustments Header)
CREATE TABLE IF NOT EXISTS stock_picking (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL, -- e.g., REC/00001, OUT/00001, INT/00001, ADJ/00001
    type VARCHAR(50) NOT NULL, -- 'receipt', 'delivery', 'internal', 'adjustment'
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL, -- Required for Receipts
    source_location_id INT REFERENCES locations(id),
    dest_location_id INT REFERENCES locations(id),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'waiting', 'ready', 'done', 'canceled'
    created_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP
);

-- 8. Stock Picking Lines & Move History Ledger
CREATE TABLE IF NOT EXISTS stock_move (
    id SERIAL PRIMARY KEY,
    picking_id INT REFERENCES stock_picking(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE RESTRICT,
    source_location_id INT REFERENCES locations(id),
    dest_location_id INT REFERENCES locations(id),
    quantity NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
