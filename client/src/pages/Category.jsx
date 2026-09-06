import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { SlidersHorizontal, X } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

export default function Category() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Determine filters from slug
  const getFiltersFromSlug = () => {
    const filters = {};
    if (slug === 'new') filters.condition = 'new';
    else if (slug === 'refurbished') filters.condition = 'refurbished';
    else {
      // Find category by slug
      const cat = categories.find((c) => c.slug === slug);
      if (cat) {
        filters.category = cat._id;
      }
    }
    return filters;
  };

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const slugFilters = getFiltersFromSlug();
        const params = {
          ...slugFilters,
          page,
          sort,
          limit: 12,
        };
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const { data } = await productAPI.getAll(params);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug, page, sort, minPrice, maxPrice, categories]);

  const currentCategory = categories.find((c) => c.slug === slug);
  const title = currentCategory?.name || (slug === 'new' ? 'New Products' : slug === 'refurbished' ? 'Refurbished Products' : 'All Products');

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val) newParams.set(key, val);
      else newParams.delete(key);
    });
    // Reset to page 1 on filter change
    if (!updates.page) newParams.delete('page');
    setSearchParams(newParams);
  };

  return (
    <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }} data-aos="fade-up">
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{title}</h1>
          {currentCategory?.description && (
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{currentCategory.description}</p>
          )}
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginBottom: 24, flexWrap: 'wrap',
        }} data-aos="fade-up">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, width: '100%', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className={`btn btn-sm ${cat.slug === slug ? 'btn-cta' : 'btn-outline'}`}
                style={{ whiteSpace: 'nowrap', fontSize: '0.813rem', flexShrink: 0 }}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.875rem' }}
            >
              <option value="-createdAt">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A–Z</option>
            </select>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            padding: 20, marginBottom: 24, border: '1px solid var(--border)',
          }} data-aos="fade-down">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600 }}>Filters</h3>
              <button className="btn-icon" onClick={() => setFiltersOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label">Min Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: 140 }}
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => updateParams({ minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Max Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: 140 }}
                  placeholder="999999"
                  value={maxPrice}
                  onChange={(e) => updateParams({ maxPrice: e.target.value })}
                />
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => updateParams({ minPrice: '', maxPrice: '' })}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
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
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your filters or check back later for new arrivals.</p>
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination" data-aos="fade-up">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === pagination.page ? 'active' : ''}
                onClick={() => updateParams({ page: String(p) })}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
