import { useState } from 'react';
import { X, MessageCircle, Loader2 } from 'lucide-react';
import { enquiryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EnquiryModal({ product, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    contactNo: '',
    requirement: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.contactNo.trim()) return setError('Contact number is required');

    try {
      setLoading(true);
      const { data } = await enquiryAPI.submit({
        ...formData,
        productId: product._id,
      });

      // Redirect to WhatsApp
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={20} style={{ color: 'var(--cta-hover)' }} />
            Enquire Now
          </h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Product info */}
          <div style={{
            display: 'flex', gap: 12, padding: 12,
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            marginBottom: 20,
          }}>
            {product.images?.[0] && (
              <img
                src={product.images[0].url || product.images[0]}
                alt=""
                style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{product.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{product.productId}</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>₹{product.price?.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Your phone number"
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Requirement <span style={{ color: 'var(--text-light)' }}>(Optional)</span></label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe any specific requirements..."
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                rows={3}
              />
            </div>

            {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

            <button type="submit" className="btn btn-cta btn-full btn-lg" disabled={loading}>
              {loading ? <Loader2 size={20} className="spinning" /> : <MessageCircle size={20} />}
              {loading ? 'Submitting...' : 'Send Enquiry via WhatsApp'}
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 12, textAlign: 'center' }}>
            You'll be redirected to WhatsApp to complete your enquiry
          </p>
        </div>
      </div>
    </div>
  );
}
