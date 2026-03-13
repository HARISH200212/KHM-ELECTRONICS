import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PaymentLoader.css';

const PaymentLoader = ({ isVisible, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing secure connection...');

    const statusMessages = [
        { threshold: 0, text: 'Connecting to UPI Gateway...' },
        { threshold: 25, text: 'Verifying VPA / UPI ID...' },
        { threshold: 50, text: 'Encrypting transaction data...' },
        { threshold: 75, text: 'Generating secure QR code...' },
        { threshold: 100, text: 'Ready!' }
    ];

    useEffect(() => {
        if (isVisible) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => onComplete?.(), 500);
                        return 100;
                    }
                    const next = prev + Math.random() * 15;
                    const msg = statusMessages.findLast(m => next >= m.threshold);
                    if (msg) setStatus(msg.text);
                    return Math.min(next, 100);
                });
            }, 400);
            return () => clearInterval(interval);
        } else {
            setProgress(0);
            setStatus('Initializing secure connection...');
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="payment-loader-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="loader-content">
                        <div className="loader-shield">🔒</div>
                        <h3>Processing Payment</h3>
                        <p className="status-text">{status}</p>

                        <div className="progress-container">
                            <motion.div
                                className="progress-bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="security-badges">
                            <span>PCI DSS Compliant</span> • <span>256-bit AES Encryption</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymentLoader;
