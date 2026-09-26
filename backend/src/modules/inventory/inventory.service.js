import { query, getClient } from '../../config/db.js';
import { isValidStatusTransition } from '../../middleware/validators.js';

/**
 * Helper to generate sequential operation reference code (e.g. REC/00001, OUT/00001)
 */
const generateReference = async (client, type) => {
  const prefixMap = {
    receipt: 'REC',
    delivery: 'OUT',
    internal: 'INT',
    adjustment: 'ADJ',
  };

  const prefix = prefixMap[type] || 'MOV';

  const res = await client.query(
    `SELECT reference FROM stock_picking WHERE type = $1 ORDER BY id DESC LIMIT 1`,
    [type]
  );

  let nextNum = 1;
  if (res.rows.length > 0) {
    const lastRef = res.rows[0].reference;
    const parts = lastRef.split('/');
    if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
      nextNum = parseInt(parts[1], 10) + 1;
    }
  }

  const paddedNum = String(nextNum).padStart(5, '0');
  return `${prefix}/${paddedNum}`;
};

/**
 * Helper to get default location IDs by type if not provided
 */
const getDefaultLocation = async (client, codeDefault) => {
  const res = await client.query('SELECT id FROM locations WHERE code = $1 LIMIT 1', [codeDefault]);
  return res.rows.length > 0 ? res.rows[0].id : null;
};

/**
 * Create a new Inventory Operation (Header + Lines)
 */
export const createOperation = async ({
  type,
  supplier_id = null,
  source_location_id = null,
  dest_location_id = null,
  lines = [],
  notes = '',
  created_by = null,
}) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Validation: Receipts require a supplier
    if (type === 'receipt' && !supplier_id) {
      throw new Error('Supplier selection is mandatory for Receipts (Incoming Stock).');
    }

    // Resolve default locations if not provided
    let finalSourceLoc = source_location_id;
    let finalDestLoc = dest_location_id;

    if (type === 'receipt') {
      if (!finalSourceLoc) finalSourceLoc = await getDefaultLocation(client, 'VEND/LOC');
      if (!finalDestLoc) finalDestLoc = await getDefaultLocation(client, 'WH/MAIN');
    } else if (type === 'delivery') {
      if (!finalSourceLoc) finalSourceLoc = await getDefaultLocation(client, 'WH/MAIN');
      if (!finalDestLoc) finalDestLoc = await getDefaultLocation(client, 'CUST/LOC');
    } else if (type === 'adjustment') {
      if (!finalSourceLoc) finalSourceLoc = await getDefaultLocation(client, 'LOSS/LOC');
      if (!finalDestLoc) finalDestLoc = await getDefaultLocation(client, 'WH/MAIN');
    }

    const reference = await generateReference(client, type);

    // Insert Stock Picking Header
    const pickingRes = await client.query(
      `INSERT INTO stock_picking 
       (reference, type, supplier_id, source_location_id, dest_location_id, status, created_by, notes)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7)
       RETURNING id, reference, type, supplier_id, source_location_id, dest_location_id, status, notes, created_at`,
      [reference, type, supplier_id || null, finalSourceLoc, finalDestLoc, created_by || null, notes]
    );

    const picking = pickingRes.rows[0];

    // Insert Line Items
    const insertedLines = [];
    for (const line of lines) {
      const lineRes = await client.query(
        `INSERT INTO stock_move 
         (picking_id, product_id, source_location_id, dest_location_id, quantity, status)
         VALUES ($1, $2, $3, $4, $5, 'draft')
         RETURNING id, picking_id, product_id, source_location_id, dest_location_id, quantity, status`,
        [picking.id, line.product_id, finalSourceLoc, finalDestLoc, line.quantity]
      );
      insertedLines.push(lineRes.rows[0]);
    }

    await client.query('COMMIT');
    picking.lines = insertedLines;
    return picking;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update Operation Document Status (Draft -> Waiting -> Ready -> Canceled)
 */
