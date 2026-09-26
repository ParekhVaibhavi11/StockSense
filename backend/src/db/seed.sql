-- StockSense Initial Seed Data

-- 1. Default Locations
INSERT INTO locations (name, code, type) VALUES
('Vendor Location', 'VEND/LOC', 'vendor'),
('Customer Location', 'CUST/LOC', 'customer'),
('Inventory Loss Adjustment', 'LOSS/LOC', 'inventory_loss'),
('Main Warehouse', 'WH/MAIN', 'internal'),
('Production Floor Rack', 'WH/PROD', 'internal'),
('Storage Rack A', 'WH/RACK-A', 'internal')
ON CONFLICT (code) DO NOTHING;

-- 2. Default Suppliers
INSERT INTO suppliers (name, email, phone, address) VALUES
('Apex Industrial Steel Corp', 'orders@apexsteel.com', '+1-555-0192', '100 Steelworks Way, Ohio, USA'),
('Global Hardware & Components', 'supply@globalhardware.io', '+1-555-0843', '45 Industrial Pkwy, Texas, USA')
ON CONFLICT DO NOTHING;

-- 3. Product Categories
INSERT INTO product_categories (name) VALUES
('Raw Materials'),
('Hardware & Components'),
('Finished Goods')
ON CONFLICT (name) DO NOTHING;

-- 4. Sample Products
INSERT INTO products (name, sku, category_id, uom, min_reorder_qty) VALUES
('Steel Rods (10mm)', 'SKU-STEEL-01', 1, 'kg', 50),
('Aluminum Frames', 'SKU-ALUM-02', 1, 'units', 20),
('M8 Hex Bolts', 'SKU-BOLT-08', 2, 'units', 100)
ON CONFLICT (sku) DO NOTHING;
