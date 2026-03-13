import { useMemo, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SaleAlert from '../../../shared/components/ui/SaleAlert';
import ProductCard from '../../products/components/ProductCard';
import CategoryCard from '../../products/components/CategoryCard';
import { useProducts } from '../../products/context/ProductContext';
import './Home.css';

// Lazy load heavy components
const HeroSlider = lazy(() => import('../components/HeroSlider'));


const CATEGORY_LIST = [
  { name: "New Arrivals", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=300" },
  { name: "Gadgets & More", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=300" },
  { name: "Gimbals & Mic", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300" },
  { name: "Cables", image: "https://images.unsplash.com/photo-1601524908010-a4ed0fdf24c7?auto=format&fit=crop&q=80&w=300" },
  { name: "Air pods", image: "https://images.unsplash.com/photo-1613110363240-4bd06b9b3e9b?auto=format&fit=crop&q=80&w=300" },
  { name: "Watches", image: "https://images.unsplash.com/photo-1544117518-e7963b11b044?auto=format&fit=crop&q=80&w=300" },
  { name: "Speakers", image: "https://images.unsplash.com/photo-1614113143851-89173b064b81?auto=format&fit=crop&q=80&w=300" },
  { name: "Home & Living", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=300" },
  { name: "Next-Gen Toys", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=300" },
];

// Framer Motion Variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 120 }
  })
};

const Home = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('featured');

  // Compute categories with product counts
  const categories = useMemo(() => {
    const countMap = {};
    products.forEach(p => {
      countMap[p.category] = (countMap[p.category] || 0) + 1;
    });
    return CATEGORY_LIST.map(cat => ({
      ...cat,
      count: cat.name === 'New Arrivals' ? Math.min(products.length, 12) : (countMap[cat.name] || 0)
    }));
  }, [products]);

  // Product groups
  const featuredList = products.slice(0, 8);
  const saleList = products.filter(p => p.onSale).slice(0, 8);
  const topRatedList = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  const activeProducts = activeTab === 'featured' ? featuredList : activeTab === 'onSale' ? saleList : topRatedList;

  return (
    <div className="home-page">
      <div className="container">
        <Suspense fallback={<div>Loading Hero Slider...</div>}>
          <HeroSlider />
        </Suspense>

        {/* Promo Banners */}
        <div className="promo-banners grid-3" role="region" aria-label="Promotions">
          <div className="banner glass-banner">
            <div className="banner-info">
              <h3>Catch Big <strong>Deals on the Cameras</strong></h3>
              <button className="btn-link" aria-label="Shop Cameras">Shop Now</button>
            </div>
            <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200" alt="Camera promotion" />
          </div>
          <div className="banner yellow-banner">
            <div className="banner-info">
              <h3>Tablets, <strong>Smartphones and more</strong></h3>
              <p>UP TO 70% OFF</p>
            </div>
            <img src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=200" alt="Tablet promotion" />
          </div>
          <div className="banner dark-banner">
            <div className="banner-info">
              <h3>The New <strong>Standard</strong></h3>
              <button className="btn-link" aria-label="Shop Watches">Shop Now</button>
            </div>
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200" alt="Watch promotion" />
          </div>
        </div>

        {/* Product Tabs */}
        <section className="product-tabs-section">
          <div className="tabs-header">
            {['featured', 'onSale', 'topRated'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'featured' ? 'Featured' : tab === 'onSale' ? 'On Sale' : 'Top Rated'}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {activeProducts.map((product, index) => (
              <motion.div
                key={product.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="recommendations-section">
          <div className="section-header-electro">
            <h2>Recommendations For You</h2>
          </div>
          <div className="product-grid-6">
            {products.slice(0, 6).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="categories-browse">
          <h2 className="section-title">Browse Categories</h2>
          <div className="category-scroll-grid">
            {categories.map(cat => (
              <CategoryCard
                key={cat.name}
                cat={cat}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;