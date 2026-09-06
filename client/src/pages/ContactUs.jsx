import { useState } from 'react';
import { MessageCircle, Clock, Send, HelpCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ContactUs() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    contactNo: '',
    subject: 'General Enquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactNo.trim()) return;

    const text = encodeURIComponent(
      `Hi Computer Match,\n\nName: ${formData.name}\nContact: ${formData.contactNo}\nSubject: ${formData.subject}\nMessage: ${formData.message || 'I have an enquiry regarding your products.'}`
    );

    // Direct WhatsApp enquiry redirect with hidden phone number
    window.open(`https://wa.me/918825918573?text=${text}`, '_blank');
    setSubmitted(true);
  };

  return (
    <main style={{ minHeight: 'calc(100vh - var(--header-height))', padding: '48px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }} data-aos="fade-up">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 12 }}>Contact Us</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.063rem', lineHeight: 1.6 }}>
            Have a question about a product, bulk order, or need guidance finding the right computer? 
            Our team is here to help.
          </p>
        </div>

        <div className="contact-layout">
          {/* Info Side */}
          <div data-aos="fade-right">
            <div className="contact-info-card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>How We Can Help</h2>

              <div className="contact-help-item">
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--cta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle size={22} style={{ color: 'var(--cta-hover)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>WhatsApp Direct Support</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Connect instantly with our product specialists for stock inquiries, custom configuration quotes, and delivery timelines.
                  </p>
                </div>
              </div>

              <div className="contact-help-item">
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={22} style={{ color: 'var(--secondary)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Operating Hours</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Monday to Saturday: 9:00 AM – 8:00 PM IST<br />
                    Enquiries submitted outside hours are answered the next morning.
                  </p>
                </div>
              </div>

              <div className="contact-help-item">
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={22} style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Verified Assistance</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    We assist in sourcing genuine hardware from vetted sellers, providing quality assurance checks for refurbished units.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                <HelpCircle size={18} style={{ color: 'var(--cta-hover)' }} />
                Looking for a specific model?
              </div>
              <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Use our product enquiry feature directly on any product page for instant quotes with the auto-generated Product ID.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div data-aos="fade-left">
            <div className="contact-form-card">
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: 8 }}>Send Us a Message</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Fill out the form below and we will connect with you immediately.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter your mobile or WhatsApp number"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Enquiry Topic</label>
                  <select
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Laptop Recommendation">Laptop Recommendation</option>
                    <option value="Refurbished Mac Inquiry">Refurbished Mac Inquiry</option>
                    <option value="Bulk Corporate Order">Bulk Corporate Order</option>
                    <option value="Order & Delivery Status">Order & Delivery Status</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message / Requirements</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Describe your requirements, budget, or preferred specifications..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-cta btn-full btn-lg" style={{ marginTop: 8 }}>
                  <Send size={18} /> Send Message via WhatsApp
                </button>
              </form>

              {submitted && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--success-light)', color: '#065F46', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', textAlign: 'center' }}>
                  Thank you! Redirecting you to WhatsApp to complete your message.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
