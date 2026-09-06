import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, MessageSquare, Users, Megaphone,
  FolderTree, Settings, LogOut, Monitor, Menu, X,
} from 'lucide-react';
import { authAPI } from './services/api';
import logoImg from './assets/Comp Match.png';

import Dashboard from './pages/Dashboard';
import ManageProducts from './pages/ManageProducts';
import ManageEnquiries from './pages/ManageEnquiries';
import ManageUsers from './pages/ManageUsers';
import ManageAds from './pages/ManageAds';
import ManageCategories from './pages/ManageCategories';

// ─── Login Page ──────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.user.role !== 'admin') {
        setError('Admin access required');
        return;
      }
      if (data.token) localStorage.setItem('admin_token', data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 16 }}>
      <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 40, maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={logoImg} alt="Computer Match" style={{ height: 48, width: 'auto', objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Computer Match</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: 16 }}>{error}</p>}
          <button type="submit" className="btn btn-cta btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Layout ────────────────────────────────────────
function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.user.role === 'admin') {
        setUser(data.user);
      }
    } catch {
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--cta)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={setUser} />;
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/enquiries', icon: MessageSquare, label: 'Enquiries' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/ads', icon: Megaphone, label: 'Ads & Referrals' },
    { path: '/categories', icon: FolderTree, label: 'Categories' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoImg} alt="Computer Match" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          <span>Computer Match</span>
        </div>
        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section">Main</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon /> {item.label}
            </NavLink>
          ))}
          <div className="admin-sidebar-section" style={{ marginTop: 16 }}>Account</div>
          <button className="admin-nav-link" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #374151', marginTop: 'auto' }}>
          <div style={{ fontSize: '0.813rem', fontWeight: 500, color: 'white' }}>{user.name}</div>
          <div style={{ fontSize: '0.688rem', color: '#6B7280' }}>{user.email}</div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 49 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}
            id="admin-hamburger">
            <Menu size={22} />
          </button>
          <h1>Admin Panel</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.name}</span>
            {user.avatar ? (
              <img src={user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--cta-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.813rem', color: 'var(--cta-hover)',
              }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ManageProducts />} />
            <Route path="/enquiries" element={<ManageEnquiries />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/ads" element={<ManageAds />} />
            <Route path="/categories" element={<ManageCategories />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          #admin-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminLayout />
    </BrowserRouter>
  );
}
