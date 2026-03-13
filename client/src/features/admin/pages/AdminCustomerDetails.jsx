import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../orders/context/OrderContext';
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaShoppingBag } from 'react-icons/fa';

const AdminCustomerDetails = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const { orders } = useOrders();
    const decodedEmail = decodeURIComponent(email);

    const customerOrders = orders.filter(o => o.customer.email === decodedEmail);

    if (customerOrders.length === 0) {
        return <div className="admin-page">Customer not found.</div>;
    }

    // Get latest customer info
    const customer = customerOrders[0].customer;
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);

    return (
        <div className="admin-page">
            <button className="btn-text" onClick={() => navigate('/admin/customers')} style={{ marginBottom: '1rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaArrowLeft /> Back to Customers
            </button>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${customer.name}&background=random&size=128`}
                        alt={customer.name}
                        style={{ borderRadius: '50%', border: '4px solid var(--primary-color)' }}
                    />
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>{customer.name}</h1>
                        <div style={{ display: 'flex', gap: '1.5rem', color: '#ccc' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaEnvelope /> {decodedEmail}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaMapMarkerAlt /> {customer.address}
                            </span>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Total Spent</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            ₹{totalSpent.toLocaleString('en-IN')}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className="badge">{customerOrders.length} Orders</span>
                        </div>
                    </div>
                </div>
            </div>

            <h2>Order History</h2>
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customerOrders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{new Date(order.date).toLocaleDateString()}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                        background: order.status === 'Delivered' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                        color: order.status === 'Delivered' ? '#4caf50' : '#ffc107'
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{order.items.length} Items</td>
                                <td>₹{order.total.toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCustomerDetails;
