import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './CategoryCard.css';

const CategoryCard = ({ name, image, productCount }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Link
                to={`/shop?category=${encodeURIComponent(name)}`}
                className="category-card"
            >
                <div className="category-image">
                    <img src={image} alt={name} />
                    <div className="category-overlay" />
                </div>
                <div className="category-content">
                    <h3>{name}</h3>
                    {productCount && (
                        <span className="product-count">{productCount} Products</span>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};

export default CategoryCard;
