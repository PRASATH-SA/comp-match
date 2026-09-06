import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, MessageCircle, ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { productAPI, activityAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EnquiryModal from '../components/enquiry/EnquiryModal';
import AdSlot from '../components/ads/AdSlot';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getBySlug(slug);
        setProduct(data.product);
        setSelectedImage(0);

        // Log activity
        if (user) {
          activityAPI.log({
            action: 'product_view',
            page: `/product/${slug}`,
            productId: data.product._id,
          }).catch(() => {});
        }

        // Fetch related products
        if (data.product.category) {
          const catId = data.product.category._id || data.product.category;
          const relRes = await productAPI.getAll({ category: catId, limit: 4 });
          setRelated(relRes.data.products.filter((p) => p._id !== data.product._id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  // Track watch time
  useEffect(() => {
    if (!product || !user) return;
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      if (duration > 2) {
        activityAPI.log({ action: 'product_view', page: `/product/${slug}`, productId: product._id, duration }).catch(() => {});
      }
    };
  }, [product, user, slug]);

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product._id);
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="product-detail">
          <div>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
          </div>
          <div>
            <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 32, width: '80%', marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: 32 }} />
            <div className="skeleton" style={{ height: 100, width: '100%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 52, width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Product Not Found</h3>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-cta">Back to Home</Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product.images?.length ? product.images : [{ url: '/placeholder.svg' }];

  return (
    <main>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} style={{ color: 'var(--text-muted)' }}>{product.category.name}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </div>

        <div className="product-detail">
          {/* Gallery */}
          <div className="product-gallery" data-aos="fade-right">
            <div className="product-main-image">
              <LazyLoadImage
                src={images[selectedImage]?.url || images[selectedImage]}
                alt={product.name}
                effect="blur"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-thumbnail ${i === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img.url || img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info" data-aos="fade-left">
            <div className="product-meta">
              <span className="badge badge-id">{product.productId}</span>
              <span className={`badge ${product.condition === 'new' ? 'badge-new' : 'badge-refurbished'}`}>
                {product.condition}
              </span>
              {product.stock > 0 ? (
                <span className="badge badge-stock">In Stock</span>
              ) : (
                <span className="badge badge-out">Out of Stock</span>
              )}
            </div>

            <h1>{product.name}</h1>
            {product.brand && (
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>by {product.brand}</p>
            )}

            <div className="product-price-section">
              <div className="product-price-row">
                <span className="product-price">₹{product.price?.toLocaleString('en-IN')}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="product-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="product-discount-badge">{discount}% OFF</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.813rem', color: 'var(--text-light)', marginTop: 4 }}>Inclusive of all taxes</p>
            </div>

            <p className="product-description">{product.description}</p>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="product-specs">
                <h3>Specifications</h3>
                <table className="spec-table">
                  <tbody>
                    {Object.entries(product.specifications instanceof Map ? Object.fromEntries(product.specifications) : product.specifications).map(
                      ([key, val]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{val}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Actions */}
            <div className="product-actions">
              <button className="btn btn-cta btn-lg" style={{ flex: 1 }} onClick={() => setEnquiryOpen(true)}>
                <MessageCircle size={20} /> Enquire Now
              </button>
              <button
                className="btn btn-secondary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
              >
                {cartAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
                {cartAdded ? 'Added' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {/* Sticky mobile actions */}
            <div className="product-actions-sticky">
              <button className="btn btn-cta btn-lg" style={{ flex: 1 }} onClick={() => setEnquiryOpen(true)}>
                <MessageCircle size={18} /> Enquire
              </button>
              <button
                className="btn btn-secondary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
              >
                {cartAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
                {cartAdded ? 'Added' : 'Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Ad slot — only renders if an ad is actively configured */}
        <AdSlot placement="product-bottom" style={{ margin: '40px 0' }} />

        {/* Related Products */}
        {related.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-header" data-aos="fade-up">
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="product-grid">
              {related.map((p, i) => (
                <div key={p._id} data-aos="fade-up" data-aos-delay={i * 80}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Enquiry Modal */}
      {enquiryOpen && <EnquiryModal product={product} onClose={() => setEnquiryOpen(false)} />}
    </main>
  );
}
