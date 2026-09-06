import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingCart, MessageCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { enquiryAPI } from '../services/api';

export default function Cart() {
  const { user } = useAuth();
  const { cart, cartCount, cartTotal, updateQuantity, removeItem } = useCart();

  if (!user) {
    return (
      <main className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
        <div className="empty-state">
          <ShoppingCart size={48} style={{ color: 'var(--text-light)' }} />
          <h3>Sign in to view your cart</h3>
          <p>Please sign in to add items and manage your cart.</p>
          <Link to="/login" className="btn btn-cta">Sign In</Link>
        </div>
      </main>
    );
  }

  if (cartCount === 0) {
    return (
      <main className="container cart-page">
        <div className="empty-state">
          <ShoppingCart size={48} style={{ color: 'var(--text-light)' }} />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/category/new" className="btn btn-cta">Browse Products</Link>
        </div>
      </main>
    );
  }

  const handleEnquireAll = async () => {
    const productNames = cart.items.map((item) =>
      `${item.product.name} (ID: ${item.product.productId}) x${item.quantity}`
    ).join(', ');

    const message = encodeURIComponent(`Hi, I'm interested in the following products:\n${productNames}`);
    window.open(`https://wa.me/918825918573?text=${message}`, '_blank');
  };

  return (
    <main className="container cart-page">
      <div style={{ marginBottom: 32 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Cart ({cartCount})</h1>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div>
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-image">
                <Link to={`/product/${item.product?.slug}`}>
                  <img src={item.product?.images?.[0]?.url || item.product?.images?.[0] || '/placeholder.svg'} alt={item.product?.name} />
                </Link>
              </div>
              <div className="cart-item-info">
                <Link to={`/product/${item.product?.slug}`} className="cart-item-name" style={{ color: 'var(--text)', textDecoration: 'none' }}>
                  {item.product?.name}
                </Link>
                <div className="cart-item-id">{item.product?.productId}</div>
                <div className="cart-item-price">₹{item.product?.price?.toLocaleString('en-IN')}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div className="cart-quantity">
                    <button onClick={() => item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => removeItem(item._id)}>
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Items ({cartCount})</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            <button className="btn btn-cta btn-full btn-lg" onClick={handleEnquireAll}>
              <MessageCircle size={20} /> Enquire All via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
