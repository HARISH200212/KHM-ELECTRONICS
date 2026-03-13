import { useOrders } from '../../orders/context/OrderContext';
import { Link, useSearchParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import { downloadInvoice } from '../../../shared/utils/InvoiceGenerator';
import './Admin.css';

const AdminOrders = () => {
    const { orders, updateOrderStatus } = useOrders();
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');

    const filteredOrders = orders.filter((order) => {
        if (statusFilter === 'pending-processing') {
            return ['Pending', 'Processing'].includes(order.status);
        }
        if (statusFilter) {
            return (order.status || '').toLowerCase() === statusFilter.toLowerCase();
        }
        return true;
    });

    const handleDownloadInvoice = (order) => {
        if (order.invoiceNumber) {
            downloadInvoice(order, order.invoiceNumber);
        }
    };

    return (
        <div>
            <header className="admin-header">
                <h1>Orders</h1>
            </header>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.invoiceNumber || 'N/A'}</td>
                            <td>{new Date(order.date || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td>{order.customer?.name || 'N/A'}</td>
                            <td>₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</td>
                            <td>{order.paymentMethod}</td>
                            <td>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="admin-status-dropdown"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Delivering">Delivering</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link to={`/admin/orders/${order.id}`} className="action-btn edit">View</Link>
                                    {order.invoiceNumber && (
                                        <button
                                            onClick={() => handleDownloadInvoice(order)}
                                            className="action-btn"
                                            style={{ background: '#4338ca', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            title="Download Invoice"
                                        >
                                            <FaDownload /> Invoice
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center' }}>No orders found for this filter</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrders;
