import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Settings, Building2, MapPin, Layers, Plus, Save, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('warehouse'); // 'warehouse', 'locations', 'categories'
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [warehouseConfig, setWarehouseConfig] = useState({
    defaultWarehouse: 'WH/MAIN',
    defaultReceivingLoc: 'WH/MAIN',
    defaultDeliveryLoc: 'CUST/LOC',
    defaultLossLoc: 'LOSS/LOC',
  });

  const [newCatName, setNewCatName] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', code: '', type: 'internal', parent_id: '' });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locRes, catRes] = await Promise.all([
        api.get('/locations'),
        api.get('/products/categories'),
      ]);
      setLocations(locRes.data.locations);
      setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setMessage('Warehouse settings saved successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setError(null);
    try {
      await api.post('/products/categories', { name: newCatName });
      setNewCatName('');
      setMessage('Category added successfully!');
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add category.');
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/locations', newLocation);
      setShowLocationModal(false);
      setNewLocation({ name: '', code: '', type: 'internal', parent_id: '' });
      setMessage('Warehouse location created successfully!');
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create location.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header title="Warehouse Settings" />

      <div className="page-content">
        {/* Settings Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('warehouse')}
            className={`btn ${activeTab === 'warehouse' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Building2 size={16} />
            <span>Warehouse Defaults</span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`btn ${activeTab === 'locations' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <MapPin size={16} />
            <span>Warehouses & Racks ({locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={16} />
            <span>Product Categories ({categories.length})</span>
          </button>
        </div>

        {/* Success / Error Feedback Banners */}
        {message && (
          <div style={{ padding: '12px 16px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Warehouse Defaults Settings */}
        {activeTab === 'warehouse' && (
          <div className="card-container" style={{ maxWidth: '700px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Default Warehouse Operations Configuration
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Configure default warehouses and stock locations auto-selected during receipts and delivery orders.
            </p>

            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label className="form-label">Primary Internal Warehouse *</label>
                <select
                  value={warehouseConfig.defaultWarehouse}
                  onChange={(e) => setWarehouseConfig({ ...warehouseConfig, defaultWarehouse: e.target.value })}
                  className="form-select"
                >
                  {locations.filter((l) => l.type === 'internal').map((loc) => (
                    <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Default Receipts Destination</label>
                  <select
                    value={warehouseConfig.defaultReceivingLoc}
                    onChange={(e) => setWarehouseConfig({ ...warehouseConfig, defaultReceivingLoc: e.target.value })}
                    className="form-select"
                  >
                    {locations.filter((l) => l.type === 'internal').map((loc) => (
                      <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Delivery Dispatch Source</label>
                  <select
                    value={warehouseConfig.defaultDeliveryLoc}
                    onChange={(e) => setWarehouseConfig({ ...warehouseConfig, defaultDeliveryLoc: e.target.value })}
                    className="form-select"
                  >
                    {locations.filter((l) => l.type === 'internal').map((loc) => (
                      <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inventory Loss & Adjustment Location</label>
                <select
                  value={warehouseConfig.defaultLossLoc}
                  onChange={(e) => setWarehouseConfig({ ...warehouseConfig, defaultLossLoc: e.target.value })}
                  className="form-select"
                >
                  {locations.filter((l) => l.type === 'inventory_loss').map((loc) => (
                    <option key={loc.id} value={loc.code}>{loc.name} ({loc.code})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                <Save size={16} />
                <span>Save Warehouse Configuration</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Locations & Racks List */}
        {activeTab === 'locations' && (
          <div className="card-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Warehouses & Storage Racks</h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Manage physical and virtual locations across your business.</p>
              </div>
              <button onClick={() => setShowLocationModal(true)} className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Add Warehouse Location</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Location Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Parent Warehouse</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.id}>
                      <td style={{ fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color="#6366f1" />
                        <span>{loc.name}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontWeight: '600', color: '#6366f1' }}>
                          {loc.code}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span className={`badge ${loc.type === 'internal' ? 'badge-ready' : 'badge-draft'}`}>
                          {loc.type}
                        </span>
                      </td>
                      <td>{loc.parent_name || 'Root Warehouse'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Product Categories Settings */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
            <div className="card-container">
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                Add New Product Category
              </h3>
              <form onSubmit={handleCreateCategory}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raw Materials, Electronics"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} />
                  <span>Add Category</span>
                </button>
              </form>
            </div>

            <div className="card-container">
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                Active Categories ({categories.length})
              </h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>#{cat.id}</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{cat.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Creating Location */}
        {showLocationModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Add Warehouse Location</h3>
                <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleCreateLocation}>
                  <div className="form-group">
                    <label className="form-label">Location Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Storage Rack B"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WH/RACK-B"
                      value={newLocation.code}
                      onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location Type</label>
                    <select
                      value={newLocation.type}
                      onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                      className="form-select"
                    >
                      <option value="internal">Internal (Warehouse, Rack, Shelf)</option>
                      <option value="vendor">Vendor (External Origin)</option>
                      <option value="customer">Customer (External Destination)</option>
                      <option value="inventory_loss">Inventory Loss / Adjustment</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowLocationModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Location</button>
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

export default SettingsPage;