export const updateOperationStatus = async (id, targetStatus) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const checkRes = await client.query('SELECT id, status FROM stock_picking WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      throw new Error('Stock operation not found.');
    }

    const currentStatus = checkRes.rows[0].status;

    if (currentStatus === 'done') {
      throw new Error('Validated operations are immutable and cannot change status.');
    }

    if (!isValidStatusTransition(currentStatus, targetStatus)) {
      throw new Error(`Invalid status transition from '${currentStatus}' to '${targetStatus}'.`);
    }

    // Update Header Status
    const updateHeaderRes = await client.query(
      'UPDATE stock_picking SET status = $1 WHERE id = $2 RETURNING id, reference, status',
      [targetStatus, id]
    );

    // Update Line Items Status
    await client.query('UPDATE stock_move SET status = $1 WHERE picking_id = $2', [targetStatus, id]);

    await client.query('COMMIT');
    return updateHeaderRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * VALIDATE OPERATION (ATOMIC STOCK TRANSACTION ENGINE)
 * Reduces source stock, increases destination stock, marks ledger lines as DONE.
 */
export const validateOperation = async (id, userId) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Fetch Picking details
    const pickingRes = await client.query(
      `SELECT id, reference, type, source_location_id, dest_location_id, status 
       FROM stock_picking WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (pickingRes.rows.length === 0) {
      throw new Error('Operation not found.');
    }

    const picking = pickingRes.rows[0];

    if (picking.status === 'done') {
      throw new Error('This stock operation has already been validated.');
    }

    if (picking.status === 'canceled') {
      throw new Error('Canceled operations cannot be validated.');
    }

    // Fetch line items
    const linesRes = await client.query(
      `SELECT sm.id, sm.product_id, sm.quantity, p.name AS product_name, p.sku
       FROM stock_move sm
       JOIN products p ON sm.product_id = p.id
       WHERE sm.picking_id = $1`,
      [id]
    );

    const lines = linesRes.rows;
    if (lines.length === 0) {
      throw new Error('Cannot validate operation with zero line items.');
    }

    // Process Stock Deductions & Additions per line item
    for (const line of lines) {
      const qty = Number(line.quantity);

      // Check stock sufficiency at Source Location (for Delivery & Internal Transfer)
      if (picking.type === 'delivery' || picking.type === 'internal') {
        const sourceQuantRes = await client.query(
          `SELECT quantity FROM stock_quants 
           WHERE product_id = $1 AND location_id = $2 FOR UPDATE`,
          [line.product_id, picking.source_location_id]
        );

        const availableQty = sourceQuantRes.rows.length > 0 ? Number(sourceQuantRes.rows[0].quantity) : 0;

        if (availableQty < qty) {
          throw new Error(
            `Insufficient stock for '${line.product_name}' (${line.sku}) at source location. Available: ${availableQty}, Required: ${qty}.`
          );
        }

        // Deduct stock from Source Location
        await client.query(
          `UPDATE stock_quants 
           SET quantity = quantity - $1 
           WHERE product_id = $2 AND location_id = $3`,
          [qty, line.product_id, picking.source_location_id]
        );
      }

      // Increase stock at Destination Location (for Receipt, Transfer, & Adjustment)
      if (picking.type === 'receipt' || picking.type === 'internal' || picking.type === 'adjustment') {
        await client.query(
          `INSERT INTO stock_quants (product_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, location_id) 
           DO UPDATE SET quantity = stock_quants.quantity + $3`,
          [line.product_id, picking.dest_location_id, qty]
        );
      }

      // Mark Line Item as DONE
      await client.query(
        `UPDATE stock_move SET status = 'done' WHERE id = $1`,
        [line.id]
      );
    }

    // Mark Picking Header as DONE with validated_at timestamp
    const now = new Date();
    const updatedPickingRes = await client.query(
      `UPDATE stock_picking 
       SET status = 'done', validated_at = $1 
       WHERE id = $2 
       RETURNING id, reference, type, status, validated_at`,
      [now, id]
    );

    await client.query('COMMIT');
    return updatedPickingRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Fetch Operations List with dynamic filtering
 */
export const getOperationsList = async ({ type = null, status = null, location_id = null }) => {
  let sql = `
    SELECT 
      sp.id, 
      sp.reference, 
      sp.type, 
      sp.status, 
      sp.supplier_id, 
      sup.name AS supplier_name,
      sp.source_location_id, 
      sl.name AS source_location_name,
      sp.dest_location_id, 
      dl.name AS dest_location_name,
      sp.notes, 
      u.name AS created_by_name,
      sp.created_at, 
      sp.validated_at,
      COUNT(sm.id) AS total_items
    FROM stock_picking sp
    LEFT JOIN suppliers sup ON sp.supplier_id = sup.id
    LEFT JOIN locations sl ON sp.source_location_id = sl.id
    LEFT JOIN locations dl ON sp.dest_location_id = dl.id
    LEFT JOIN users u ON sp.created_by = u.id
    LEFT JOIN stock_move sm ON sp.id = sm.picking_id
    WHERE 1=1
  `;

  const params = [];

  if (type) {
    params.push(type);
    sql += ` AND sp.type = $${params.length}`;
  }

  if (status) {
    params.push(status);
    sql += ` AND sp.status = $${params.length}`;
  }

  if (location_id) {
    params.push(location_id);
    sql += ` AND (sp.source_location_id = $${params.length} OR sp.dest_location_id = $${params.length})`;
  }

  sql += ` GROUP BY sp.id, sup.name, sl.name, dl.name, u.name ORDER BY sp.created_at DESC`;

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get Operation details by ID (Header + Line items)
 */
export const getOperationById = async (id) => {
  const headerRes = await query(
    `SELECT 
      sp.id, sp.reference, sp.type, sp.status, sp.supplier_id, sup.name AS supplier_name,
      sp.source_location_id, sl.name AS source_location_name, sl.code AS source_location_code,
      sp.dest_location_id, dl.name AS dest_location_name, dl.code AS dest_location_code,
      sp.notes, u.name AS created_by_name, sp.created_at, sp.validated_at
     FROM stock_picking sp
     LEFT JOIN suppliers sup ON sp.supplier_id = sup.id
     LEFT JOIN locations sl ON sp.source_location_id = sl.id
     LEFT JOIN locations dl ON sp.dest_location_id = dl.id
     LEFT JOIN users u ON sp.created_by = u.id
     WHERE sp.id = $1`,
    [id]
  );

  if (headerRes.rows.length === 0) {
    throw new Error('Stock operation not found.');
  }

  const picking = headerRes.rows[0];

  const linesRes = await query(
    `SELECT 
      sm.id, sm.product_id, p.name AS product_name, p.sku, p.uom,
      sm.quantity, sm.status
     FROM stock_move sm
     JOIN products p ON sm.product_id = p.id
     WHERE sm.picking_id = $1`,
    [id]
  );

  picking.lines = linesRes.rows;
  return picking;
};

/**
 * Fetch Immutable Move History Ledger Audit Trail
 */
export const getStockLedger = async ({ search = '', type = null, location_id = null }) => {
  let sql = `
    SELECT 
      sm.id,
      sp.reference,
      sp.type AS document_type,
      sm.product_id,
      p.name AS product_name,
      p.sku,
      p.uom,
      sm.source_location_id,
      sl.name AS source_location_name,
      sm.dest_location_id,
      dl.name AS dest_location_name,
      sm.quantity,
      sm.status,
      sm.created_at
    FROM stock_move sm
    JOIN stock_picking sp ON sm.picking_id = sp.id
    JOIN products p ON sm.product_id = p.id
    LEFT JOIN locations sl ON sm.source_location_id = sl.id
    LEFT JOIN locations dl ON sm.dest_location_id = dl.id
    WHERE 1=1
  `;

  const params = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR sp.reference ILIKE $${params.length})`;
  }

  if (type) {
    params.push(type);
    sql += ` AND sp.type = $${params.length}`;
  }

  if (location_id) {
    params.push(location_id);
    sql += ` AND (sm.source_location_id = $${params.length} OR sm.dest_location_id = $${params.length})`;
  }

  sql += ` ORDER BY sm.created_at DESC`;

  const result = await query(sql, params);
  return result.rows;
};
