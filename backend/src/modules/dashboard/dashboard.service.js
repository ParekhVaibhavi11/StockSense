import { query } from '../../config/db.js';

/**
 * Fetch real-time Dashboard KPI Summary Metrics
 */
export const getDashboardKPIs = async () => {
  // 1. Total Products in Stock (Sum of on-hand quantity across internal locations)
  const totalStockRes = await query(`
    SELECT COALESCE(SUM(sq.quantity), 0) AS total_quantity
    FROM stock_quants sq
    JOIN locations l ON sq.location_id = l.id
    WHERE l.type = 'internal' AND sq.quantity > 0
  `);

  // 2. Low Stock / Out of Stock Items Count (Products where on-hand stock < min_reorder_qty)
  const lowStockRes = await query(`
    SELECT COUNT(*) AS count FROM (
      SELECT p.id, p.min_reorder_qty, COALESCE(SUM(sq.quantity), 0) AS current_stock
      FROM products p
      LEFT JOIN stock_quants sq ON p.id = sq.product_id
      LEFT JOIN locations l ON sq.location_id = l.id AND l.type = 'internal'
      GROUP BY p.id, p.min_reorder_qty
      HAVING COALESCE(SUM(sq.quantity), 0) <= p.min_reorder_qty
    ) AS low_stock_subquery
  `);

  // 3. Pending Receipts Count (status NOT IN ('done', 'canceled'))
  const pendingReceiptsRes = await query(`
    SELECT COUNT(*) AS count FROM stock_picking 
    WHERE type = 'receipt' AND status NOT IN ('done', 'canceled')
  `);

  // 4. Pending Deliveries Count (status NOT IN ('done', 'canceled'))
  const pendingDeliveriesRes = await query(`
    SELECT COUNT(*) AS count FROM stock_picking 
    WHERE type = 'delivery' AND status NOT IN ('done', 'canceled')
  `);

  // 5. Internal Transfers Scheduled Count (status NOT IN ('done', 'canceled'))
  const scheduledTransfersRes = await query(`
    SELECT COUNT(*) AS count FROM stock_picking 
    WHERE type = 'internal' AND status NOT IN ('done', 'canceled')
  `);

  return {
    totalProductsInStock: Number(totalStockRes.rows[0].total_quantity),
    lowStockItemsCount: Number(lowStockRes.rows[0].count),
    pendingReceiptsCount: Number(pendingReceiptsRes.rows[0].count),
    pendingDeliveriesCount: Number(pendingDeliveriesRes.rows[0].count),
    scheduledTransfersCount: Number(scheduledTransfersRes.rows[0].count),
  };
};

/**
 * Fetch detailed list of Low Stock items for Alert Banners
 */
export const getLowStockAlerts = async () => {
  const result = await query(`
    SELECT 
      p.id, 
      p.name, 
      p.sku, 
      p.uom, 
      p.min_reorder_qty, 
      c.name AS category_name,
      COALESCE(SUM(sq.quantity), 0) AS current_stock
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.id
    LEFT JOIN stock_quants sq ON p.id = sq.product_id
    LEFT JOIN locations l ON sq.location_id = l.id AND l.type = 'internal'
    GROUP BY p.id, c.name
    HAVING COALESCE(SUM(sq.quantity), 0) <= p.min_reorder_qty
    ORDER BY current_stock ASC
  `);

  return result.rows;
};

/**
 * Fetch recent inventory operations activity snapshot
 */
export const getRecentMovements = async (limit = 5) => {
  const result = await query(`
    SELECT 
      sp.id, 
      sp.reference, 
      sp.type, 
      sp.status, 
      sup.name AS supplier_name,
      sl.name AS source_location_name,
      dl.name AS dest_location_name,
      sp.created_at,
      sp.validated_at,
      COUNT(sm.id) AS total_items
    FROM stock_picking sp
    LEFT JOIN suppliers sup ON sp.supplier_id = sup.id
    LEFT JOIN locations sl ON sp.source_location_id = sl.id
    LEFT JOIN locations dl ON sp.dest_location_id = dl.id
    LEFT JOIN stock_move sm ON sp.id = sm.picking_id
    GROUP BY sp.id, sup.name, sl.name, dl.name
    ORDER BY sp.created_at DESC
    LIMIT $1
  `, [limit]);

  return result.rows;
};
