import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaBolt, FaLock } from 'react-icons/fa';
import './AIPanel.css';

const AIPanel = ({ products = [] }) => {
    // Take 4 products for recommendations
    const recommendations = products.slice(1, 5);

    return (
        <section className="ai-panel">
            <div className="container">
                <div className="ai-header-electro">
                    <div className="ai-branding">
                        <div className="ai-icon-electro">
                            <FaBrain />
                        </div>
                        <div className="ai-text">
                            <h3>Smart Recommendations</h3>
                            <p>Powered by AI based on your browsing history</p>
                        </div>
                    </div>
                    <div className="ai-status">
                        <div className="status-item">
                            <FaLock /> SECURE SHOPPING
                        </div>
                        <div className="status-item">
                            <FaBolt /> INSTANT ACCESS
                        </div>
                    </div>
                </div>

                <div className="ai-grid">
                    {recommendations.map((product, index) => (
                        <motion.div
                            key={product.id}
                            className="recommend-card"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="product-image-container">
                                <img src={product.image} alt={product.name} />
                            </div>
                            <div className="card-content-electro">
                                <span className="category-label">{product.category}</span>
                                <h4>{product.name}</h4>
                                <div className="card-footer-electro">
                                    <span className="price">₹{product.price}</span>
                                    <button className="buy-btn">BUY NOW</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AIPanel;
