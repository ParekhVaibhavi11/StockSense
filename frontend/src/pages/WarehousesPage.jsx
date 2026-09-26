import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { MapPin, Plus, Trash2, X, AlertCircle, Building2 } from 'lucide-react';

const WarehousesPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'internal',
    parent_id: '',
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations');
      setLocations(res.data.locations);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/locations', formData);
      setShowCreateModal(false);
      setFormData({ name: '', code: '', type: 'internal', parent_id: '' });
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create location.');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    setError(null);
    try {
      await api.delete(`/locations/${id}`);
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete location.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header title="Warehouse & Location Management" />

      <div className="page-content">
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="card-container" style={{ padding: '16px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Locations Hierarchy</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Manage physical warehouses, production racks, and virtual transfer locations.</p>
            </div>

            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Location</span>
            </button>
          </div>
        </div>

        <div className="card-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Location Code</th>
                  <th>Type</th>
                  <th>Parent Location</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading locations...</td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No locations found.</td>
                  </tr>
                ) : (
                  locations.map((loc) => (
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
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(loc.created_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDeleteLocation(loc.id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Location Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Add New Location</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WH/RACK-B"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="form-select"
                    >
                      <option value="internal">Internal (Warehouse, Rack, Shelf)</option>
                      <option value="vendor">Vendor (External Origin)</option>
                      <option value="customer">Customer (External Destination)</option>
                      <option value="inventory_loss">Inventory Loss / Adjustment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parent Warehouse</label>
                    <select
                      value={formData.parent_id}
                      onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Root Level (No Parent)</option>
                      {locations.filter((l) => l.type === 'internal').map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
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

export default WarehousesPage;
