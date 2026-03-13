import { Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import './Admin.css';

const AdminLayout = () => {
    const { logout } = useAuth();

    return (
        <div className="admin-layout-modern">
            <AdminSidebar onLogout={logout} />
            <div className="admin-content-wrapper">
                <main className="admin-main-modern">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
