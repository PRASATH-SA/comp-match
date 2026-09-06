import { useState, useEffect } from 'react';
import { Package, MessageSquare, Users, TrendingUp, Clock, Eye } from 'lucide-react';
import { productAPI, enquiryAPI, userAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, enquiries: 0, users: 0, pendingEnquiries: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, enqRes, usersRes] = await Promise.all([
          productAPI.getAll({ limit: 1 }),
          enquiryAPI.getAll({ limit: 5 }),
          userAPI.getAll({ limit: 1 }),
        ]);

        setStats({
          products: prodRes.data.pagination?.total || 0,
          enquiries: enqRes.data.pagination?.total || 0,
          users: usersRes.data.pagination?.total || 0,
          pendingEnquiries: enqRes.data.enquiries?.filter((e) => e.status === 'pending').length || 0,
        });
        setRecentEnquiries(enqRes.data.enquiries || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: '#FBBF24', bg: '#FEF3C7' },
    { label: 'Total Enquiries', value: stats.enquiries, icon: MessageSquare, color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Total Users', value: stats.users, icon: Users, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Pending Enquiries', value: stats.pendingEnquiries, icon: Clock, color: '#EF4444', bg: '#FEE2E2' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon" style={{ background: card.bg }}>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{loading ? '—' : card.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Enquiries */}
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>Recent Enquiries</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Product</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentEnquiries.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No enquiries yet</td></tr>
            ) : (
              recentEnquiries.map((enq) => (
                <tr key={enq._id}>
                  <td style={{ fontWeight: 500 }}>{enq.name}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {enq.product?.productId}
                    </span>
                    <br />{enq.product?.name}
                  </td>
                  <td>{enq.contactNo}</td>
                  <td><span className={`badge badge-${enq.status}`}>{enq.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(enq.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
