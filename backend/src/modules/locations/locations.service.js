import { query } from '../../config/db.js';

/**
 * Fetch all locations with optional type filter
 */
export const getAllLocations = async (type = null) => {
  let sql = `
    SELECT l.id, l.name, l.code, l.type, l.parent_id, p.name AS parent_name, l.created_at
    FROM locations l
    LEFT JOIN locations p ON l.parent_id = p.id
  `;
  const params = [];

  if (type) {
    sql += ` WHERE l.type = $1`;
    params.push(type);
  }

  sql += ` ORDER BY l.type DESC, l.name ASC`;
  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get location by ID
 */
export const getLocationById = async (id) => {
  const result = await query(
    `SELECT l.id, l.name, l.code, l.type, l.parent_id, p.name AS parent_name, l.created_at
     FROM locations l
     LEFT JOIN locations p ON l.parent_id = p.id
     WHERE l.id = $1`,
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error('Location not found.');
  }
  return result.rows[0];
};

/**
 * Create new location / warehouse
 */
export const createLocation = async ({ name, code, type = 'internal', parent_id = null }) => {
  // Check code uniqueness
  const checkCode = await query('SELECT id FROM locations WHERE code = $1', [code]);
  if (checkCode.rows.length > 0) {
    throw new Error(`Location code '${code}' already exists.`);
  }

  const result = await query(
    `INSERT INTO locations (name, code, type, parent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, code, type, parent_id, created_at`,
    [name, code, type, parent_id || null]
  );
  return result.rows[0];
};

/**
 * Update location
 */
export const updateLocation = async (id, { name, code, type, parent_id }) => {
  const result = await query(
    `UPDATE locations
     SET name = COALESCE($1, name),
         code = COALESCE($2, code),
         type = COALESCE($3, type),
         parent_id = $4
     WHERE id = $5
     RETURNING id, name, code, type, parent_id, created_at`,
    [name, code, type, parent_id !== undefined ? parent_id : null, id]
  );
  if (result.rows.length === 0) {
    throw new Error('Location not found.');
  }
  return result.rows[0];
};

/**
 * Delete location
 */
export const deleteLocation = async (id) => {
  // Check if stock balance exists in this location
  const stockCheck = await query(
    'SELECT id FROM stock_quants WHERE location_id = $1 AND quantity > 0 LIMIT 1',
    [id]
  );
  if (stockCheck.rows.length > 0) {
    throw new Error('Cannot delete location because it currently holds active stock.');
  }

  const result = await query('DELETE FROM locations WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Location not found.');
  }
  return { message: 'Location deleted successfully.' };
};
