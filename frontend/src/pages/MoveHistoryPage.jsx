import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { History, Search, Filter, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const MoveHistoryPage = () => {
  const [ledger, setLedger] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/ledger', {
        params: { search, type: filterType === 'all' ? null : filterType },
      });
      setLedger(res.data.ledger);
    } catch (err) {
      console.error('Failed to fetch move history ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [search, filterType]);

  return (
    <div className="main-wrapper">
      <Header title="Stock Move History Ledger" />

      <div className="page-content">
        {/* Search & Filter Header */}
        <div className="card-container" style={{ padding: '16px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by Reference (REC/00001), SKU, or Product Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-select"
                style={{ width: '200px' }}
              >
                <option value="all">All Movement Types</option>
                <option value="receipt">Receipts (Incoming)</option>
                <option value="delivery">Deliveries (Outgoing)</option>
                <option value="internal">Internal Transfers</option>
                <option value="adjustment">Adjustments</option>
              </select>
            </div>
          </div>
        </div>

        {/* Move Ledger Audit Table */}
        <div className="card-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Reference</th>
                  <th>Movement Type</th>
                  <th>Product</th>
                  <th>SKU Code</th>
                  <th>Source → Destination Location</th>
                  <th>Quantity Moved</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>Loading stock ledger audit logs...</td>
                  </tr>
                ) : ledger.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No move history records match the current search filters.
                    </td>
                  </tr>
                ) : (
                  ledger.map((move) => (
                    <tr key={move.id}>
                      <td style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(move.created_at).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: '600', color: '#6366f1' }}>{move.reference}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '12px', fontWeight: '500' }}>
                          {move.document_type}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{move.product_name}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{move.sku}</span></td>
                      <td style={{ fontSize: '13px' }}>
                        <span style={{ color: '#475569' }}>{move.source_location_name || 'Vendor Loc'}</span>
                        <span style={{ margin: '0 6px', color: '#94a3b8' }}>→</span>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{move.dest_location_name || 'Customer Loc'}</span>
                      </td>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>
                        {move.quantity} {move.uom}
                      </td>
                      <td>
                        <span className={`badge badge-${move.status}`}>
                          {move.status === 'done' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {move.status}
                        </span>
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

export default MoveHistoryPage;
