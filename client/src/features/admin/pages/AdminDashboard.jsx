import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaSearch, FaBell, FaUserCircle,
    FaMoneyBillWave, FaShoppingCart, FaBoxOpen, FaWarehouse,
    FaArrowUp, FaArrowDown, FaCube, FaPlusCircle, FaUsers, FaCog, FaClock,
    FaDownload, FaFilePdf, FaArrowLeft
} from 'react-icons/fa';
import { useProducts } from '../../products/context/ProductContext';
import { useOrders } from '../../orders/context/OrderContext';
import OrderGraph from '../components/OrderGraph';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import io from 'socket.io-client';
import { API_BASE_URL } from '../../../shared/constants/api';
import './Admin.css';

const AdminDashboard = () => {
    const { products } = useProducts();
    const { orders } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('month');
    const [paymentEvents, setPaymentEvents] = useState([]);

    useEffect(() => {
        const socket = io(API_BASE_URL);
        socket.on('payment_status', (payload) => {
            setPaymentEvents((prev) => [payload, ...prev].slice(0, 8));
        });
        return () => socket.disconnect();
    }, []);

    const isWithinRange = (dateValue) => {
        if (!dateValue) return false;
        const orderDate = new Date(dateValue);
        const now = new Date();
        const start = new Date(now);

        if (dateRange === 'today') {
            start.setHours(0, 0, 0, 0);
            return orderDate >= start;
        }
        if (dateRange === 'week') {
            start.setDate(now.getDate() - 7);
            return orderDate >= start;
        }
        if (dateRange === 'month') {
            start.setMonth(now.getMonth() - 1);
            return orderDate >= start;
        }
        if (dateRange === 'year') {
            start.setFullYear(now.getFullYear() - 1);
            return orderDate >= start;
        }
        return true;
    };

    const filteredOrdersByDate = useMemo(() => {
        return orders.filter(o => isWithinRange(o.date || o.createdAt));
    }, [orders, dateRange]);

    const totalRevenue = useMemo(() => filteredOrdersByDate.reduce((s, o) => s + (o.total || o.totalAmount || 0), 0), [filteredOrdersByDate]);
    const liveStock = useMemo(() => products.reduce((s, p) => s + (p.stock || 0), 0), [products]);
    const pendingOrders = useMemo(() => filteredOrdersByDate.filter(o => ['Pending', 'Processing'].includes(o.status)).length, [filteredOrdersByDate]);
    const lowStockProducts = useMemo(() => products.filter(p => (p.stock || 0) <= 5).length, [products]);

    // Simple aggregate for category stock
    const categoryStock = useMemo(() => {
        const counts = {};
        products.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + (p.stock || 0);
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [products]);

    // Graph Data
    const chartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        }).reverse();

        return last7Days.map(day => ({
            name: day,
            orders: filteredOrdersByDate.filter(o => new Date(o.date || o.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === day).length
        }));
    }, [filteredOrdersByDate]);

    const quickActions = [
        { to: '/admin/orders', icon: <FaShoppingCart />, label: 'Manage Orders', note: 'View, update status, invoice' },
        { to: '/admin/products', icon: <FaBoxOpen />, label: 'Manage Products', note: 'Edit stock, pricing, catalog' },
        { to: '/admin/products/add', icon: <FaPlusCircle />, label: 'Add Product', note: 'Create new listing' },
        { to: '/admin/customers', icon: <FaUsers />, label: 'Customers', note: 'Browse and inspect users' },
        { to: '/admin/profile', icon: <FaCog />, label: 'Admin Profile', note: 'Open and manage any admin profile' },
    ];

    const filteredRecentOrders = useMemo(() => {
        if (!searchQuery.trim()) return filteredOrdersByDate.slice(0, 8);
        const q = searchQuery.toLowerCase();
        return filteredOrdersByDate
            .filter(order =>
                (order.id || '').toLowerCase().includes(q)
                || (order.customer?.name || '').toLowerCase().includes(q)
                || (order.status || '').toLowerCase().includes(q)
            )
            .slice(0, 8);
    }, [filteredOrdersByDate, searchQuery]);

    const exportCsv = () => {
        const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Total'];
        const rows = filteredOrdersByDate.map(order => [
            order.id || '',
            new Date(order.date || order.createdAt).toLocaleDateString('en-IN'),
            order.customer?.name || 'N/A',
            order.status || 'N/A',
            String(order.total || order.totalAmount || 0),
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map(col => `"${String(col).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-orders-${dateRange}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Admin Dashboard Report', 14, 18);
        doc.setFontSize(11);
        doc.text(`Range: ${dateRange.toUpperCase()}`, 14, 26);
        doc.text(`Total Revenue: INR ${totalRevenue.toLocaleString('en-IN')}`, 14, 34);
        doc.text(`Total Orders: ${filteredOrdersByDate.length}`, 14, 42);
        doc.text(`Pending/Processing: ${pendingOrders}`, 14, 50);
        doc.text(`Live Stock: ${liveStock}`, 14, 58);
        doc.text(`Low Stock Products: ${lowStockProducts}`, 14, 66);

        autoTable(doc, {
            startY: 74,
            head: [['Order ID', 'Date', 'Customer', 'Status', 'Total']],
            body: filteredOrdersByDate.slice(0, 20).map(order => [
                order.id || 'N/A',
                new Date(order.date || order.createdAt).toLocaleDateString('en-IN'),
                order.customer?.name || 'N/A',
                order.status || 'N/A',
                `INR ${(order.total || order.totalAmount || 0).toLocaleString('en-IN')}`,
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
        });

        doc.save(`dashboard-report-${dateRange}.pdf`);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Top Header */}
            <header className="admin-header-modern">
                <div className="header-left-group">
                    <Link to="/" className="admin-home-back" aria-label="Back to homepage">
                        <FaArrowLeft />
                        <span>Home</span>
                    </Link>
                    <div className="header-search">
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Type to search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-modern btn-modern-outline" style={{ border: 'none', padding: '0.5rem' }}>
                        <FaBell style={{ fontSize: '1.25rem', color: 'var(--admin-text-muted)' }} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, background: 'linear-gradient(135deg, #d4af37, #f0cc55)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Administrator</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Super Admin</div>
                        </div>
                        <FaUserCircle style={{ fontSize: '2.5rem', color: 'var(--admin-primary)', filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.5))' }} />
                    </div>
                </div>
            </header>

            {/* Main Scrollable Content */}
            <div className="admin-main-modern">
                <div className="admin-toolbar">
                    <div className="admin-filter-group">
                        <label htmlFor="range">Date Range</label>
                        <select id="range" className="admin-status-dropdown" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="year">Last 12 Months</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div className="admin-export-actions">
                        <button className="btn-modern btn-modern-outline" onClick={exportCsv}><FaDownload /> Export CSV</button>
                        <button className="btn-modern btn-modern-primary" onClick={exportPdf}><FaFilePdf /> Export PDF</button>
                    </div>
                </div>
                
                <div className="stats-grid-modern">
                    {/* Revenue Card */}
                    <Link to="/admin/orders" className="stat-card-link">
                    <div className="modern-card stat-card-modern">
                        <div className="stat-card-header">
                            <div className="stat-icon-wrapper primary"><FaMoneyBillWave /></div>
                            <span className="stat-trend up"><FaArrowUp /> 4.3%</span>
                        </div>
                        <div>
                            <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
                            <div className="stat-label">Total Revenue</div>
                        </div>
                    </div>
                    </Link>

                    {/* Orders Card */}
                    <Link to="/admin/orders" className="stat-card-link">
                    <div className="modern-card stat-card-modern">
                        <div className="stat-card-header">
                            <div className="stat-icon-wrapper success"><FaShoppingCart /></div>
                            <span className="stat-trend up"><FaArrowUp /> 12.5%</span>
                        </div>
                        <div>
                            <div className="stat-value">{filteredOrdersByDate.length}</div>
                            <div className="stat-label">Total Orders</div>
                        </div>
                    </div>
                    </Link>

                    {/* Products Card */}
                    <Link to="/admin/products" className="stat-card-link">
                    <div className="modern-card stat-card-modern">
                        <div className="stat-card-header">
                            <div className="stat-icon-wrapper warning"><FaBoxOpen /></div>
                            <span className="stat-trend down"><FaArrowDown /> 1.2%</span>
                        </div>
                        <div>
                            <div className="stat-value">{products.length}</div>
                            <div className="stat-label">Total Products</div>
                        </div>
                    </div>
                    </Link>

                    {/* Live Stock Card */}
                    <Link to="/admin/products?stock=live" className="stat-card-link">
                    <div className="modern-card stat-card-modern">
                        <div className="stat-card-header">
                            <div className="stat-icon-wrapper danger"><FaWarehouse /></div>
                            <span className="stat-trend down"><FaArrowDown /> 8.0%</span>
                        </div>
                        <div>
                            <div className="stat-value">{liveStock}</div>
                            <div className="stat-label">Live Inventory Stock</div>
                        </div>
                    </div>
                    </Link>
                </div>

                <div className="dashboard-grid-modern">
                    <div className="modern-card">
                        <h3 className="card-title">Order Analytics</h3>
                        <OrderGraph data={chartData} />
                    </div>

                    <div className="modern-card">
                        <h3 className="card-title">Stock by Category</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {categoryStock.slice(0, 6).map(([cat, stock]) => (
                                <Link to={`/admin/products?category=${encodeURIComponent(cat)}`} key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--admin-border)', textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: 'var(--admin-bg)', borderRadius: '8px', color: 'var(--admin-primary)' }}>
                                            <FaCube />
                                        </div>
                                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{cat}</span>
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--admin-text-main)' }}>{stock}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modern-card" style={{ marginBottom: '2rem' }}>
                    <h3 className="card-title">Quick Access</h3>
                    <div className="admin-quick-grid">
                        {quickActions.map((action) => (
                            <Link key={action.to} to={action.to} className="admin-quick-link">
                                <span className="admin-quick-icon">{action.icon}</span>
                                <span>
                                    <strong>{action.label}</strong>
                                    <small>{action.note}</small>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="stats-grid-modern" style={{ marginBottom: '2rem' }}>
                    <Link to="/admin/orders?status=pending-processing" className="stat-card-link">
                    <div className="modern-card stat-card-modern">
                        <div className="stat-card-header">
                            <div className="stat-icon-wrapper warning"><FaClock /></div>
                            <span className="stat-trend up"><FaArrowUp /> Live</span>
                        </div>
                        <div>
                            <div className="stat-value">{pendingOrders}</div>
                            <div className="stat-label">Pending / Processing Orders</div>
                        </div>
                    </div>
                    </Link>

                    <Link to="/admin/products?stock=low" className="stat-card-link">
                    <div className="modern-card stat-card-modern">
                        <div className="stat-card-header">
                            <div className="stat-icon-wrapper danger"><FaWarehouse /></div>
                            <span className="stat-trend down"><FaArrowDown /> Alert</span>
                        </div>
                        <div>
                            <div className="stat-value">{lowStockProducts}</div>
                            <div className="stat-label">Low Stock Products ({'<='}5)</div>
                        </div>
                    </div>
                    </Link>
                </div>

                <div className="modern-card">
                    <h3 className="card-title">Recent Orders</h3>
                    <div className="table-container">
                        <table className="modern-data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecentOrders.map(order => (
                                    <tr key={order.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>#{(order.id || '').slice(-6).toUpperCase()}</td>
                                    <td>{new Date(order.date || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 500 }}>{order.customer?.name || 'N/A'}</td>
                                    <td style={{ fontWeight: 600 }}>₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`badge badge-${
                                                order.status === 'Delivered' ? 'success' : 
                                                order.status === 'Cancelled' ? 'danger' : 
                                                order.status === 'Pending' ? 'warning' : 'primary'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRecentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)' }}>No matching orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="modern-card" style={{ marginTop: '2rem' }}>
                    <h3 className="card-title">Live Payment Gateway Activity</h3>
                    {paymentEvents.length === 0 ? (
                        <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>No payment events yet. Activity will appear here in real time.</p>
                    ) : (
                        <div className="table-container">
                            <table className="modern-data-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Payment ID</th>
                                        <th>Status</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentEvents.map((evt, idx) => (
                                        <tr key={`${evt.paymentIntentId}-${idx}`}>
                                            <td>{new Date(evt.timestamp || Date.now()).toLocaleTimeString()}</td>
                                            <td style={{ fontWeight: 600 }}>{evt.paymentIntentId || 'N/A'}</td>
                                            <td>
                                                <span className={`badge badge-${
                                                    evt.status === 'succeeded' ? 'success' :
                                                    evt.status === 'failed' ? 'danger' :
                                                    evt.status === 'pending' ? 'warning' : 'primary'
                                                }`}>
                                                    {evt.status || 'unknown'}
                                                </span>
                                            </td>
                                            <td>{evt.customerEmail || 'Guest'}</td>
                                            <td>₹{Number(evt.amount || 0).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
