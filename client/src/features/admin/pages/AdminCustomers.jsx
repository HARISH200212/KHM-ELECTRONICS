import { useOrders } from '../../orders/context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEye } from 'react-icons/fa';

const AdminCustomers = () => {
    const { orders } = useOrders();
    const navigate = useNavigate();

    // Derive unique customers from orders
    const customersMap = {};
    orders.forEach(order => {
        const email = order.customer.email;
        if (!customersMap[email]) {
            customersMap[email] = {
                name: order.customer.name,
                email: email,
                address: order.customer.address,
                totalOrders: 0,
                totalSpent: 0,
                lastOrder: order.date
            };
        }
        customersMap[email].totalOrders += 1;
        customersMap[email].totalSpent += order.total;
        if (new Date(order.date) > new Date(customersMap[email].lastOrder)) {
            customersMap[email].lastOrder = order.date;
        }
    });

    const customers = Object.values(customersMap);

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Customers</h1>
                <div className="header-actions">
                    <span className="badge">{customers.length} Total Users</span>
                </div>
            </header>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Orders</th>
                            <th>Total Spent</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((cust, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="avatar-placeholder" style={{ background: '#333', padding: '8px', borderRadius: '50%' }}>
                                            <FaUser color="#fff" />
                                        </div>
                                        {cust.name}
                                    </div>
                                </td>
                                <td>{cust.email}</td>
                                <td>{cust.totalOrders}</td>
                                <td>₹{cust.totalSpent.toLocaleString('en-IN')}</td>
                                <td>{new Date(cust.lastOrder).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="action-btn view"
                                        title="View Profile"
                                        onClick={() => navigate(`/admin/customers/${encodeURIComponent(cust.email)}`)}
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No customers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCustomers;
