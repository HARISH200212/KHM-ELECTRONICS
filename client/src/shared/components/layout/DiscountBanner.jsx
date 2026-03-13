import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './DiscountBanner.css';

const DiscountBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="discount-banner">
            <div className="banner-content">
                <span className="marquee-text">
                    🔥 SUPER SALE! Use code <strong>KH50</strong> for 50% OFF | Free Shipping on orders over ₹499 | Limited time offer! 🔥
                </span>
            </div>
            <button className="banner-close" onClick={() => setIsVisible(false)}>
                <FaTimes />
            </button>
        </div>
    );
};

export default DiscountBanner;
