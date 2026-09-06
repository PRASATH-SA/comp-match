import { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { enquiryAPI } from '../services/api';

export default function ManageEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, page]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await enquiryAPI.getAll(params);
      setEnquiries(data.enquiries || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await enquiryAPI.updateStatus(id, status);
      fetchEnquiries();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const openWhatsApp = (enq) => {
    const msg = encodeURIComponent(`Hi ${enq.name}, regarding your enquiry for ${enq.product?.name} (${enq.product?.productId}).`);
    window.open(`https://wa.me/91${enq.contactNo}?text=${msg}`, '_blank');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Enquiries</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'pending', 'contacted', 'resolved'].map((s) => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-cta' : 'btn-outline'}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Product</th>
              <th>Requirement</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : enquiries.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No enquiries found</td></tr>
            ) : (
              enquiries.map((enq) => (
                <tr key={enq._id}>
                  <td style={{ fontWeight: 500 }}>{enq.name}</td>
                  <td>{enq.contactNo}</td>
                  <td>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{enq.product?.productId}</div>
                    <div style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{enq.product?.name}</div>
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {enq.requirement || <span style={{ color: 'var(--text-light)' }}>—</span>}
                  </td>
                  <td>
                    <select value={enq.status} onChange={(e) => updateStatus(enq._id, e.target.value)}
                      className="form-input form-select" style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.813rem' }}>{new Date(enq.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openWhatsApp(enq)} title="Open WhatsApp">
                      <MessageSquare size={14} /> Chat
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
