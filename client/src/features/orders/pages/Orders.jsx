import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../../orders/context/OrderContext';
import { useAuth } from '../../auth/context/AuthContext';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { generateInvoicePDF } from '../../../shared/utils/pdfGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../products/context/ProductContext';
import Invoice from '../components/Invoice';
import { toast } from 'react-hot-toast';
import { FaTruckMoving } from 'react-icons/fa';
import { useCart } from '../../cart/context/CartContext';
import './Orders.css';

const Orders = () => {
    const { orders, updateOrderStatus } = useOrders();
    const { products } = useProducts();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const [searchQuery, setSearchQuery] = useState('');
    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const [reviewModal, setReviewModal] = useState(null); // { order, item }
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [cancellingOrder, setCancellingOrder] = useState(null); // order object
    const [cancelReason, setCancelReason] = useState('');
    const [archivedIds, setArchivedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('kh_archived_orders') || '[]'); }
        catch { return []; }
    });

    const handleShareGiftReceipt = (order) => {
        const link = `${window.location.origin}/orders?ref=${order.id || order._id}`;
        navigator.clipboard.writeText(link).then(() => {
            toast.success('Gift receipt link copied to clipboard!');
        }).catch(() => {
            toast.error('Could not copy link. Please try again.');
        });
    };

    const handleArchiveOrder = (orderId) => {
        const updated = [...archivedIds, orderId];
        setArchivedIds(updated);
        localStorage.setItem('kh_archived_orders', JSON.stringify(updated));
        toast.success('Order archived.');
    };

    const handleUnarchiveOrder = (orderId) => {
        const updated = archivedIds.filter(id => id !== orderId);
        setArchivedIds(updated);
        localStorage.setItem('kh_archived_orders', JSON.stringify(updated));
        toast.success('Order restored.');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewData.comment.trim()) return toast.error('Please write a comment.');
        try {
            const productId = reviewModal.item.productId || reviewModal.item.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rating: reviewData.rating, comment: reviewData.comment, user: user?.name || 'Customer' })
            });
            if (res.ok) {
                toast.success('Review submitted! Thank you.');
                setReviewModal(null);
                setReviewData({ rating: 5, comment: '' });
            } else {
                toast.error('Failed to submit review.');
            }
        } catch {
            toast.error('Could not connect to server.');
        }
    };

    // Filter orders for the current user
    const userOrders = orders.filter(o => o.customer?.email === user?.email);

    const handleDownloadInvoice = (order) => {
        generateInvoicePDF(order);
    };

    const handleViewInvoice = (order) => {
        setSelectedInvoice(order);
    };

    const handleReturnOrder = (orderId) => {
        const confirmReturn = window.confirm("Are you sure you want to request a return for this order?");
        if (confirmReturn) {
            updateOrderStatus(orderId, "Return Requested");
            toast.success("Return request sent successfully!");
        }
    };

    const handleCancelOrder = (order) => {
        setCancellingOrder(order);
        setCancelReason(''); // reset
    };

    const handleConfirmCancel = () => {
        if (!cancelReason) return toast.error("Please select a reason for cancellation.");
        updateOrderStatus(cancellingOrder.id || cancellingOrder._id, "Cancelled", cancelReason);
        setCancellingOrder(null);
        toast.success("Order cancelled successfully.");
    };

    const filteredOrders = userOrders.filter(order => {
        const id = order.id || order._id;
        if (activeTab === 'archived') return archivedIds.includes(id);
        if (archivedIds.includes(id)) return false; // hide archived from other tabs
        if (activeTab === 'not-shipped') return ['Pending', 'Processing'].includes(order.status);
        if (activeTab === 'cancelled') return order.status === 'Cancelled';
        return true;
    }).filter(order => {
        if (!searchQuery) return true;
        return order.items.some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
               (order.id || order._id || '').toString().includes(searchQuery);
    });

    return (
        <div className="amz-orders-page">
            <div className="amz-orders-container">
                 {/* Breadcrumb */}
                 <nav className="amz-orders-breadcrumb">
                    <Link to="/account">Your Account</Link>
                    <span className="separator">›</span>
                    <span className="current">Your Orders</span>
                </nav>

                <div className="orders-header-row">
                    <h1 className="amz-page-title">Your Orders</h1>
                    <div className="orders-searchbar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search all orders" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="search-btn">Search Orders</button>
                    </div>
                </div>

                <div className="amz-orders-tabs">
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
                    <button className={activeTab === 'not-shipped' ? 'active' : ''} onClick={() => setActiveTab('not-shipped')}>Not Yet Shipped</button>
                    <button className={activeTab === 'cancelled' ? 'active' : ''} onClick={() => setActiveTab('cancelled')}>Cancelled Orders</button>
                    <button className={activeTab === 'archived' ? 'active' : ''} onClick={() => setActiveTab('archived')}>Archived</button>
                </div>

                <div className="orders-filter-row">
                    <span className="order-count"><strong>{filteredOrders.length} orders</strong> placed in</span>
                    <select className="date-filter-dropdown" defaultValue="3months">
                        <option value="30days">past 30 days</option>
                        <option value="3months">past 3 months</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                    </select>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="amz-empty-state">
                        <p>Looks like you haven't placed any orders in this category.</p>
                        <button className="amz-btn" onClick={() => navigate('/shop')}>Continue Shopping</button>
                    </div>
                ) : (
                    <div className="amz-orders-list">
                        {filteredOrders.map(order => {
                            const isDelivered = order.status === 'Delivered';
                            const statuses = ["Pending", "Processing", "Shipped", "In Transit", "Delivering", "Delivered", "Return Requested", "Returned"];
                            const currentIdx = Math.max(0, statuses.indexOf(order.status));
                            
                            // Support both order.date (local) and order.createdAt (MongoDB)
                            const rawDate = order.date || order.createdAt;
                            const orderDate = rawDate ? new Date(rawDate) : new Date();
                            const arrivalDate = new Date(orderDate);
                            
                            let deliveryDays = 4; // default
                            const address = order.customer?.address || '';
                            const addressLower = address.toLowerCase();
                            
                            // Mocking location-based delivery logic
                            if (addressLower.includes('bangalore') || addressLower.includes('bengaluru')) {
                                deliveryDays = 1; // Faster for local
                            } else if (addressLower.includes('chennai') || addressLower.includes('mumbai') || addressLower.includes('hyderabad')) {
                                deliveryDays = 2; // Medium for metro
                            } else if (addressLower.includes('delhi') || addressLower.includes('kolkata')) {
                                deliveryDays = 3; 
                            }
                            
                            arrivalDate.setDate(orderDate.getDate() + deliveryDays);
                            
                            // Mocking location-dependent messages for tracking
                            const city = address.split(',')[0] || 'your location';
                            const getLocationMessage = (currentStatus) => {
                                switch (currentStatus) {
                                    case 'Pending': return `Order placed. Preparing for dispatch to ${city}.`;
                                    case 'Processing': return `Package is being packed for shipment to ${city}.`;
                                    case 'Shipped': return `Package left the fulfillment center. On its way to ${city}.`;
                                    case 'In Transit': return `Package arrived at a carrier facility near ${city}.`;
                                    case 'Delivering': return `Package is out for delivery in ${city} today.`;
                                    case 'Delivered': return `Delivered safely to ${address || city}.`;
                                    case 'Return Requested': return `Return instructions have been sent to your email.`;
                                    default: return `Status: ${currentStatus}`;
                                }
                            };
                            
                            const trackingMessage = getLocationMessage(order.status);

                            return (
                                <div key={order.id} className="amz-order-card">
                                    {/* Order Card Header */}
                                    <div className="amz-card-header">
                                        <div className="header-left">
                                            <div className="header-col">
                                                <span className="label">ORDER PLACED</span>
                                                <span className="value">{orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="header-col">
                                                <span className="label">TOTAL</span>
                                                <span className="value">₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="header-col">
                                                <span className="label">SHIP TO</span>
                                                <span className="value amz-link">{order.customer?.name || user?.name || 'Customer'}</span>
                                            </div>
                                        </div>
                                        <div className="header-right">
                                            <div className="header-col align-right">
                                                <span className="label">ORDER # {order.id}</span>
                                                <div className="header-links">
                                                    <a href="#" className="amz-link" onClick={(e) => { e.preventDefault(); handleViewInvoice(order); }}>View order details</a>
                                                    <span className="separator">|</span>
                                                    <a href="#" className="amz-link" onClick={(e) => { e.preventDefault(); handleDownloadInvoice(order); }}>Invoice</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Card Body */}
                                    <div className="amz-card-body">
                                        <div className="order-delivery-status">
                                            <h3>{isDelivered ? 'Delivered ' + arrivalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Arriving ' + arrivalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}</h3>
                                            <p className="status-subtext">{isDelivered ? 'Package was handed directly to resident.' : trackingMessage}</p>
                                        </div>

                                        {trackingOrderId === order.id && (
                                            <div className="amz-tracking-timeline-container">
                                                <h4>Tracking Details for {city}</h4>
                                                <p style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--amazon-text-muted)' }}>
                                                    <strong>Latest Update:</strong> {trackingMessage}
                                                </p>
                                                <div className="tracking-timeline">
                                                    {statuses.map((s, index) => {
                                                        const isCompleted = index <= currentIdx;
                                                        const isCurrent = index === currentIdx;
                                                        return (
                                                            <div key={s} className={`tracking-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                                                <div className="step-marker"></div>
                                                                <span className="step-label">{s}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--amazon-text-muted)' }}>
                                                    Delivery estimate based on your location: <strong>{address || 'Not provided'}</strong>
                                                </p>

                                                {/* Animated Live Location Map */}
                                                {!isDelivered && (
                                                    <div className="animated-map-container">
                                                        <div className="map-route"></div>
                                                        <div className="map-marker-start"></div>
                                                        <div className="map-marker-end"></div>
                                                        <div className="animated-truck">
                                                            <FaTruckMoving />
                                                        </div>
                                                        <span style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px', color: '#666', fontWeight: 'bold' }}>
                                                            Live GPS Active
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {/* Cancel Button in Tracking View */}
                                                {(order.status === 'Pending' || order.status === 'Processing') && (
                                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #333' }}>
                                                        <p style={{ fontSize: '12px', color: '#ff4444', marginBottom: '8px' }}>Change your mind? You can still cancel this order.</p>
                                                        <button 
                                                            className="amz-btn-small" 
                                                            style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444' }}
                                                            onClick={() => handleCancelOrder(order)}
                                                        >
                                                            Cancel this order
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="order-items-grid">
                                            <div className="items-list-col">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="amz-purchased-item">
                                                        <div className="item-img-container">
                                                            <img
                                                                src={item.image || products.find(p => p.id === (item.productId || item.id))?.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=150'}
                                                                alt={item.name || 'Product'}
                                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=150'; }}
                                                            />
                                                        </div>
                                                        <div className="item-info">
                                                            <Link to={`/product/${item.productId || item.id}`} className="amz-item-title">{item.name}</Link>
                                                            <p className="item-return-window">Return window closed on {new Date(arrivalDate.getTime() + 7*24*60*60*1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                            <div className="item-inline-actions">
                                                                <button className="amz-btn-small" onClick={() => {
                                                                    const product = products.find(p => p.id === (item.productId || item.id)) || item;
                                                                    addToCart({ ...product, id: item.productId || item.id });
                                                                    toast.success("Added to cart!");
                                                                }}>Buy it again</button>
                                                                <button className="amz-btn-small" onClick={() => navigate(`/product/${item.productId || item.id}`)}>View your item</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="order-actions-col">
                                                <button 
                                                    className="amz-action-btn track-btn" 
                                                    onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                                                >
                                                    {trackingOrderId === order.id ? 'Hide tracking' : 'Track package'}
                                                </button>
                                                {isDelivered && (
                                                    <button className="amz-action-btn" onClick={() => handleReturnOrder(order.id)}>Return or replace items</button>
                                                )}
                                                <button className="amz-action-btn" onClick={() => handleShareGiftReceipt(order)}>Share gift receipt</button>
                                                {(order.status === 'Pending' || order.status === 'Processing') && (
                                                    <button 
                                                        className="amz-action-btn" 
                                                        style={{ color: '#ff4444', borderColor: '#ff4444' }}
                                                        onClick={() => handleCancelOrder(order)}
                                                    >
                                                        Cancel order
                                                    </button>
                                                )}
                                                <button className="amz-action-btn" onClick={() => setReviewModal({ order, item: order.items[0] })}>Write a product review</button>
                                                <button className="amz-action-btn" onClick={() => handleArchiveOrder(order.id || order._id)}>Archive order</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Invoice Modal */}
                <AnimatePresence>
                    {selectedInvoice && (
                        <div className="amz-modal-overlay" onClick={() => setSelectedInvoice(null)}>
                            <div className="amz-modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="amz-modal-close" onClick={() => setSelectedInvoice(null)}>×</button>
                                <Invoice
                                    order={selectedInvoice}
                                    invoiceNumber={selectedInvoice.invoiceNumber}
                                    onClose={() => setSelectedInvoice(null)}
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Write Review Modal */}
                {reviewModal && (
                    <div className="amz-modal-overlay" onClick={() => setReviewModal(null)}>
                        <div className="amz-modal-content" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                            <button className="amz-modal-close" onClick={() => setReviewModal(null)}>×</button>
                            <h3 style={{ marginBottom: '0.5rem', color: '#e0e0e0' }}>Write a Review</h3>
                            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '1rem' }}>
                                {reviewModal.item?.name || reviewModal.item?.product?.name || 'Product'}
                            </p>
                            <form onSubmit={handleReviewSubmit}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                    {[1,2,3,4,5].map(star => (
                                        <span
                                            key={star}
                                            onClick={() => setReviewData(r => ({ ...r, rating: star }))}
                                            style={{ fontSize: '2rem', cursor: 'pointer',
                                                color: star <= reviewData.rating ? 'var(--amazon-orange)' : '#555' }}
                                        >★</span>
                                    ))}
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder="Share your experience with this product..."
                                    value={reviewData.comment}
                                    onChange={e => setReviewData(r => ({ ...r, comment: e.target.value }))}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', boxSizing: 'border-box',
                                        background: '#1a1a1a', color: '#e0e0e0', border: '1px solid #444',
                                        fontSize: '14px', resize: 'vertical' }}
                                />
                                <button type="submit" className="amz-btn" style={{ marginTop: '1rem', width: '100%', padding: '10px' }}>
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Cancellation Reason Modal */}
                {cancellingOrder && (
                    <div className="amz-modal-overlay" onClick={() => setCancellingOrder(null)}>
                        <div className="amz-modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
                            <button className="amz-modal-close" onClick={() => setCancellingOrder(null)}>×</button>
                            <h3 style={{ marginBottom: '1rem', color: '#e0e0e0' }}>Cancel Order</h3>
                            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '1.5rem' }}>
                                Please select a reason for cancelling this order:
                            </p>
                            
                            <div className="cancellation-reasons" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                                {[
                                    "Order created by mistake",
                                    "Item(s) would not arrive on time",
                                    "Shipping cost is too high",
                                    "Found a cheaper price elsewhere",
                                    "Need to change shipping address",
                                    "Need to change payment method",
                                    "Other / prefer not to say"
                                ].map(reason => (
                                    <label key={reason} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px', 
                                        padding: '12px', 
                                        background: cancelReason === reason ? '#222' : '#1a1a1a',
                                        border: `1px solid ${cancelReason === reason ? 'var(--amazon-orange)' : '#333'}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        color: '#e0e0e0',
                                        fontSize: '14px'
                                    }}>
                                        <input 
                                            type="radio" 
                                            name="cancelReason" 
                                            value={reason} 
                                            checked={cancelReason === reason}
                                            onChange={() => setCancelReason(reason)}
                                            style={{ accentColor: 'var(--amazon-orange)' }}
                                        />
                                        {reason}
                                    </label>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    className="amz-btn" 
                                    style={{ flex: 1, background: '#333' }}
                                    onClick={() => setCancellingOrder(null)}
                                >
                                    Go Back
                                </button>
                                <button 
                                    className="amz-btn" 
                                    style={{ flex: 1, background: '#ff4444' }}
                                    onClick={handleConfirmCancel}
                                    disabled={!cancelReason}
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;

