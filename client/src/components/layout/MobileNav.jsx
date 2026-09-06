import { NavLink } from 'react-router';
import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-inner">
        <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={22} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/category/new" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Grid3X3 size={22} />
          <span>Categories</span>
        </NavLink>

        <NavLink to="/cart" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 8,
              width: 18, height: 18, background: 'var(--cta)',
              color: 'var(--cta-text)', fontSize: '0.625rem',
              fontWeight: 700, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cartCount}
            </span>
          )}
          <span>Cart</span>
        </NavLink>

        <NavLink to={user ? '/cart' : '/login'} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </NavLink>
      </div>
    </div>
  );
}
