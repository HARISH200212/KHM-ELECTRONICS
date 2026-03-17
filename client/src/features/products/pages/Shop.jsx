import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../../products/context/ProductContext';
import { FiTag, FiHeadphones, FiTool, FiStar, FiSpeaker, FiBox, FiWifi, FiHome, FiWatch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './Shop.css';

// Category configuration with icons and display order
const categoryConfig = {
    "Gadgets & More": { icon: FiStar, order: 1 },
    "Gimbals & Mic": { icon: FiTool, order: 2 },
    "Cables":         { icon: FiWifi, order: 3 },
    "Air pods":       { icon: FiHeadphones, order: 4 },
    "Watches":        { icon: FiWatch, order: 5 },
    "Speakers":       { icon: FiSpeaker, order: 6 },
    "Home & Living":  { icon: FiHome, order: 7 },
    "Next-Gen Toys":  { icon: FiBox, order: 8 },
};

const Shop = () => {
    const { products } = useProducts();
    const location = useLocation();
    const [filter, setFilter] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Featured');
    const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleCategorySelect = (cat) => {
        setFilter(cat);
        setShowFilters(false);
    };

    // Auto-close the filter panel after 5 seconds if no selection made
    useEffect(() => {
        if (!showFilters) return;
        const timer = setTimeout(() => setShowFilters(false), 5000);
        return () => clearTimeout(timer);
    }, [showFilters]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        const category = params.get('category');

        if (search) {
            setSearchTerm(search);
            // Searching from navbar should not be constrained by stale shop filters.
            if (!category) {
                setFilter('All');
                setBrandFilter('All');
                setShowOnSaleOnly(false);
            }
        } else {
            setSearchTerm('');
        }

        if (category) {
            setFilter(category);
        } else if (!search) {
            setFilter('All');
        }
    }, [location.search]);

    const categories = useMemo(() => [
        'All',
        'New Arrivals',
        ...[
            'Gadgets & More', 'Gimbals & Mic', 'Cables', 'Air pods',
            'Watches', 'Speakers', 'Home & Living', 'Next-Gen Toys'
        ].filter(cat => products.some(p => p.category === cat))
    ], [products]);
    const brands = useMemo(() => ['All', ...new Set(products.map(p => p.brand).filter(Boolean))], [products]);

    // Group products by category
    const productsByCategory = useMemo(() => {
        let currentProducts = [...products];

        // On Sale filter
        if (showOnSaleOnly) {
            currentProducts = currentProducts.filter(p => p.onSale);
        }

        // Brand filter
        if (brandFilter !== 'All') {
            currentProducts = currentProducts.filter(p => p.brand === brandFilter);
        }

        if (searchTerm) {
            currentProducts = currentProducts.filter(p =>
                (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        if (sortBy === 'Price: Low to High') {
            currentProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
            currentProducts.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Rating') {
            currentProducts.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        } else if (sortBy === 'Biggest Discount') {
            currentProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        }

        // Group by category
        const grouped = {};
        currentProducts.forEach(product => {
            if (!grouped[product.category]) {
                grouped[product.category] = [];
            }
            grouped[product.category].push(product);
        });

        return grouped;
    }, [products, searchTerm, sortBy, showOnSaleOnly, brandFilter]);

    // Get sorted category list
    const sortedCategories = useMemo(() => {
        const cats = Object.keys(productsByCategory);
        return cats.sort((a, b) => {
            const orderA = categoryConfig[a]?.order || 99;
            const orderB = categoryConfig[b]?.order || 99;
            return orderA - orderB;
        });
    }, [productsByCategory]);

    const filteredProducts = useMemo(() => {
        // Handle New Arrivals special filter
        if (filter === 'New Arrivals') {
            let sorted = [...products].sort((a, b) => (b.id || 0) - (a.id || 0));
            return sorted.slice(0, 12);
        }

        let currentProducts = filter === 'All'
            ? products
            : products.filter(p => p.category === filter);

        // On Sale filter
        if (showOnSaleOnly) {
            currentProducts = currentProducts.filter(p => p.onSale);
        }

        // Brand filter
        if (brandFilter !== 'All') {
            currentProducts = currentProducts.filter(p => p.brand === brandFilter);
        }

        if (searchTerm) {
            currentProducts = currentProducts.filter(p =>
                (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting Logic
        const sorted = [...currentProducts];
        if (sortBy === 'Price: Low to High') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Rating') {
            sorted.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        } else if (sortBy === 'Biggest Discount') {
            sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        }

        return sorted;
    }, [products, filter, searchTerm, sortBy, showOnSaleOnly, brandFilter]);

    const saleCount = products.filter(p => p.onSale).length;
    const totalProductsShown = Object.values(productsByCategory).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div className="shop-page container">
            <div className="shop-header">
                <h2 className="section-title">Our Collection</h2>
                <div className="shop-controls">
                    {/* Collapsible Category Filter */}
                    <div className="filters-wrapper">
                        {/* Toggle bar — always visible */}
                        <button
                            className="filters-toggle-bar"
                            onClick={() => setShowFilters(prev => !prev)}
                        >
                            <span className="filters-toggle-label">
                                {showFilters ? 'Hide Departments' : `Department: ${filter}`}
                            </span>
                            {showOnSaleOnly && (
                                <span className="sale-badge-pill">On Sale</span>
                            )}
                            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
                        </button>

                        {/* Expanded filter options */}
                        {showFilters && (
                            <div className="filters">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                        onClick={() => handleCategorySelect(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}

                                {/* On Sale Toggle */}
                                <button
                                    className={`filter-btn sale-filter ${showOnSaleOnly ? 'active' : ''}`}
                                    onClick={() => setShowOnSaleOnly(!showOnSaleOnly)}
                                >
                                    <FiTag />
                                    On Sale ({saleCount})
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="shop-actions">
                        <div className="results-count">
                            Showing {filter === 'All' ? totalProductsShown : filteredProducts.length} products
                            {searchTerm && <span> for "{searchTerm}"</span>}
                        </div>
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option>Featured</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Biggest Discount</option>
                            <option>Rating</option>
                        </select>
                        <select
                            className="sort-select"
                            value={brandFilter}
                            onChange={(e) => setBrandFilter(e.target.value)}
                            style={{ marginLeft: '10px' }}
                        >
                            <option value="All">All Brands</option>
                            {brands.filter(b => b !== 'All').map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filter === 'All' ? (
                // Category-wise sections view
                <div className="category-sections">
                    {sortedCategories.map(category => {
                        const CategoryIcon = categoryConfig[category]?.icon || FiBox;
                        const categoryProducts = productsByCategory[category];

                        return (
                            <section key={category} className="category-section">
                                <div className="category-header">
                                    <div className="category-title-group">
                                        <CategoryIcon className="category-icon" />
                                        <h3 className="category-title">{category}</h3>
                                        <span className="category-count">{categoryProducts.length} items</span>
                                    </div>
                                    <button
                                        className="view-all-btn"
                                        onClick={() => setFilter(category)}
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="product-grid">
                                    {categoryProducts.slice(0, 4).map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            ) : (
                // Single category view
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Shop;

