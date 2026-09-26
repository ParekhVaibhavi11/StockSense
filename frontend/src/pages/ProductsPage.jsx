import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Package, Search, Plus, Eye, AlertCircle, CheckCircle2, Layers, MapPin, X } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    uom: 'units',
    min_reorder_qty: 10,
    initial_stock: 0,
  });
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { search, category_id: selectedCategory || null },
      });
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, selectedCategory]);

  const handleViewBreakdown = async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      setSelectedProductDetails(res.data.product);
    } catch (err) {
      console.error('Failed to fetch product location breakdown:', err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/products', formData);
      setShowCreateModal(false);
      setFormData({ name: '', sku: '', category_id: '', uom: 'units', min_reorder_qty: 10, initial_stock: 0 });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header title="Products & Catalog" />

      <div className="page-content">
        {/* Actions & Filter Bar */}
        <div className="card-container" style={{ padding: '16px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by Product Name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ width: '200px' }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Product Catalog Table */}
        <div className="card-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU Code</th>
                  <th>Category</th>
                  <th>UOM</th>
                  <th>Min Reorder Threshold</th>
                  <th>Total Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>Loading products...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No products found. Click "Add New Product" to create your first item.
                    </td>
                  </tr>
                ) : (
                  products.map((item) => {
                    const isLowStock = Number(item.total_stock) <= item.min_reorder_qty;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.name}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontWeight: '600', color: '#6366f1' }}>
                            {item.sku}
                          </span>
                        </td>
                        <td>{item.category_name || 'Uncategorized'}</td>
                        <td style={{ textTransform: 'uppercase', fontSize: '12px' }}>{item.uom}</td>
                        <td>{item.min_reorder_qty} {item.uom}</td>
                        <td>
                          <span style={{ fontWeight: '700', color: isLowStock ? '#ef4444' : '#10b981' }}>
                            {item.total_stock} {item.uom}
                          </span>
                          {isLowStock && (
                            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                              LOW STOCK
                            </span>
                          )}
                        </td>
                        <td>
                          <button onClick={() => handleViewBreakdown(item.id)} className="btn btn-secondary btn-sm">
                            <Eye size={14} />
                            <span>Stock Breakdown</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Breakdown per Location Modal */}
        {selectedProductDetails && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{selectedProductDetails.name}</h3>
                  <span style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace' }}>SKU: {selectedProductDetails.sku}</span>
                </div>
                <button onClick={() => setSelectedProductDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Total On-Hand Stock:</span>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                      {selectedProductDetails.total_stock} {selectedProductDetails.uom}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Reorder Threshold:</span>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
                      {selectedProductDetails.min_reorder_qty} {selectedProductDetails.uom}
                    </div>
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>Availability Breakdown Per Location</h4>
                
                {selectedProductDetails.stock_breakdown.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>No stock balances recorded in internal warehouses for this item.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Warehouse / Location</th>
                          <th>Code</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductDetails.stock_breakdown.map((loc, idx) => (
                          <tr key={idx}>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                              <MapPin size={16} color="#6366f1" />
                              <span>{loc.location_name}</span>
                            </td>
                            <td><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{loc.location_code}</span></td>
                            <td style={{ fontWeight: '700', color: '#0f172a' }}>{loc.quantity} {selectedProductDetails.uom}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Product Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Add New Product</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <div className="modal-body">
                {error && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateProduct}>
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Steel Rods (10mm)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">SKU Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SKU-STEEL-01"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="form-select"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Unit of Measure (UOM) *</label>
                      <select
                        value={formData.uom}
                        onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                        className="form-select"
                      >
                        <option value="units">units</option>
                        <option value="kg">kg</option>
                        <option value="meters">meters</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Min Reorder Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.min_reorder_qty}
                        onChange={(e) => setFormData({ ...formData, min_reorder_qty: parseInt(e.target.value, 10) || 0 })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Initial Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.initial_stock}
                        onChange={(e) => setFormData({ ...formData, initial_stock: parseFloat(e.target.value) || 0 })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Product</button>
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

export default ProductsPage;
