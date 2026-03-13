import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const orderData = location.state?.order;

    useEffect(() => {
        if (!orderData) return;

        // Simulate payment verification process
        const verifyPayment = setTimeout(() => {
            if (orderData.status === 'success') {
                setStatus('success');
            } else if (orderData.status === 'failed') {
                setStatus('failed');
            }
        }, 2000);

        return () => clearTimeout(verifyPayment);
    }, [orderData]);

    if (!orderData) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="amz-confirmation-page">
            <header className="amz-simple-header">
                <Link to="/" className="amz-logo">KHM Electronics</Link>
            </header>

            <div className="amz-confirmation-container">
                {status === 'processing' && (
                    <div className="amz-confirmation-box processing-box">
                        <FaSpinner className="spinner-icon" />
                        <h2>Verifying Payment...</h2>
                        <p>Please wait while we confirm your order.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="amz-confirmation-box success-box">
                        <div className="success-header">
                            <FaCheckCircle className="check-icon" />
                            <div>
                                <h1 className="success-title">Order placed, thank you!</h1>
                                <p className="success-subtitle">Confirmation will be sent to your email.</p>
                            </div>
                        </div>

                        <div className="order-details-summary">
                            <p><strong>Order Number:</strong> <span className="order-num-highlight">{orderData.id}</span></p>
                            
                            <div className="delivery-summary">
                                <h3>Guaranteed delivery: <strong>{new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</strong></h3>
                                <p>Items to be dispatched by KHM</p>
                            </div>
                        </div>

                        <div className="amz-action-links">
                            <button className="amz-link-btn" onClick={() => navigate('/orders')}>Review or edit your recent orders</button>
                            <span className="separator">|</span>
                            <button className="amz-link-btn" onClick={() => navigate('/shop')}>Continue shopping</button>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="amz-confirmation-box failed-box">
                        <div className="failed-header">
                            <FaTimesCircle className="error-icon" />
                            <h2>Payment Failed</h2>
                        </div>
                        <p className="failed-msg">
                            We couldn't process your payment. Please try again or use a different method.
                        </p>
                        <div className="failed-actions">
                            <button className="amz-btn amz-btn-primary" onClick={() => navigate('/checkout')}>
                                <FaArrowLeft /> Try Again
                            </button>
                            <button className="amz-btn amz-btn-secondary" onClick={() => navigate('/cart')}>
                                Return to Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderConfirmation;
