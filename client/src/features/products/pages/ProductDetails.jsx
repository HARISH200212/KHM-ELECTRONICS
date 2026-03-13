import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../products/context/ProductContext';
import { useState } from 'react';
import { useCart } from '../../cart/context/CartContext';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiTruck, FiShield, FiRotateCcw, FiMapPin, FiLock } from 'react-icons/fi';
import { FaShoppingCart, FaCaretDown, FaBoxOpen, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewSection from '../components/ReviewSection';
import ProductModelViewer from '../components/ProductModelViewer';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products } = useProducts();
    const product = products.find(p => p.id === parseInt(id));
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
    const [show3DModel, setShow3DModel] = useState(false);
    const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);
    const { addToCart } = useCart();

    if (!product) {
        return <div className="container error-msg">Product not found</div>;
    }

    // Find similar and highly rated products
    const similarProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 8);

    const highlyRatedProducts = products
        .filter(p => p.rating >= 4.5 && p.id !== product.id)
        .slice(0, 8);

    const targetDays = product.deliveryDays || 3;
    const deliveryDate = new Date();
    let addedDays = 0;
    while (addedDays < targetDays) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
            addedDays++;
        }
    }

    const handleAddToCart = () => {
        const productToAdd = { ...product, selectedColor };
        addToCart(productToAdd, quantity);
        toast.success(`${product.name} ${selectedColor ? `(${selectedColor}) ` : ''}added to cart!`);
    };

    const handleBuyNow = () => {
        const productToBuy = { ...product, selectedColor };
        navigate('/checkout', { state: { directBuy: { ...productToBuy, quantity } } });
    };

    const calculateEmi = (months) => {
        const principal = product.price;
        const ratePerMonth = 15 / 12 / 100; // 15% p.a.
        const emi = principal * ratePerMonth * Math.pow(1 + ratePerMonth, months) / (Math.pow(1 + ratePerMonth, months) - 1);
        const totalInterest = (emi * months) - principal;
        return { emi: Math.round(emi), totalInterest: Math.round(totalInterest) };
    };

    const renderSuggestionCard = (p) => (
        <div key={p.id} className="amz-suggestion-card" onClick={() => navigate(`/product/${p.id}`)}>
            <div className="amz-suggestion-img">
                <img src={p.image} alt={p.name} />
            </div>
            <Link to={`/product/${p.id}`} className="amz-suggestion-title" onClick={(e) => e.stopPropagation()}>{p.name}</Link>
            <div className="amz-suggestion-rating">
                <span className="amz-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < Math.floor(p.rating || 4.5) ? 'star-filled' : 'star-empty'}>★</span>
                    ))}
                </span>
                <span className="amz-rating-count">{p.reviews || Math.floor(Math.random() * 1000) + 50}</span>
            </div>
            <div className="amz-suggestion-price">
                <span className="currency">₹</span><span className="amount">{p.price.toLocaleString('en-IN')}</span>
            </div>
            {p.onSale && (
                <div className="amz-suggestion-save">Save {(p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 15)}%</div>
            )}
        </div>
    );

    return (
        <div className="amazon-product-page">
            <div className="amazon-container">
                {/* Breadcrumbs */}
                <nav className="amazon-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="separator">›</span>
                    <Link to="/shop">{product.category}</Link>
                    <span className="separator">›</span>
                    <span className="current">{product.name}</span>
                </nav>

                <div className="product-grid-amazon">
                    
                    {/* Left Column: Image / 3D Model */}
                    <div className="amazon-col-left">
                        <div className="amz-image-gallery">
                            <div className="main-image-view" style={{ position: 'relative' }}>
                                {show3DModel && product.threeDModelUrl ? (
                                    <ProductModelViewer modelUrl={product.threeDModelUrl} productName={product.name} />
                                ) : (
                                    <>
                                        <img src={product.image} alt={product.name} />
                                        <p className="image-zoom-hint">Roll over image to zoom in</p>
                                    </>
                                )}
                                
                                {product.threeDModelUrl && (
                                    <button 
                                        onClick={() => setShow3DModel(!show3DModel)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            background: 'var(--primary-gradient)',
                                            color: 'black',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: 'var(--shadow-olive)'
                                        }}
                                    >
                                        <FaBoxOpen /> {show3DModel ? 'View Image' : 'View 3D Model & AR'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Product Details */}
                    <div className="amazon-col-center">
                        <h1 className="amz-product-title">{product.name}</h1>
                        <a href="#brand" className="amz-brand-link">Visit the {product.brand || 'Store'}</a>
                        
                        <div className="amz-ratings-row">
                            <span className="amz-stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={i < Math.floor(product.rating || 4.5) ? 'star-filled' : 'star-empty'}>★</span>
                                ))}
                            </span>
                            <a href="#reviews" className="amz-rating-count">1,248 ratings</a>
                            <span className="separator">|</span>
                            <a href="#questions" className="amz-answered-questions">352 answered questions</a>
                        </div>
                        
                        <hr className="amz-divider" />

                        <div className="amz-price-block">
                            <div className="top-discount">
                                <span className="discount-badge">-{(product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 15)}%</span>
                                <span className="current-price">
                                    <span className="currency">₹</span><span className="amount">{product.price.toLocaleString('en-IN')}</span>
                                </span>
                            </div>
                            <div className="mrp-line">
                                <span className="mrp-label">M.R.P.:</span>
                                <span className="mrp-value">₹{(product.originalPrice || product.price * 1.15).toLocaleString('en-IN')}</span>
                            </div>
                            <p className="inclusive-taxes">Inclusive of all taxes</p>
                            <p className="emi-options">
                                <strong>EMI</strong> starts at ₹{(product.price / 12).toFixed(0)}. 
                                <span onClick={() => setIsEmiModalOpen(true)} style={{ color: 'var(--amazon-blue)', cursor: 'pointer', marginLeft: '5px' }}>
                                    EMI options
                                </span>
                            </p>

                            {product.bankOffers && product.bankOffers.length > 0 && (
                                <div className="bank-offers-section" style={{ marginTop: '15px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--primary)' }}>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: 'var(--primary)' }}>💳 Bank & Card Offers</h4>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                        {product.bankOffers.map((offer, idx) => (
                                            <li key={idx} style={{ marginBottom: '6px' }}>{offer}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <hr className="amz-divider" />
                        
                        <div className="amz-trust-features">
                            <div className="trust-item">
                                <FiTruck className="trust-icon" />
                                <span>Free Delivery</span>
                            </div>
                            <div className="trust-item">
                                <FiRotateCcw className="trust-icon" />
                                <span>7 Days Replacement</span>
                            </div>
                            <div className="trust-item">
                                <FiShield className="trust-icon" />
                                <span>1 Year Warranty</span>
                            </div>
                        </div>

                        <hr className="amz-divider" />

                        <div className="amz-feature-bullets">
                            <h3>About this item</h3>
                            <ul>
                                {product.features?.map((feature, idx) => (
                                    <li key={idx}>{feature}</li>
                                )) || (
                                    <>
                                        <li>High performance components designed for long-lasting durability.</li>
                                        <li>Optimized for superior user experience right out of the box.</li>
                                        <li>Compact and elegant design fits perfectly in any environment.</li>
                                        <li>Backed by a 1-year comprehensive manufacturer warranty.</li>
                                    </>
                                )}
                            </ul>
                            <a href="#" className="see-more-link">See more product details</a>
                        </div>
                    </div>

                    {/* Right Column: The Buy Box */}
                    <div className="amazon-col-right">
                        <div className="amazon-buy-box">
                            <div className="bb-price">
                                <span className="currency">₹</span><span className="amount">{product.price.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="bb-delivery-info">
                                <a href="#">FREE delivery</a> <strong>{deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> on orders dispatched by KHM over ₹499.
                            </div>
                            <div className="bb-location">
                                <FiMapPin className="pin-icon" />
                                <a href="#">Select delivery location</a>
                            </div>

                            <div className="bb-stock-status">
                                {product.stock > 0 || !product.stock ? 'In stock' : 'Out of stock'}
                            </div>

                            <div className="bb-seller-info">
                                <div className="seller-row"><span>Ships from</span> KHM Electronics</div>
                                <div className="seller-row"><span>Sold by</span> <a href="#">Retail Net</a></div>
                            </div>

                            {product.colors && product.colors.length > 0 && (
                                <div className="bb-color-selection" style={{ margin: '15px 0' }}>
                                    <span style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#888' }}>
                                        Color: <strong>{selectedColor}</strong>
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {product.colors.map(color => (
                                            <button 
                                                key={color} 
                                                onClick={() => setSelectedColor(color)}
                                                style={{ 
                                                    padding: '4px 12px',
                                                    background: selectedColor === color ? '#f0c14b' : '#333',
                                                    color: selectedColor === color ? '#111' : '#fff',
                                                    border: `1px solid ${selectedColor === color ? '#a88734' : '#555'}`,
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bb-quantity">
                                <span>Quantity: </span>
                                <div className="qty-dropdown">
                                    <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bb-actions">
                                <button className="amz-btn amz-btn-cart" onClick={handleAddToCart}>
                                    Add to Cart
                                </button>
                                <button className="amz-btn amz-btn-buy" onClick={handleBuyNow}>
                                    Buy Now
                                </button>
                            </div>

                            <div className="bb-secure-transaction">
                                <FiLock className="lock-icon" />
                                <a href="#">Secure transaction</a>
                            </div>

                            <div className="bb-gift-option">
                                <input type="checkbox" id="gift" />
                                <label htmlFor="gift">Add gift options</label>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="amz-section-divider" />

                {/* Suggestions Section */}
                <div className="amazon-suggestions-block">
                    {similarProducts.length > 0 && (
                        <div className="amazon-suggestions-row">
                            <h2>Customers who viewed this item also viewed</h2>
                            <div className="suggestions-carousel">
                                {similarProducts.map(renderSuggestionCard)}
                            </div>
                        </div>
                    )}
                    
                    {highlyRatedProducts.length > 0 && (
                        <div className="amazon-suggestions-row">
                            <h2>Highly rated by customers</h2>
                            <div className="suggestions-carousel">
                                {highlyRatedProducts.map(renderSuggestionCard)}
                            </div>
                        </div>
                    )}
                </div>

                <hr className="amz-section-divider" />

                {/* Reviews Section at bottom */}
                <div id="reviews" className="amazon-reviews-section">
                    <ReviewSection productId={product.id} />
                </div>

                {/* EMI Modal */}
                <AnimatePresence>
                    {isEmiModalOpen && (
                        <div className="amz-modal-overlay" onClick={() => setIsEmiModalOpen(false)}>
                            <motion.div 
                                className="amz-modal-content" 
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ maxWidth: '600px' }}
                            >
                                <button className="amz-modal-close" onClick={() => setIsEmiModalOpen(false)}>
                                    <FaTimes />
                                </button>
                                <h2>EMI Options</h2>
                                <p style={{ color: 'var(--amazon-text-muted)', marginBottom: '20px' }}>For {product.name} (Price: ₹{product.price.toLocaleString('en-IN')})</p>
                                
                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--amazon-elements-bg)', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)' }}>Duration</th>
                                            <th style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)' }}>EMI (₹ / month)</th>
                                            <th style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)' }}>Interest (15% p.a.)</th>
                                            <th style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)' }}>Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[3, 6, 9, 12].map(months => {
                                            const { emi, totalInterest } = calculateEmi(months);
                                            return (
                                                <tr key={months}>
                                                    <td style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)' }}>{months} Months</td>
                                                    <td style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)', fontWeight: 'bold' }}>₹{emi.toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)' }}>₹{totalInterest.toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '10px', borderBottom: '1px solid var(--amazon-border)' }}>₹{(product.price + totalInterest).toLocaleString('en-IN')}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <p style={{ fontSize: '12px', color: '#888', marginTop: '15px' }}>
                                    * This is a simulated EMI calculator assuming a generic 15% per annum interest rate across major credit cards. Actual rates may vary by bank.
                                </p>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductDetails;


