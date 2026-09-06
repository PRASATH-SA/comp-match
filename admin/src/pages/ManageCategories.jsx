import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, GripVertical } from 'lucide-react';
import { categoryAPI } from '../services/api';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', condition: 'new', type: 'laptop', order: 0, isActive: true,
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data.categories || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', description: '', condition: 'new', type: 'laptop', order: categories.length + 1, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormData({
      name: cat.name, description: cat.description || '', condition: cat.condition,
      type: cat.type, order: cat.order, isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await categoryAPI.update(editing._id, formData);
      else await categoryAPI.create(formData);
      setModalOpen(false);
      fetchCategories();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products must be moved first.')) return;
    try { await categoryAPI.delete(id); fetchCategories(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Categories</h1>
        <button className="btn btn-cta" onClick={openCreate}><Plus size={16} /> Add Category</button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Name</th><th>Slug</th><th>Condition</th><th>Type</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : (
              categories.sort((a, b) => a.order - b.order).map((cat) => (
                <tr key={cat._id}>
                  <td><GripVertical size={14} style={{ color: 'var(--text-light)' }} /> {cat.order}</td>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.slug}</td>
                  <td><span className={`badge badge-${cat.condition}`}>{cat.condition}</span></td>
                  <td style={{ textTransform: 'capitalize' }}>{cat.type}</td>
                  <td><span className={`badge ${cat.isActive ? 'badge-active' : 'badge-inactive'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" onClick={() => openEdit(cat)}><Edit size={16} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(cat._id)} style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'New Category'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" style={{ minHeight: 80 }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select className="form-input form-select" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })}>
                      <option value="new">New</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <option value="laptop">Laptop</option>
                      <option value="computer">Computer</option>
                      <option value="accessory">Accessory</option>
                      <option value="mac">Mac</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input type="number" className="form-input" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ paddingTop: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-cta" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spinning" /> : null}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
