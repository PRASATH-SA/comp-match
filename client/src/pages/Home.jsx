import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Laptop, Monitor, Mouse, Apple, ShieldCheck, CheckCircle2, Zap, BadgePercent } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import AdSlot from '../components/ads/AdSlot';
import HeroCarousel from '../components/home/HeroCarousel';
import SplashScreen from '../components/home/SplashScreen';

const categoryIcons = {
  laptop: Laptop,
  computer: Monitor,
  accessory: Mouse,
  mac: Apple,
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Show splash only once per browser session
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('cm_splash_shown');
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('cm_splash_shown', '1');
    setShowSplash(false);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getAll({ limit: 12, sort: '-createdAt' }),
          categoryAPI.getAll(),
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <main>
      {/* Splash intro — plays once per session */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Auto-scrolling Hero Carousel with Image Showcase */}
      <HeroCarousel />

      {/* Categories Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <div>
              <h2 className="section-title">Browse Categories</h2>
              <p className="section-subtitle">Find exactly what you're looking for</p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((cat, index) => {
              const Icon = categoryIcons[cat.type] || Monitor;
              const bgColors = [
                'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
                'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                'linear-gradient(135deg, #E0E7FF, #C7D2FE)',
                'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
                'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
              ];
              return (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="category-card-link"
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <div
                    className="category-card"
                    style={{ background: bgColors[index % bgColors.length] }}
                  >
                    <div className="category-card-icon-wrap">
                      <Icon size={28} className="category-card-icon" />
                    </div>
                    <div className="category-card-content">
                      <h3 className="category-card-title">{cat.name}</h3>
                      <p className="category-card-desc">{cat.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section with View All button at the top */}
      <section className="section">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <div>
              <h2 className="section-title">Our Products</h2>
              <p className="section-subtitle">Discover the latest new and refurbished deals</p>
            </div>
            <Link to="/category/new" className="btn btn-cta btn-sm">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3' }} />
                  <div style={{ padding: 20 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 20, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '48px 24px' }}>
              <Monitor size={48} style={{ color: 'var(--text-light)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Products Arriving Soon</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 20px', fontSize: '0.875rem' }}>
                We are currently cataloging new stock. Browse categories above or get in touch for custom requests.
              </p>
              <Link to="/contact" className="btn btn-outline btn-sm">Submit Custom Requirement</Link>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product, index) => (
                <div key={product._id} data-aos="fade-up" data-aos-delay={index * 60}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic AdSlot: only renders if an ad is actively embedded in database, otherwise renders nothing */}
      <div className="container">
        <AdSlot placement="home-mid" />
      </div>

      {/* Trust Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24, textAlign: 'center',
          }} data-aos="fade-up">
            {[
              { icon: ShieldCheck, title: 'Secure Shopping', desc: 'Your data is always protected' },
              { icon: CheckCircle2, title: 'Quality Assured', desc: 'Every product is thoroughly checked' },
              { icon: Zap, title: 'Fast Support', desc: 'Quick response to all enquiries' },
              { icon: BadgePercent, title: 'Best Prices', desc: 'Competitive pricing guaranteed' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 24 }} data-aos="fade-up" data-aos-delay={i * 100}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <item.icon size={36} style={{ color: 'var(--cta-hover)' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
