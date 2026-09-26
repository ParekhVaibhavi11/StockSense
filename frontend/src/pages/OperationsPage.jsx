import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  SlidersHorizontal, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X, 
  Check, 
  AlertCircle,
  Truck,
  Building2,
  Trash2
} from 'lucide-react';

const OperationsPage = () => {
  const [activeTab, setActiveTab] = useState('receipt');
  const [operations, setOperations] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Inspection
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Create Operation Form State
  const [formData, setFormData] = useState({
    type: 'receipt',
    supplier_id: '',
    source_location_id: '',
    dest_location_id: '',
    notes: '',
    lines: [{ product_id: '', quantity: 1 }],
  });

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/operations', { params: { type: activeTab } });
      setOperations(res.data.operations);
    } catch (err) {
      console.error('Failed to fetch operations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [prodRes, locRes, supRes] = await Promise.all([
        api.get('/products'),
        api.get('/locations'),
        api.get('/suppliers'),
      ]);
      setProducts(prodRes.data.products);
      setLocations(locRes.data.locations);
      setSuppliers(supRes.data.suppliers);
    } catch (err) {
      console.error('Failed to fetch master data:', err);
    }
  };

  useEffect(() => {
    fetchOperations();
    fetchMasterData();
  }, [activeTab]);

  const handleInspectOperation = async (id) => {
    try {
      const res = await api.get(`/inventory/operations/${id}`);
      setSelectedOperation(res.data.operation);
    } catch (err) {
      console.error('Failed to inspect operation:', err);
    }
  };

  const handleValidateOperation = async (id) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.post(`/inventory/operations/${id}/validate`);
      setActionSuccess(res.data.message);
      fetchOperations();
      if (selectedOperation) {
        handleInspectOperation(id);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || 'Validation failed.');
    }
  };

  const handleUpdateStatus = async (id, targetStatus) => {
    setActionError(null);
    try {
      await api.put(`/inventory/operations/${id}/status`, { status: targetStatus });
      fetchOperations();
      if (selectedOperation) {
        handleInspectOperation(id);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || 'Status update failed.');
    }
  };

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product_id: '', quantity: 1 }],
    });
  };

  const handleRemoveLine = (index) => {
    const updated = [...formData.lines];
    updated.splice(index, 1);
    setFormData({ ...formData, lines: updated });
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...formData.lines];
    updated[index][field] = value;
    setFormData({ ...formData, lines: updated });
  };

  const handleCreateOperation = async (e) => {
    e.preventDefault();
    setActionError(null);

    // Form Validation
    if (activeTab === 'receipt' && !formData.supplier_id) {
      setActionError('Supplier selection is mandatory for Incoming Receipts.');
      return;
    }

    try {
      const payload = {
        ...formData,
        type: activeTab,
        supplier_id: formData.supplier_id || null,
        source_location_id: formData.source_location_id || null,
        dest_location_id: formData.dest_location_id || null,
      };

      await api.post('/inventory/operations', payload);
      setShowCreateModal(false);
      setFormData({
        type: activeTab,
        supplier_id: '',
        source_location_id: '',
        dest_location_id: '',
        notes: '',
        lines: [{ product_id: '', quantity: 1 }],
      });
      fetchOperations();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to create operation.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header title="Stock Operations" />

      <div className="page-content">
        {/* Operations Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            onClick={() => { setActiveTab('receipt'); setActionError(null); setActionSuccess(null); }}
            className={`btn ${activeTab === 'receipt' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ArrowDownLeft size={16} />
            <span>1. Receipts (Incoming)</span>
          </button>

          <button
            onClick={() => { setActiveTab('delivery'); setActionError(null); setActionSuccess(null); }}
            className={`btn ${activeTab === 'delivery' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ArrowUpRight size={16} />
            <span>2. Delivery Orders (Outgoing)</span>
          </button>

          <button
            onClick={() => { setActiveTab('internal'); setActionError(null); setActionSuccess(null); }}
            className={`btn ${activeTab === 'internal' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <RefreshCw size={16} />
            <span>3. Internal Transfers</span>
          </button>

          <button
            onClick={() => { setActiveTab('adjustment'); setActionError(null); setActionSuccess(null); }}
            className={`btn ${activeTab === 'adjustment' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <SlidersHorizontal size={16} />
            <span>4. Stock Adjustments</span>
          </button>
        </div>

        {/* Banner Feedback Messages */}
        {actionError && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div style={{ padding: '12px 16px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter & Action Header */}
        <div className="card-container" style={{ padding: '16px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                {activeTab} Operations Ledger
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                {activeTab === 'receipt' && 'Record goods arriving from vendors. Validation increases inventory stock.'}
                {activeTab === 'delivery' && 'Manage customer shipments. Picking, packing & validation decreases stock.'}
                {activeTab === 'internal' && 'Transfer items between internal warehouses & racks (Main Store → Production Floor).'}
                {activeTab === 'adjustment' && 'Fix mismatches between physical stock counts and system records.'}
              </p>
            </div>

            <button onClick={() => { setFormData({ ...formData, type: activeTab }); setShowCreateModal(true); }} className="btn btn-primary">
              <Plus size={16} />
              <span>Create {activeTab.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Operations Data Table */}
        <div className="card-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  {activeTab === 'receipt' && <th>Supplier</th>}
                  <th>Source Location</th>
                  <th>Destination Location</th>
                  <th>Total Line Items</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>Loading operations...</td>
                  </tr>
                ) : operations.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No {activeTab} operations recorded. Click "Create {activeTab.toUpperCase()}" to start.
                    </td>
                  </tr>
                ) : (
                  operations.map((op) => (
                    <tr key={op.id}>
                      <td style={{ fontWeight: '600', color: '#6366f1' }}>{op.reference}</td>
                      {activeTab === 'receipt' && <td style={{ fontWeight: '500' }}>{op.supplier_name || 'N/A'}</td>}
                      <td style={{ color: '#475569' }}>{op.source_location_name || 'Vendor Location'}</td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{op.dest_location_name || 'Customer Location'}</td>
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
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleInspectOperation(op.id)} className="btn btn-secondary btn-sm">
                            Inspect
                          </button>

                          {op.status !== 'done' && op.status !== 'canceled' && (
                            <button onClick={() => handleValidateOperation(op.id)} className="btn btn-primary btn-sm">
                              <Check size={14} />
                              <span>Validate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operation Inspector & Validation Modal */}
        {selectedOperation && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '650px' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    Operation Document: {selectedOperation.reference}
                  </h3>
                  <span className={`badge badge-${selectedOperation.status}`} style={{ marginTop: '4px' }}>
                    Status: {selectedOperation.status}
                  </span>
                </div>
                <button onClick={() => setSelectedOperation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <div className="modal-body">
                {/* Header Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                  {selectedOperation.type === 'receipt' && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Supplier:</span>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{selectedOperation.supplier_name || 'N/A'}</div>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Source Location:</span>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{selectedOperation.source_location_name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Destination Location:</span>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{selectedOperation.dest_location_name}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Item Quantities</h4>
                <div className="table-responsive" style={{ marginBottom: '20px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOperation.lines.map((line) => (
                        <tr key={line.id}>
                          <td style={{ fontWeight: '600' }}>{line.product_name}</td>
                          <td><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{line.sku}</span></td>
                          <td style={{ fontWeight: '700' }}>{line.quantity} {line.uom}</td>
                          <td><span className={`badge badge-${line.status}`}>{line.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Status Lifecycle Controls & Validate Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  {selectedOperation.status !== 'done' && selectedOperation.status !== 'canceled' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {selectedOperation.status === 'draft' && (
                        <button onClick={() => handleUpdateStatus(selectedOperation.id, 'waiting')} className="btn btn-secondary btn-sm">
                          Mark as Waiting
                        </button>
                      )}
                      {selectedOperation.status === 'waiting' && (
                        <button onClick={() => handleUpdateStatus(selectedOperation.id, 'ready')} className="btn btn-secondary btn-sm">
                          Mark as Ready (Pick/Pack)
                        </button>
                      )}
                      <button onClick={() => handleUpdateStatus(selectedOperation.id, 'canceled')} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                        Cancel Order
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Order validation complete. Stock ledger updated.</span>
                  )}

                  {selectedOperation.status !== 'done' && selectedOperation.status !== 'canceled' && (
                    <button onClick={() => handleValidateOperation(selectedOperation.id)} className="btn btn-primary">
                      <Check size={16} />
                      <span>Validate & Update Stock</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Operation Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                  Create New {activeTab} Operation
                </h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleCreateOperation}>
                  {/* Supplier Field (Mandatory for Receipts) */}
                  {activeTab === 'receipt' && (
                    <div className="form-group">
                      <label className="form-label">Supplier / Vendor *</label>
                      <select
                        required
                        value={formData.supplier_id}
                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                        className="form-select"
                      >
                        <option value="">Select Vendor</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Locations Selection */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Source Location</label>
                      <select
                        value={formData.source_location_id}
                        onChange={(e) => setFormData({ ...formData, source_location_id: e.target.value })}
                        className="form-select"
                      >
                        <option value="">Default ({activeTab === 'receipt' ? 'Vendor Loc' : 'Main Warehouse'})</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Destination Location</label>
                      <select
                        value={formData.dest_location_id}
                        onChange={(e) => setFormData({ ...formData, dest_location_id: e.target.value })}
                        className="form-select"
                      >
                        <option value="">Default ({activeTab === 'delivery' ? 'Customer Loc' : 'Main Warehouse'})</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Line Items *</label>
                      <button type="button" onClick={handleAddLine} className="btn btn-secondary btn-sm">
                        <Plus size={14} /> Add Line Item
                      </button>
                    </div>

                    {formData.lines.map((line, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                        <select
                          required
                          value={line.product_id}
                          onChange={(e) => handleLineChange(idx, 'product_id', e.target.value)}
                          className="form-select"
                          style={{ flex: 2 }}
                        >
                          <option value="">Select Item</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          required
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                          className="form-input"
                          style={{ flex: 1 }}
                          placeholder="Qty"
                        />

                        {formData.lines.length > 1 && (
                          <button type="button" onClick={() => handleRemoveLine(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Operation</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsPage;
