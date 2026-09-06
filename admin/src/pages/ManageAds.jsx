import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { adAPI, uploadAPI } from '../services/api';

export default function ManageAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', link: '', type: 'custom-banner', placement: 'home-hero',
    amazonAffiliateTag: '', adsenseSlotId: '', adSize: 'responsive',
    isActive: true, startDate: '', endDate: '',
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    try {
      const { data } = await adAPI.getAll();
      setAds(data.ads || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', link: '', type: 'custom-banner', placement: 'home-hero', amazonAffiliateTag: '', adsenseSlotId: '', adSize: 'responsive', isActive: true, startDate: '', endDate: '' });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (ad) => {
    setEditing(ad);
    setFormData({
      title: ad.title, link: ad.link || '', type: ad.type, placement: ad.placement,
      amazonAffiliateTag: ad.amazonAffiliateTag || '', adsenseSlotId: ad.adsenseSlotId || '',
      adSize: ad.adSize || 'responsive', isActive: ad.isActive,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : '', endDate: ad.endDate ? ad.endDate.slice(0, 10) : '',
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image = editing?.image || null;
      if (imageFile) {
        const fd = new FormData();
        fd.append('images', imageFile);
        fd.append('folder', 'ads');
        const { data: uploadRes } = await uploadAPI.upload(fd);
        image = uploadRes.images[0];
      }
      const payload = { ...formData, image };
      if (editing) await adAPI.update(editing._id, payload);
      else await adAPI.create(payload);
      setModalOpen(false);
      fetchAds();
    } catch (err) { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ad?')) return;
    try { await adAPI.delete(id); fetchAds(); }
    catch { alert('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Ads & Referrals</h1>
        <button className="btn btn-cta" onClick={openCreate}><Plus size={16} /> Add Ad</button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Type</th><th>Placement</th><th>Size</th><th>Impressions</th><th>Clicks</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No ads yet</td></tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad._id}>
                  <td style={{ fontWeight: 500 }}>{ad.title}</td>
                  <td><span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{ad.type}</span></td>
                  <td style={{ fontSize: '0.813rem' }}>{ad.placement}</td>
                  <td style={{ fontSize: '0.813rem' }}>{ad.adSize}</td>
                  <td>{ad.impressions?.toLocaleString()}</td>
                  <td>{ad.clicks?.toLocaleString()}</td>
                  <td><span className={`badge ${ad.isActive ? 'badge-active' : 'badge-inactive'}`}>{ad.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" onClick={() => openEdit(ad)}><Edit size={16} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(ad._id)} style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
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
              <h3>{editing ? 'Edit Ad' : 'New Ad'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-input form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <option value="custom-banner">Custom Banner</option>
                      <option value="amazon-referral">Amazon Referral</option>
                      <option value="google-adsense">Google AdSense</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Placement *</label>
                    <select className="form-input form-select" value={formData.placement} onChange={(e) => setFormData({ ...formData, placement: e.target.value })}>
                      <option value="home-hero">Home Hero</option>
                      <option value="home-mid">Home Mid</option>
                      <option value="category-top">Category Top</option>
                      <option value="product-sidebar">Product Sidebar</option>
                      <option value="product-bottom">Product Bottom</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Link URL</label>
                  <input className="form-input" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
                </div>
                {formData.type === 'google-adsense' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">AdSense Slot ID</label>
                      <input className="form-input" value={formData.adsenseSlotId} onChange={(e) => setFormData({ ...formData, adsenseSlotId: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ad Size</label>
                      <select className="form-input form-select" value={formData.adSize} onChange={(e) => setFormData({ ...formData, adSize: e.target.value })}>
                        <option value="responsive">Responsive</option>
                        <option value="300x250">300×250 (Medium Rectangle)</option>
                        <option value="728x90">728×90 (Leaderboard)</option>
                        <option value="320x50">320×50 (Mobile Banner)</option>
                      </select>
                    </div>
                  </div>
                )}
                {formData.type === 'amazon-referral' && (
                  <div className="form-group">
                    <label className="form-label">Amazon Affiliate Tag</label>
                    <input className="form-input" value={formData.amazonAffiliateTag} onChange={(e) => setFormData({ ...formData, amazonAffiliateTag: e.target.value })} placeholder="your-tag-20" />
                  </div>
                )}
                {formData.type === 'custom-banner' && (
                  <div className="form-group">
                    <label className="form-label">Banner Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active
                </label>
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
