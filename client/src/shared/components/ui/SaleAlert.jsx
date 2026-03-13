import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaCode } from 'react-icons/fa';
import './SaleAlert.css';

const SaleAlert = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show alert after 2 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="sale-alert-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="sale-alert-content glass"
                        initial={{ scale: 0.8, y: 50, rotateX: 45 }}
                        animate={{ scale: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.8, y: 50, opacity: 0 }}
                    >
                        <div className="alert-glitch-bg"></div>
                        <button className="close-alert" onClick={() => setIsVisible(false)}>
                            <FaTimes />
                        </button>

                        <div className="alert-icon">
                            <FaExclamationTriangle />
                        </div>

                        <div className="alert-body">
                            <div className="alert-title">SYSTEM_OVERRIDE: DISCOUNT_DETECTED</div>
                            <div className="alert-code">
                                <FaCode /> AUTH_KEY: <span className="neon">X-MATRIX-30</span>
                            </div>
                            <h2 className="alert-heading">30% OFF ALL PRODUCTS</h2>
                            <p className="alert-text">ENCRYPTED DISCOUNT APPLIED TO CART AUTOMATICALLY</p>
                        </div>

                        <motion.button
                            className="alert-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsVisible(false)}
                        >
                            ACKNOWLEDGE_SECURE_LINK
                        </motion.button>

                        <div className="alert-footer">
                            <span>TIMESTAMP: {new Date().toLocaleTimeString()}</span>
                            <span>SOURCE: NEURAL_NET_SALE_PROTOCOL</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SaleAlert;
