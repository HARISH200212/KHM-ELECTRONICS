import { NavLink, useNavigate } from 'react-router-dom';
import { 
    FaChartPie, 
    FaShoppingCart, 
    FaBoxOpen, 
    FaUsers, 
    FaCog, 
    FaSignOutAlt 
} from 'react-icons/fa';

const AdminSidebar = ({ onLogout }) => {
    return (
        <aside className="admin-sidebar-modern">
            <div className="sidebar-brand-modern">
                <h2>KH ADMIN</h2>
            </div>
            
            <nav className="sidebar-nav-modern">
                <NavLink to="/admin" end className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}>
                    <FaChartPie className="nav-icon" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}>
                    <FaShoppingCart className="nav-icon" />
                    <span>Orders</span>
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}>
                    <FaBoxOpen className="nav-icon" />
                    <span>Products</span>
                </NavLink>
                <NavLink to="/admin/customers" className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}>
                    <FaUsers className="nav-icon" />
                    <span>Customers</span>
                </NavLink>
                <NavLink to="/admin/settings" className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}>
                    <FaCog className="nav-icon" />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer-modern">
                <button 
                    onClick={onLogout} 
                    className="nav-link-modern" 
                    style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', color: 'var(--admin-danger)' }}
                >
                    <FaSignOutAlt className="nav-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
