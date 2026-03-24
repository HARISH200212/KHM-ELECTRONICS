import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaClock, FaLock, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import './PaymentProcessingScreen.css';

const PaymentProcessingScreen = ({
    isVisible,
    paymentMethod = 'card',
    amount,
    status = 'idle',
    transactionId,
    errorMessage,
    onRetry,
    onClose
}) => {
    const [displayStatus, setDisplayStatus] = useState(status);
    const [progress, setProgress] = useState(0);
    const [animatingSuccess, setAnimatingSuccess] = useState(false);

    useEffect(() => {
        setDisplayStatus(status);
        if (status === 'succeeded') {
            setProgress(100);
            setAnimatingSuccess(true);
        } else if (status === 'processing') {
            setProgress(0);
            setAnimatingSuccess(false);
            const interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + Math.random() * 20;
                    return Math.min(next, 90);
                });
            }, 500);
            return () => clearInterval(interval);
        }
    }, [status]);

    const getStatusConfig = () => {
        const configs = {
            idle: {
                icon: <FaLock />,
                title: 'Ready to Pay',
                color: 'primary',
                message: 'Click to proceed with payment'
            },
            processing: {
                icon: <FaSpinner className="spinner" />,
                title: 'Processing Payment',
                color: 'processing',
                message: `Securely processing ${paymentMethod.toUpperCase()} payment...`
            },
            succeeded: {
                icon: <FaCheck />,
                title: 'Payment Successful!',
                color: 'success',
                message: 'Your payment has been processed successfully'
            },
            failed: {
                icon: <FaTimes />,
                title: 'Payment Failed',
                color: 'error',
                message: errorMessage || 'Payment could not be processed'
            },
            pending: {
                icon: <FaClock />,
                title: 'Payment Pending',
                color: 'warning',
                message: 'Waiting for payment confirmation'
            }
        };
        return configs[displayStatus] || configs.idle;
    };

    const config = getStatusConfig();

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="payment-processing-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="payment-processing-card"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                    >
                        {/* Header */}
                        <div className={`processing-header ${config.color}`}>
                            <motion.div
                                className="processing-icon"
                                animate={displayStatus === 'processing' ? { rotate: 360 } : {}}
                                transition={displayStatus === 'processing' ? { repeat: Infinity, duration: 2 } : {}}
                            >
                                {config.icon}
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {config.title}
                            </motion.h2>
                        </div>

                        {/* Main Content */}
                        <div className="processing-content">
                            {/* Amount Display */}
                            <div className="amount-section">
                                <p className="amount-label">Amount</p>
                                <motion.h3
                                    className={`amount-value ${config.color}`}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                >
                                    ₹{amount?.toLocaleString('en-IN')}
                                </motion.h3>
                            </div>

                            {/* Payment Method & Details */}
                            <div className="payment-details">
                                <div className="detail-row">
                                    <span className="detail-label">Payment Method:</span>
                                    <span className="detail-value">
                                        {paymentMethod === 'card' && '💳 Credit/Debit Card'}
                                        {paymentMethod === 'upi' && '📱 UPI'}
                                        {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                                    </span>
                                </div>
                                {transactionId && (
                                    <div className="detail-row">
                                        <span className="detail-label">Transaction ID:</span>
                                        <span className="detail-value txn-id">{transactionId}</span>
                                    </div>
                                )}
                            </div>

                            {/* Status Message */}
                            <motion.p
                                className={`status-message ${config.color}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {config.message}
                            </motion.p>

                            {/* Progress Bar (for processing state) */}
                            {displayStatus === 'processing' && (
                                <div className="progress-container">
                                    <motion.div
                                        className="progress-bar"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            )}

                            {/* Success Checkmark Animation */}
                            {displayStatus === 'succeeded' && (
                                <motion.div
                                    className="success-checkmark"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 15
                                    }}
                                >
                                    ✓
                                </motion.div>
                            )}

                            {/* Error Alert */}
                            {displayStatus === 'failed' && (
                                <motion.div
                                    className="error-alert"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <FaExclamationTriangle />
                                    <p>{errorMessage || 'An error occurred during payment processing'}</p>
                                </motion.div>
                            )}

                            {/* Security Badge */}
                            <div className="security-info">
                                <FaLock className="lock-icon" />
                                <span>Secure transaction • PCI DSS Compliant • 256-bit Encryption</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="processing-actions">
                            {displayStatus === 'succeeded' && (
                                <motion.button
                                    className="btn-action btn-success"
                                    onClick={onClose}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Continue to Order
                                </motion.button>
                            )}

                            {displayStatus === 'failed' && (
                                <div className="button-group">
                                    <motion.button
                                        className="btn-action btn-retry"
                                        onClick={onRetry}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        Try Again
                                    </motion.button>
                                    <motion.button
                                        className="btn-action btn-cancel"
                                        onClick={onClose}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            )}

                            {displayStatus === 'pending' && (
                                <motion.button
                                    className="btn-action btn-pending"
                                    disabled
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <FaClock /> Waiting for Confirmation...
                                </motion.button>
                            )}

                            {(displayStatus === 'processing' || displayStatus === 'idle') && (
                                <motion.button
                                    className="btn-action btn-cancel"
                                    onClick={onClose}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    disabled={displayStatus === 'processing'}
                                >
                                    Close
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymentProcessingScreen;
