import { useState, useEffect } from 'react';
import { Search, Eye, X, Clock, Monitor, MousePointer } from 'lucide-react';
import { userAPI } from '../services/api';

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

function timeAgo(date) {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll({ page, limit: 20, search: search || undefined });
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewUser = async (user) => {
    setDetailLoading(true);
    setSelectedUser(user);
    try {
      const { data } = await userAPI.getById(user._id);
      setSelectedUser(data.user);
      setActivities(data.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Users</h1>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input" style={{ paddingLeft: 32, width: 240 }}
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Provider</th>
              <th>Role</th>
              <th>Last Active</th>
              <th>Last Page</th>
              <th>Watch Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--cta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.813rem', color: 'var(--cta-hover)' }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: u.provider === 'google' ? '#DBEAFE' : '#F3F4F6', color: u.provider === 'google' ? '#1E40AF' : '#374151' }}>{u.provider}</span></td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.813rem' }}>{timeAgo(u.lastActive)}</td>
                  <td style={{ fontSize: '0.813rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.lastVisitedPage || '—'}</td>
                  <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{formatDuration(u.totalWatchTime)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => viewUser(u)}>
                      <Eye size={14} /> View
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="btn-icon" onClick={() => setSelectedUser(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* User Info */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--cta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: 'var(--cta-hover)' }}>
                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedUser.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedUser.email}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span className={`badge ${selectedUser.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{selectedUser.role}</span>
                    <span className="badge" style={{ background: '#F3F4F6', color: '#374151' }}>{selectedUser.provider}</span>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
                  <Clock size={18} style={{ color: 'var(--cta-hover)', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Active</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{timeAgo(selectedUser.lastActive)}</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
                  <Monitor size={18} style={{ color: 'var(--secondary)', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Watch Time</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatDuration(selectedUser.totalWatchTime)}</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
                  <MousePointer size={18} style={{ color: 'var(--success)', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Page</div>
                  <div style={{ fontWeight: 600, fontSize: '0.813rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedUser.lastVisitedPage || '/'}</div>
                </div>
              </div>

              {selectedUser.lastVisitedProduct && (
                <div style={{ background: 'var(--cta-light)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 24 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Last Visited Product</div>
                  <div style={{ fontWeight: 600 }}>{selectedUser.lastVisitedProduct.name}</div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{selectedUser.lastVisitedProduct.productId}</div>
                </div>
              )}

              {/* Activity Log */}
              <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Activity Log</h4>
              {detailLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading activities...</p>
              ) : activities.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No activity recorded yet.</p>
              ) : (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {activities.map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.625rem' }}>{act.action}</span>
                        <span style={{ fontSize: '0.813rem', marginLeft: 8 }}>
                          {act.product?.name ? `${act.product.name} (${act.product.productId})` : act.page}
                        </span>
                        {act.duration > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: 8 }}>{formatDuration(act.duration)}</span>}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
