import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar, FaTruck } from 'react-icons/fa';
import { useWishlist } from '../../wishlist/context/WishlistContext';
import { motion } from 'framer-motion';
import CountdownTimer from '../../../shared/components/ui/CountdownTimer';
import './ProductCard.css';
import './ProductCardBadges.css';

const ProductCard = ({ product }) => {
    const { addToWishlist, isInWishlist } = useWishlist();

    // Calculate delivery date skipping weekends
    const getDeliveryDate = (days) => {
        const date = new Date();
        let addedDays = 0;
        const targetDays = days || 3;
        
        while (addedDays < targetDays) {
            date.setDate(date.getDate() + 1);
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip Sunday(0) and Saturday(6)
                addedDays++;
            }
        }
        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <motion.div
            className="product-card"
            whileHover={{ y: -8, boxShadow: "0 10px 30px rgba(37, 99, 235, 0.25)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="product-img-wrapper">
                {/* Sale & Upcoming Badges */}
                {product.upcomingSale && product.saleStartDate && new Date(product.saleStartDate) > new Date() ? (
                    <div className="sale-badge">
                        <div className="upcoming-badge">
                            UPCOMING SALE
                        </div>
                    </div>
                ) : product.onSale ? (
                    <div className="sale-badge">
                        <div className={product.discount >= 50 ? "super-discount-badge" : "starburst-badge"}>
                            <span className="starburst-percent">{product.discount}%</span>
                            <span className="starburst-off">OFF</span>
                        </div>
                    </div>
                ) : null}

                <img src={product.image} alt={product.name} />
                <motion.button
                    className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        addToWishlist(product);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                >
                    {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                </motion.button>

                {/* Countdown Timer for Sale Products */}
                {product.onSale && product.saleEndDate && (
                    <div className="product-timer" style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {product.createdAt && (new Date() - new Date(product.createdAt)) < 7 * 24 * 60 * 60 * 1000 && (
                            <span className="launch-offer-label">Launch Offer Ends In:</span>
                        )}
                        <CountdownTimer endDate={product.saleEndDate} />
                    </div>
                )}
            </div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <div className="rating">
                    <FaStar className="star-icon" />
                    <span>{product.rating || 4.5}</span>
                </div>
                <p className="category">{product.category}</p>

                {/* Price Section */}
                <div className="price-section">
                    <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
                    {product.onSale && product.originalPrice > product.price && (
                        <p className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                    )}
                </div>

                {/* Delivery Estimate */}
                <div className="delivery-info">
                    <FaTruck className="delivery-icon" />
                    <span>Delivery by {getDeliveryDate(product.deliveryDays)}</span>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to={`/product/${product.id}`} className="btn">View Details</Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProductCard;

