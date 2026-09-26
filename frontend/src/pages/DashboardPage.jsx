import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Layers 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [recentOperations, setRecentOperations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, alertRes, opsRes, locRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/low-stock-alerts'),
        api.get('/dashboard/recent-activity'),
        api.get('/locations'),
      ]);

      setKpis(kpiRes.data.kpis);
      setLowStockAlerts(alertRes.data.alerts);
      setRecentOperations(opsRes.data.recent);
      setLocations(locRes.data.locations.filter((l) => l.type === 'internal'));
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter operations based on dynamic filters
  const filteredOperations = recentOperations.filter((op) => {
    if (filterType !== 'all' && op.type !== filterType) return false;
    if (filterStatus !== 'all' && op.status !== filterStatus) return false;
    if (filterLocation !== 'all' && String(op.source_location_id) !== filterLocation && String(op.dest_location_id) !== filterLocation) return false;
    return true;
  });

  return (
    <div className="main-wrapper">
      <Header title="Dashboard Overview" />

      <div className="page-content">
        {/* KPI Cards Grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>
              <Package size={24} />
            </div>
            <div>
              <div className="kpi-title">Total Products in Stock</div>
              <div className="kpi-value">{loading ? '...' : kpis?.totalProductsInStock || 0}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="kpi-title">Low / Out of Stock</div>
              <div className="kpi-value" style={{ color: kpis?.lowStockItemsCount > 0 ? '#ef4444' : '#0f172a' }}>
                {loading ? '...' : kpis?.lowStockItemsCount || 0}
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <ArrowDownLeft size={24} />
            </div>
            <div>
              <div className="kpi-title">Pending Receipts</div>
              <div className="kpi-value">{loading ? '...' : kpis?.pendingReceiptsCount || 0}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <ArrowUpRight size={24} />
            </div>
            <div>
              <div className="kpi-title">Pending Deliveries</div>
              <div className="kpi-value">{loading ? '...' : kpis?.pendingDeliveriesCount || 0}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <div className="kpi-title">Internal Transfers</div>
              <div className="kpi-value">{loading ? '...' : kpis?.scheduledTransfersCount || 0}</div>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStockAlerts.length > 0 && (
          <div className="card-container" style={{ borderColor: '#fca5a5', backgroundColor: '#fff5f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertTriangle color="#dc2626" size={20} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#991b1b' }}>
                Low Stock Alert Threshold Reached ({lowStockAlerts.length} Products Need Reordering)
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {lowStockAlerts.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '13px' }}>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.name}</span>
                  <span style={{ color: '#64748b', marginLeft: '6px' }}>({item.sku})</span>
                  <span style={{ marginLeft: '10px', fontWeight: '700', color: '#dc2626' }}>
                    Stock: {item.current_stock} {item.uom} (Min: {item.min_reorder_qty})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Filters Bar */}
        <div className="card-container" style={{ padding: '16px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                <Filter size={16} />
                <span>Filters:</span>
              </div>

              {/* Document Type Filter */}
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                <option value="all">All Document Types</option>
                <option value="receipt">Receipts (Incoming)</option>
                <option value="delivery">Delivery Orders (Outgoing)</option>
                <option value="internal">Internal Transfers</option>
                <option value="adjustment">Stock Adjustments</option>
              </select>

              {/* Status Filter */}
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="waiting">Waiting</option>
                <option value="ready">Ready</option>
                <option value="done">Done (Validated)</option>
                <option value="canceled">Canceled</option>
              </select>

              {/* Location Filter */}
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                <option value="all">All Warehouses / Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={String(loc.id)}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>

            <button onClick={() => navigate('/operations')} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Create Operation</span>
            </button>
          </div>
        </div>

        {/* Recent Operations Activity Table */}
        <div className="card-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Recent Stock Operations</h3>
            <button onClick={() => navigate('/operations')} className="btn btn-secondary btn-sm">View All Operations</button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Source $\rightarrow$ Destination</th>
                  <th>Line Items</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No stock operations match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredOperations.map((op) => (
                    <tr key={op.id}>
                      <td style={{ fontWeight: '600', color: '#6366f1' }}>{op.reference}</td>
                      <td style={{ textTransform: 'capitalize' }}>{op.type}</td>
                      <td style={{ fontSize: '13px' }}>
                        <span style={{ color: '#475569' }}>{op.source_location_name || 'Vendor'}</span>
                        <span style={{ margin: '0 6px', color: '#94a3b8' }}>$\rightarrow$</span>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{op.dest_location_name || 'Customer'}</span>
                      </td>
                      <td>{op.total_items} item(s)</td>
                      <td>
                        <span className={`badge badge-${op.status}`}>
                          {op.status === 'done' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {op.status}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {new Date(op.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
