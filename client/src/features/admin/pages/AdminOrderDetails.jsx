import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../../orders/context/OrderContext';
import { useState, useEffect } from 'react';
import './Admin.css';

const TRACKING_STEPS = [
    "Pending",
    "Processing",
    "Shipped",
    "In Transit",
    "Delivering",
    "Delivered"
];

const AdminOrderDetails = () => {
    const { id } = useParams();
    const { orders, updateOrderStatus } = useOrders();
    const order = orders.find(o => o.id === id);

    // Local state to track visual updates and trigger effects
    const [liveStatus, setLiveStatus] = useState('');
    const [justUpdated, setJustUpdated] = useState(false);

    useEffect(() => {
        if (order) {
            setLiveStatus(order.status || "Pending");

            // Trigger a quick pulse animation when order changes remotely or locally
            setJustUpdated(true);
            const timer = setTimeout(() => setJustUpdated(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [order?.status]);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setLiveStatus(newStatus); // Optimistic UI update
        updateOrderStatus(id, newStatus);
    };

    if (!order) return <div className="admin-content">Order not found</div>;

    const currentStepIndex = TRACKING_STEPS.indexOf(liveStatus);

    return (
        <div>
            <header className="admin-header">
                <h1>Order Details: {order.id}</h1>
                <Link to="/admin/orders" className="btn btn-secondary">Back</Link>
            </header>

            <div className="admin-form" style={{ maxWidth: '100%' }}>
                <div className="details-grid">
                    <div>
                        <h3>Customer Info</h3>
                        <p><strong>Name:</strong> {order.customer.name}</p>
                        <p><strong>Email:</strong> {order.customer.email}</p>
                        <p><strong>Address:</strong> {order.customer.address}</p>
                        <Link
                            to={`/admin/customers/${encodeURIComponent(order.customer.email)}`}
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: '10px', display: 'inline-block' }}
                        >
                            View Customer Details
                        </Link>
                    </div>
                    <div>
                        <h3>Payment & Status Info</h3>
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Total:</strong> ₹{order.total.toLocaleString('en-IN')}</p>

                        <div className="status-manager" style={{ marginTop: '12px' }}>
                            <label htmlFor="status-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Manage Order Status:</label>
                            <select
                                id="status-select"
                                value={liveStatus}
                                onChange={handleStatusChange}
                                className="admin-status-dropdown"
                            >
                                {TRACKING_STEPS.map(step => (
                                    <option key={step} value={step}>{step}</option>
                                ))}
                            </select>
                            {justUpdated && <span className="status-updated-toast">Status Updated!</span>}
                        </div>
                    </div>
                </div>

                {/* Real-time Visual Tracking System */}
                <div className="live-tracking-container">
                    <h3>Live Tracking Dashboard</h3>
                    <div className="tracking-timeline">
                        {TRACKING_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isActive = index === currentStepIndex;

                            return (
                                <div key={step} className={`tracking-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active-pulse' : ''}`}>
                                    <div className="step-circle">
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <div className="step-label">{step}</div>
                                    {index < TRACKING_STEPS.length - 1 && (
                                        <div className="step-connector"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <h3 style={{ marginTop: '2rem' }}>Items</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.price.toLocaleString('en-IN')}</td>
                                <td>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
