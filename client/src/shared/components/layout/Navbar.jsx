import { Link } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaHeart, FaTimes, FaMicrophone, FaCamera } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../features/cart/context/CartContext';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useWishlist } from '../../../features/wishlist/context/WishlistContext';
import { useProducts } from '../../../features/products/context/ProductContext';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceSearch from '../ui/VoiceSearch';
import DiscountBanner from './DiscountBanner';
import './Navbar.css';
import './NavbarSuggestions.css';

const Navbar = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const { products } = useProducts();
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
    const [isImageScannerOpen, setIsImageScannerOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [matchingProducts, setMatchingProducts] = useState([]);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const navigate = useNavigate();

    // Get unique categories
    const categoriesMenu = Array.from(new Set(products.map(p => p.category))).slice(0, 10);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        const handleMouseMove = (e) => {
            if (e.clientY < 60) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [lastScrollY]);

    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
            setIsSearchOpen(false);
            setIsVoiceSearchOpen(false);
            setSearchTerm('');
            setMatchingProducts([]);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        
        if (query.trim().length > 1) {
            const matches = products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) || 
                p.category.toLowerCase().includes(query.toLowerCase()) ||
                (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 5); // Show max 5 suggestions
            setMatchingProducts(matches);
        } else {
            setMatchingProducts([]);
        }
    };

    const handleSuggestionClick = (productId) => {
        navigate(`/product/${productId}`);
        setSearchTerm('');
        setMatchingProducts([]);
    };

    const handleVoiceResult = (text) => {
        setSearchTerm(text);
        // Add a small delay for visual feedback
        setTimeout(() => {
            navigate(`/shop?search=${encodeURIComponent(text.trim())}`);
            setIsVoiceSearchOpen(false);
            setSearchTerm('');
        }, 1000);
    };

    const handleImageScan = (e) => {
        // Mock image scanning process
        const file = e.target.files[0];
        if (file) {
            setIsScanning(true);
            // Simulate 2s analysis delay
            setTimeout(() => {
                setIsScanning(false);
                setIsImageScannerOpen(false);
                setSearchTerm('Headphones'); // Mock result
                navigate(`/shop?search=Headphones`);
            }, 2000);
        }
    };

    return (
        <>
            <DiscountBanner />
            <header className="electro-header">
                {/* Top Bar */}
            <div className="top-bar">
                <div className="container nav-container">
                    <div className="top-bar-left">
                        <span>Welcome to KH Electronics Store</span>
                    </div>
                    <div className="top-bar-right">
                        <Link to="/orders">Track Your Order</Link>
                        <Link to="/store-locator">Store Locator</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="main-header">
                <div className="container nav-container">
                    <Link to="/" className="logo">
                        <span className="logo-text">
                            KHM ELECTRONICS
                        </span>
                    </Link>

                    <div className="header-search">
                        <div className="header-search-container" style={{ position: 'relative', flex: 1 }}>
                            <form onSubmit={handleSearch} className="search-form">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', background: '#f3f3f3', paddingRight: '10px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsImageScannerOpen(true)}
                                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '0 10px' }}
                                        title="Search by Image"
                                    >
                                        <FaCamera />
                                    </button>
                                </div>
                                <select className="category-select">
                                    <option>All Categories</option>
                                    <option>Laptops</option>
                                    <option>Smartphones</option>
                                </select>
                                <button type="submit" className="search-btn">
                                    <FaSearch />
                                </button>
                            </form>

                            {/* Image Scanner Modal */}
                            <AnimatePresence>
                                {isImageScannerOpen && (
                                    <motion.div
                                        className="amz-modal-overlay"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsImageScannerOpen(false)}
                                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <div 
                                            className="amz-modal-content" 
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', position: 'relative' }}
                                        >
                                            <button 
                                                onClick={() => setIsImageScannerOpen(false)}
                                                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-gray)' }}
                                            >
                                                <FaTimes />
                                            </button>
                                            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Visual Search</h2>
                                            
                                            {isScanning ? (
                                                <div style={{ padding: '40px 0' }}>
                                                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                                                    <p style={{ color: 'var(--text-main)' }}>Analyzing image using Vision AI...</p>
                                                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                                </div>
                                            ) : (
                                                <div style={{ border: '2px dashed #888', padding: '40px 20px', borderRadius: '8px', cursor: 'pointer', position: 'relative' }}>
                                                    <FaCamera style={{ fontSize: '40px', color: '#888', marginBottom: '15px' }} />
                                                    <p style={{ color: 'var(--text-main)', margin: '0 0 10px' }}>Drag & Drop an image here</p>
                                                    <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>or click to browse</p>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={handleImageScan}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Search Suggestions Dropdown */}
                            <AnimatePresence>
                                {matchingProducts.length > 0 && (
                                    <motion.div 
                                        className="search-suggestions-dropdown"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                    >
                                        <ul>
                                            {matchingProducts.map(p => (
                                                <li key={p.id} onClick={() => handleSuggestionClick(p.id)}>
                                                    <div className="suggestion-item">
                                                        <img src={p.image} alt={p.name} className="suggestion-img" />
                                                        <div className="suggestion-info">
                                                            <span className="suggestion-name">{p.name}</span>
                                                            <span className="suggestion-price">₹{p.price.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="header-actions">
                        <Link to="/compare" className="action-item hide-mobile">
                            <div className="icon-wrap"><FaSearch /></div>
                        </Link>
                        <Link to="/wishlist" className="action-item">
                            <div className="icon-wrap">
                                <FaHeart />
                                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                            </div>
                        </Link>
                        <Link to="/cart" className="action-item">
                            <div className="icon-wrap">
                                <FaShoppingCart />
                                <span className="badge">{cartCount}</span>
                            </div>
                        </Link>
                        <div className="action-item user-action">
                            <div className="icon-wrap" onClick={() => setShowUserMenu(!showUserMenu)}>
                                {user ? (user.name.charAt(0).toUpperCase()) : '👤'}
                            </div>
                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="user-dropdown-electro"
                                    >
                                        <div className="dropdown-header">Welcome, {user ? user.name.split(' ')[0] : 'Guest'}</div>
                                        {user ? (
                                            <>
                                                {user.role === 'admin' && <Link to="/admin" onClick={() => setShowUserMenu(false)}>Dashboard</Link>}
                                                <Link to="/profile" onClick={() => setShowUserMenu(false)}>My Profile</Link>
                                                <Link to="/settings" onClick={() => setShowUserMenu(false)}>Account Settings</Link>
                                                <Link to="/orders" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                                                <button onClick={() => { setShowUserMenu(false); logout(); }}>Logout</button>
                                            </>
                                        ) : (
                                            <Link to="/login" onClick={() => setShowUserMenu(false)}>Login / Register</Link>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav Bar */}
            <nav className="nav-bar">
                <div className="container nav-container">
                    <div className="categories-dropdown" 
                         onMouseEnter={() => setShowCategories(true)}
                         onMouseLeave={() => setShowCategories(false)}>
                        <button className="dept-btn" onClick={() => setShowCategories(!showCategories)}>
                            All Departments
                        </button>
                        <AnimatePresence>
                            {showCategories && (
                                <motion.div 
                                    className="dept-dropdown-menu"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <ul>
                                        {categoriesMenu.map(cat => (
                                            <li key={cat}>
                                                <Link to={`/shop?category=${cat}`} onClick={() => setShowCategories(false)}>
                                                    {cat} <span className="chevron">&gt;</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="main-nav">
                        <Link to="/">Home</Link>
                        <Link to="/shop">Shop</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact</Link>
                    </div>

                    {/* Removed Free Shipping Text */}
                </div>
            </nav>
        </header>
        </>
    );
};

export default Navbar;
