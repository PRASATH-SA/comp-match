import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, ImagePlus } from 'lucide-react';
import { productAPI, categoryAPI, uploadAPI } from '../services/api';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '', condition: 'new', type: 'laptop', brand: '',
    stock: '', featured: false, isActive: true, specifications: {},
  });
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productAPI.getAll({ limit: 100 }),
        categoryAPI.getAll(),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({
      name: '', description: '', price: '', originalPrice: '',
      category: categories[0]?._id || '', condition: 'new', type: 'laptop',
      brand: '', stock: '', featured: false, isActive: true, specifications: {},
    });
    setImageFiles([]);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category?._id || product.category,
      condition: product.condition,
      type: product.type,
      brand: product.brand || '',
      stock: product.stock,
      featured: product.featured,
      isActive: product.isActive,
      specifications: product.specifications instanceof Map
        ? Object.fromEntries(product.specifications)
        : (product.specifications || {}),
    });
    setImageFiles([]);
    setModalOpen(true);
  };

  const addSpec = () => {
    if (specKey.trim() && specVal.trim()) {
      setFormData({ ...formData, specifications: { ...formData.specifications, [specKey]: specVal } });
      setSpecKey('');
      setSpecVal('');
    }
  };

  const removeSpec = (key) => {
    const specs = { ...formData.specifications };
    delete specs[key];
    setFormData({ ...formData, specifications: specs });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let images = editing?.images || [];

      // Upload new images
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append('images', f));
        fd.append('folder', 'products');
        const { data: uploadRes } = await uploadAPI.upload(fd);
        images = [...images, ...uploadRes.images];
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock) || 0,
        images,
      };

      if (editing) {
        await productAPI.update(editing._id, payload);
      } else {
        await productAPI.create(payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await productAPI.delete(id);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Products</h1>
        <button className="btn btn-cta" onClick={openCreate}><Plus size={16} /> Add Product</button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Condition</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No products yet. Click "Add Product" to create one.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.productId}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.images?.[0] && (
                        <img src={p.images[0].url || p.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        {p.brand && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name || '—'}</td>
                  <td><span className={`badge badge-${p.condition}`}>{p.condition}</span></td>
                  <td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString('en-IN')}</td>
                  <td>{p.stock}</td>
                  <td><span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" onClick={() => openEdit(p)} title="Edit"><Edit size={16} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(p._id)} title="Deactivate" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition *</label>
                    <select className="form-input form-select" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })}>
                      <option value="new">New</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-input form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <option value="laptop">Laptop</option>
                      <option value="computer">Computer</option>
                      <option value="accessory">Accessory</option>
                      <option value="mac">Mac</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="form-input" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" className="form-input" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (₹)</label>
                    <input type="number" className="form-input" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-input" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} min="0" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                      Featured
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                      Active
                    </label>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Description *</label>
                    <textarea className="form-input" style={{ minHeight: 100, resize: 'vertical' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Images</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {editing?.images?.map((img, i) => (
                        <img key={i} src={img.url || img} alt="" style={{ width: 60, height: 60, borderRadius: 4, objectFit: 'cover' }} />
                      ))}
                      <label style={{ width: 60, height: 60, border: '2px dashed var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ImagePlus size={20} style={{ color: 'var(--text-muted)' }} />
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFiles([...imageFiles, ...Array.from(e.target.files)])} />
                      </label>
                      {imageFiles.map((f, i) => <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.name}</span>)}
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Specifications</label>
                    {Object.entries(formData.specifications).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.813rem', flex: 1 }}><strong>{k}:</strong> {v}</span>
                        <button type="button" className="btn-icon" onClick={() => removeSpec(k)} style={{ color: 'var(--error)' }}><X size={14} /></button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="form-input" placeholder="Key" value={specKey} onChange={(e) => setSpecKey(e.target.value)} style={{ flex: 1 }} />
                      <input className="form-input" placeholder="Value" value={specVal} onChange={(e) => setSpecVal(e.target.value)} style={{ flex: 1 }} />
                      <button type="button" className="btn btn-outline btn-sm" onClick={addSpec}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-cta" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spinning" /> : null}
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
