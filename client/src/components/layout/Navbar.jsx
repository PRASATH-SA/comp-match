import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import logoImg from '../../assets/Comp Match.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'New', path: '/category/new' },
    { label: 'Refurbished', path: '/category/refurbished' },
    { label: 'Mac PCs', path: '/category/refurbished-mac-pcs' },
  ];

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <img src={logoImg} alt="Computer Match Logo" className="logo-img" />
            <div className="logo-text-group">
              <span className="logo-text">Computer Match</span>
              <span className="logo-tagline">Power your dreams, Not your Expenses</span>
            </div>
          </Link>

          <nav className="nav-links">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <Link to="/cart" className="btn-icon cart-badge" aria-label="Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button className="btn-icon" onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile menu">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={22} />
                  )}
                </button>
                {profileOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: '100%', marginTop: 8,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', padding: 8, minWidth: 180,
                      boxShadow: 'var(--shadow-lg)', zIndex: 50,
                    }}
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                    <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.875rem' }}
                      onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-cta btn-sm">Sign In</Link>
            )}

            <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img src={logoImg} alt="Computer Match" className="logo-img" style={{ height: 32 }} />
            <span style={{ fontSize: '1.15rem' }}>Computer Match</span>
          </Link>
          <button className="btn-icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className="mobile-menu-links">
          {navLinks.map((item) => (
            <Link key={item.path} to={item.path} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link to="/cart" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          <Link to="/contact" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
            Contact Us
          </Link>
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
          {user ? (
            <>
              <div style={{ padding: '8px 16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</div>
              <button className="mobile-menu-link" onClick={() => { logout(); setMenuOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Create Account</Link>
            </>
          )}
        </nav>
      </div>
      {menuOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} onClick={() => setMenuOpen(false)} />}
    </>
  );
}
