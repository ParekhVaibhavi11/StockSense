import { query } from '../../config/db.js';

/**
 * Fetch all suppliers
 */
export const getAllSuppliers = async () => {
  const result = await query(
    'SELECT id, name, email, phone, address, created_at FROM suppliers ORDER BY name ASC'
  );
  return result.rows;
};

/**
 * Get supplier by ID
 */
export const getSupplierById = async (id) => {
  const result = await query(
    'SELECT id, name, email, phone, address, created_at FROM suppliers WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error('Supplier not found.');
  }
  return result.rows[0];
};

/**
 * Create new supplier
 */
export const createSupplier = async ({ name, email, phone, address }) => {
  const result = await query(
    `INSERT INTO suppliers (name, email, phone, address)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, address, created_at`,
    [name, email || null, phone || null, address || null]
  );
  return result.rows[0];
};

/**
 * Update existing supplier
 */
export const updateSupplier = async (id, { name, email, phone, address }) => {
  const result = await query(
    `UPDATE suppliers
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         address = COALESCE($4, address)
     WHERE id = $5
     RETURNING id, name, email, phone, address, created_at`,
    [name, email, phone, address, id]
  );
  if (result.rows.length === 0) {
    throw new Error('Supplier not found.');
  }
  return result.rows[0];
};

/**
 * Delete supplier by ID
 */
export const deleteSupplier = async (id) => {
  // Check if supplier is linked to existing stock receipts
  const checkRes = await query(
    'SELECT id FROM stock_picking WHERE supplier_id = $1 LIMIT 1',
    [id]
  );
  if (checkRes.rows.length > 0) {
    throw new Error('Cannot delete supplier because existing inventory receipts reference it.');
  }

  const result = await query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Supplier not found.');
  }
  return { message: 'Supplier deleted successfully.' };
};
