import { useState, useEffect } from 'react';
import { useCart } from '../../cart/context/CartContext';
import { useOrders } from '../../orders/context/OrderContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaQrcode, FaMoneyBillWave, FaLock } from 'react-icons/fa';
import io from 'socket.io-client';
import StripePayment from '../components/StripePayment';
import PaymentLoader from '../../../shared/components/ui/PaymentLoader';
import UPIScannerModal from '../components/UPIScannerModal';
import './Checkout.css';

const Checkout = () => {
    const { cartTotal, clearCart, cartItems } = useCart();
    const { addOrder } = useOrders();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if this is a "Buy Now" direct purchase or a standard cart checkout
    const directBuyItem = location.state?.directBuy;
    const checkoutItems = directBuyItem ? [directBuyItem] : cartItems;
    const checkoutTotal = directBuyItem ? (directBuyItem.price * directBuyItem.quantity) : cartTotal;

    const [activeStep, setActiveStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: '',
        vpa: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentLoader, setShowPaymentLoader] = useState(false);
    const [showUPIScanner, setShowUPIScanner] = useState(false);
    const [livePaymentStatus, setLivePaymentStatus] = useState('idle');

    // Redirect if cart is empty and no direct buy item
    useEffect(() => {
        if (!directBuyItem && cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, directBuyItem, navigate]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        socket.on('payment_status', (payload) => {
            if (payload?.customerEmail && payload.customerEmail !== formData.email) return;
            setLivePaymentStatus(payload.status || 'idle');
        });
        return () => socket.disconnect();
    }, [formData.email]);

    const sendPaymentRealtimeStatus = async ({ paymentIntentId, status, metadata = {} }) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/payment/stripe/status-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentIntentId,
                    status,
                    amount: checkoutTotal,
                    currency: 'inr',
                    customerEmail: formData.email,
                    metadata,
                }),
            });
        } catch (err) {
            console.error('Failed to send realtime payment status:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.email && formData.address) {
            setActiveStep(2);
        } else {
            toast.error("Please fill in all address fields.");
        }
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (paymentMethod === 'upi' && !formData.vpa) {
            toast.error("Please enter your UPI ID.");
            return;
        }
        setActiveStep(3);
    };

    const processOrderCompletion = async (method, status, transactionId = null) => {
        setIsProcessing(true);
        const orderData = {
            customer: {
                name: formData.name,
                email: formData.email,
                address: formData.address
            },
            items: checkoutItems,
            total: checkoutTotal,
            paymentMethod: method,
            paymentStatus: status,
            ...(transactionId && { transactionId })
        };

        const orderId = await addOrder(orderData);
        const finalOrderId = orderId || `ORD-${Date.now()}`;

        setIsProcessing(false);
        if (!directBuyItem) {
            clearCart();
        }
        toast.success(`Order #${finalOrderId} placed successfully!`);
        navigate('/order-confirmation', { state: { order: { id: finalOrderId, status: 'success' } } });
    };

    const handlePaymentSuccess = async (paymentData) => {
        await processOrderCompletion('Stripe Card', 'Paid', paymentData.id);
    };

    const handleUPIPaymentInitiate = () => {
        setShowPaymentLoader(true);
    };

    const handleLoaderComplete = () => {
        setShowPaymentLoader(false);
        setShowUPIScanner(true);
    };

    const handleUPIConfirmed = async () => {
        setShowUPIScanner(false);
        const upiTxnId = 'UPI-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        await sendPaymentRealtimeStatus({
            paymentIntentId: upiTxnId,
            status: 'succeeded',
            metadata: { method: 'UPI' },
        });
        await processOrderCompletion('UPI', 'Paid', upiTxnId);
    };

    const handleFinalSubmit = () => {
        if (paymentMethod === 'card') {
            // Stripe payment is handled inside the component via elements
            // We just trigger a toast here if they clicked the wrong button
            toast.error("Please complete the card payment in the section below.");
            setActiveStep(2); // Go back to payment step
            return;
        }
        
        if (paymentMethod === 'upi') {
            handleUPIPaymentInitiate();
            return;
        }

        // Cash on Delivery
        setIsProcessing(true);
        setTimeout(async () => {
            await sendPaymentRealtimeStatus({
                paymentIntentId: `COD-${Date.now()}`,
                status: 'pending',
                metadata: { method: 'Cash on Delivery' },
            });
            await processOrderCompletion('Cash on Delivery', 'Pending');
        }, 2000);
    };

    return (
        <div className="amz-checkout-page">
            {/* Minimal Header */}
            <header className="amz-checkout-header">
                <div className="header-container">
                    <Link to="/" className="amz-logo">KHM Electronics</Link>
                    <h1 className="checkout-title">Checkout <span className="secure-text">(<FaLock /> Secure Checkout)</span></h1>
                </div>
            </header>

            <div className="amz-checkout-container">
                <div className="amz-checkout-grid">
                    
                    {/* LEFT COLUMN: Accordion Steps */}
                    <div className="amz-checkout-left">
                        
                        {/* Step 1: Address */}
                        <div className={`amz-step-container ${activeStep === 1 ? 'active' : ''}`}>
                            <div className="amz-step-header">
                                <h2>1. Delivery address</h2>
                                {activeStep > 1 && (
                                    <button className="amz-change-btn" onClick={() => setActiveStep(1)}>Change</button>
                                )}
                            </div>
                            
                            {activeStep === 1 ? (
                                <div className="amz-step-content">
                                    <form onSubmit={handleAddressSubmit} className="amz-address-form">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Street Address</label>
                                            <textarea name="address" required value={formData.address} onChange={handleChange} style={{ height: '80px', resize: 'vertical' }}></textarea>
                                        </div>
                                        <button type="submit" className="amz-btn-primary">Use this address</button>
                                    </form>
                                </div>
                            ) : (
                                <div className="amz-step-summary">
                                    <p><strong>{formData.name}</strong></p>
                                    <p>{formData.address}</p>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        <div className={`amz-step-container ${activeStep === 2 ? 'active' : ''}`}>
                            <div className="amz-step-header">
                                <h2>2. Payment method</h2>
                                {activeStep > 2 && (
                                    <button className="amz-change-btn" onClick={() => setActiveStep(2)}>Change</button>
                                )}
                            </div>
                            
                            {activeStep === 2 ? (
                                <div className="amz-step-content">
                                    <form onSubmit={handlePaymentSubmit}>
                                        <div className="amz-payment-options">
                                            <label className={`payment-radio-label ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                                <div className="payment-info">
                                                    <strong><FaCreditCard className="pay-icon" /> Credit or Debit Card</strong>
                                                    {paymentMethod === 'card' && (
                                                        <div className="stripe-wrapper mt-3">
                                                            <StripePayment
                                                                amount={checkoutTotal}
                                                                customerEmail={formData.email}
                                                                onPaymentSuccess={handlePaymentSuccess}
                                                                onRealtimeStatus={sendPaymentRealtimeStatus}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </label>

                                            <label className={`payment-radio-label ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                                                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                                                <div className="payment-info">
                                                    <strong><FaQrcode className="pay-icon" /> UPI / QR Code</strong>
                                                    {paymentMethod === 'upi' && (
                                                        <div className="upi-input-wrapper mt-2">
                                                            <input type="text" name="vpa" placeholder="Enter UPI ID (e.g., example@oksbi)" value={formData.vpa} onChange={handleChange} className="amz-input" />
                                                        </div>
                                                    )}
                                                </div>
                                            </label>

                                            <label className={`payment-radio-label ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                                <div className="payment-info">
                                                    <strong><FaMoneyBillWave className="pay-icon" /> Cash on Delivery</strong>
                                                    <p className="payment-subtext">Pay by cash or UPI on delivery.</p>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="amz-btn-wrapper mt-4">
                                            <button type="submit" className="amz-btn-primary">Use this payment method</button>
                                        </div>
                                    </form>
                                </div>
                            ) : activeStep > 2 ? (
                                <div className="amz-step-summary">
                                    <p><strong>{paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? `UPI (${formData.vpa})` : 'Cash on Delivery'}</strong></p>
                                </div>
                            ) : null}
                        </div>

                        {/* Step 3: Review */}
                        <div className={`amz-step-container ${activeStep === 3 ? 'active' : ''} last-step`}>
                            <div className="amz-step-header">
                                <h2>3. Review items and delivery</h2>
                            </div>
                            
                            {activeStep === 3 && (
                                <div className="amz-step-content review-content">
                                    <div className="review-box">
                                        <h3 className="delivery-date-green">Guaranteed delivery: 3 days from placing order</h3>
                                        <p className="dispatch-info">Items dispatched by KHM</p>
                                        
                                        <div className="review-items-list">
                                            {checkoutItems.map((item, index) => (
                                                <div key={index} className="review-item">
                                                    <img src={item.image} alt={item.name} className="review-item-img" />
                                                    <div className="review-item-details">
                                                        <h4>{item.name}</h4>
                                                        <p className="price">₹{item.price.toLocaleString('en-IN')}</p>
                                                        <p className="qty">Quantity: {item.quantity}</p>
                                                        <p className="sold-by">Sold by: Retail Net</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="place-order-box-inline">
                                        {livePaymentStatus !== 'idle' && (
                                            <p style={{ marginBottom: '8px', fontSize: '13px', color: '#555' }}>
                                                Live payment status: <strong>{livePaymentStatus}</strong>
                                            </p>
                                        )}
                                        <button className="amz-btn-primary-large" onClick={handleFinalSubmit} disabled={isProcessing}>
                                            {isProcessing ? 'Processing Order...' : 'Place your order'}
                                        </button>
                                        <div className="order-total-inline">
                                            <span>Order total:</span>
                                            <span className="amount">₹{checkoutTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Order Summary */}
                    <div className="amz-checkout-right">
                        <div className="amz-order-summary-box">
                            {livePaymentStatus !== 'idle' && (
                                <div style={{ marginBottom: '10px', padding: '8px', background: '#fef3c7', borderRadius: '6px', fontSize: '13px' }}>
                                    Payment status: <strong>{livePaymentStatus}</strong>
                                </div>
                            )}
                            <button 
                                className="amz-btn-primary-large block-btn" 
                                onClick={handleFinalSubmit} 
                                disabled={isProcessing || activeStep < 3}
                            >
                                {isProcessing ? 'Processing...' : 'Place your order'}
                            </button>
                            <p className="terms-text">By placing your order, you agree to KHM's <a href="#">privacy notice</a> and <a href="#">conditions of use</a>.</p>
                            
                            <hr className="summary-divider" />
                            
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Items:</span>
                                <span>₹{checkoutTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery:</span>
                                <span>--</span>
                            </div>
                            
                            <hr className="summary-divider" />
                            
                            <div className="summary-row total-row">
                                <span>Order Total:</span>
                                <span className="final-price">₹{checkoutTotal.toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="summary-footer-box">
                                <a href="#">How are delivery costs calculated?</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Payment Loader & Modals */}
            <PaymentLoader isVisible={showPaymentLoader} onComplete={handleLoaderComplete} />
            <UPIScannerModal
                isVisible={showUPIScanner}
                amount={checkoutTotal}
                onClose={() => setShowUPIScanner(false)}
                onPaymentComplete={handleUPIConfirmed}
            />
        </div>
    );
};

export default Checkout;
