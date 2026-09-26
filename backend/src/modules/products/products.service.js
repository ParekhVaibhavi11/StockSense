import { query, getClient } from '../../config/db.js';

/**
 * Fetch all products with search, category filtering, and total stock count
 */
export const getAllProducts = async ({ search = '', category_id = null }) => {
  let sql = `
    SELECT 
      p.id, 
      p.name, 
      p.sku, 
      p.uom, 
      p.min_reorder_qty, 
      p.category_id, 
      c.name AS category_name,
      COALESCE(SUM(sq.quantity), 0) AS total_stock,
      p.created_at
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.id
    LEFT JOIN stock_quants sq ON p.id = sq.product_id
    LEFT JOIN locations l ON sq.location_id = l.id AND l.type = 'internal'
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
  }

  if (category_id) {
    params.push(category_id);
    sql += ` AND p.category_id = $${params.length}`;
  }

  sql += ` GROUP BY p.id, c.name ORDER BY p.name ASC`;

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get Product by ID with location-wise stock breakdown
 */
export const getProductById = async (id) => {
  const prodRes = await query(
    `SELECT p.id, p.name, p.sku, p.uom, p.min_reorder_qty, p.category_id, c.name AS category_name, p.created_at
     FROM products p
     LEFT JOIN product_categories c ON p.category_id = c.id
     WHERE p.id = $1`,
    [id]
  );

  if (prodRes.rows.length === 0) {
    throw new Error('Product not found.');
  }

  const product = prodRes.rows[0];

  // Fetch stock availability breakdown per location
  const stockRes = await query(
    `SELECT sq.location_id, l.name AS location_name, l.code AS location_code, l.type AS location_type, sq.quantity
     FROM stock_quants sq
     JOIN locations l ON sq.location_id = l.id
     WHERE sq.product_id = $1 AND sq.quantity > 0
     ORDER BY l.name ASC`,
    [id]
  );

  product.stock_breakdown = stockRes.rows;
  product.total_stock = stockRes.rows
    .filter(row => row.location_type === 'internal')
    .reduce((sum, row) => sum + Number(row.quantity), 0);

  return product;
};

/**
 * Create new product with optional initial stock
 */
export const createProduct = async ({ name, sku, category_id, uom, min_reorder_qty = 10, initial_stock = 0 }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // SKU Uniqueness Check
    const checkSku = await client.query('SELECT id FROM products WHERE sku = $1', [sku.toUpperCase()]);
    if (checkSku.rows.length > 0) {
      throw new Error(`Product SKU '${sku}' already exists.`);
    }

    const prodRes = await client.query(
      `INSERT INTO products (name, sku, category_id, uom, min_reorder_qty)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, sku, category_id, uom, min_reorder_qty, created_at`,
      [name, sku.toUpperCase(), category_id || null, uom, min_reorder_qty]
    );

    const newProduct = prodRes.rows[0];

    // If initial stock > 0, assign stock to Main Warehouse
    if (initial_stock > 0) {
      const locRes = await client.query("SELECT id FROM locations WHERE code = 'WH/MAIN' LIMIT 1");
      if (locRes.rows.length > 0) {
        const mainLocId = locRes.rows[0].id;
        await client.query(
          `INSERT INTO stock_quants (product_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, location_id) DO UPDATE SET quantity = stock_quants.quantity + $3`,
          [newProduct.id, mainLocId, initial_stock]
        );
      }
    }

    await client.query('COMMIT');
    return newProduct;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update Product details
 */
export const updateProduct = async (id, { name, sku, category_id, uom, min_reorder_qty }) => {
  const result = await query(
    `UPDATE products
     SET name = COALESCE($1, name),
         sku = COALESCE($2, sku),
         category_id = $3,
         uom = COALESCE($4, uom),
         min_reorder_qty = COALESCE($5, min_reorder_qty)
     WHERE id = $6
     RETURNING id, name, sku, category_id, uom, min_reorder_qty, created_at`,
    [name, sku ? sku.toUpperCase() : null, category_id || null, uom, min_reorder_qty, id]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found.');
  }
  return result.rows[0];
};

/**
 * Delete Product
 */
export const deleteProduct = async (id) => {
  const moveCheck = await query('SELECT id FROM stock_move WHERE product_id = $1 LIMIT 1', [id]);
  if (moveCheck.rows.length > 0) {
    throw new Error('Cannot delete product because stock ledger movement history exists for it.');
  }

  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Product not found.');
  }
  return { message: 'Product deleted successfully.' };
};

/**
 * Product Categories Helpers
 */
export const getAllCategories = async () => {
  const result = await query('SELECT id, name FROM product_categories ORDER BY name ASC');
  return result.rows;
};

export const createCategory = async (name) => {
  const result = await query(
    'INSERT INTO product_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id, name',
    [name]
  );
  if (result.rows.length === 0) {
    throw new Error(`Category '${name}' already exists.`);
  }
  return result.rows[0];
};
