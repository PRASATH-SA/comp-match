import { Link } from 'react-router';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function ProductCard({ product }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imageUrl = product.images?.[0]?.url || product.images?.[0] || '/placeholder.svg';

  return (
    <Link to={`/product/${product.slug}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <LazyLoadImage
          src={imageUrl}
          alt={product.name}
          effect="blur"
          className="card-image"
          wrapperProps={{
            style: { display: 'block', width: '100%', aspectRatio: '4/3', background: 'var(--bg-secondary)' },
          }}
        />
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6 }}>
          <span className={`badge ${product.condition === 'new' ? 'badge-new' : 'badge-refurbished'}`}>
            {product.condition}
          </span>
        </div>
        {product.featured && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'var(--cta)', color: 'var(--cta-text)',
            fontSize: '0.688rem', fontWeight: 700, padding: '3px 8px',
            borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
          }}>
            Featured
          </div>
        )}
      </div>

      <div className="card-body">
        <span className="badge badge-id" style={{ marginBottom: 8 }}>{product.productId}</span>
        <h3 className="card-title">{product.name}</h3>
        {product.brand && (
          <div style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: 8 }}>{product.brand}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
          <span className="card-price">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="card-price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              <span className="card-discount">{discount}% OFF</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
