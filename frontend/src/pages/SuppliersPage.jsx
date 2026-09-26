import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Users, Plus, Trash2, X, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.suppliers);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/suppliers', formData);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create supplier.');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    setError(null);
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete supplier.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header title="Supplier & Vendor Directory" />

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
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Approved Vendors</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Manage supplier records for incoming stock receipts.</p>
            </div>

            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Supplier</span>
            </button>
          </div>
        </div>

        <div className="card-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Physical Address</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading suppliers...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No suppliers found.</td>
                  </tr>
                ) : (
                  suppliers.map((sup) => (
                    <tr key={sup.id}>
                      <td style={{ fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#6366f1" />
                        <span>{sup.name}</span>
                      </td>
                      <td style={{ color: '#475569' }}>
                        {sup.email ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} color="#94a3b8" /> {sup.email}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td style={{ color: '#475569' }}>
                        {sup.phone ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} color="#94a3b8" /> {sup.phone}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td style={{ color: '#475569', fontSize: '13px' }}>{sup.address || 'N/A'}</td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(sup.created_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDeleteSupplier(sup.id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
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

        {/* Create Supplier Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Add New Supplier</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleCreateSupplier}>
                  <div className="form-group">
                    <label className="form-label">Vendor / Supplier Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Industrial Steel Corp"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        placeholder="orders@apexsteel.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1-555-0192"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Physical Address</label>
                    <textarea
                      rows={3}
                      placeholder="100 Steelworks Way, Ohio, USA"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Supplier</button>
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

export default SuppliersPage;
