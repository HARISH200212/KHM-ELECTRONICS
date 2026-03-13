import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import LoadingScreen from '../../../shared/components/ui/LoadingScreen';

const AdminRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;

    // Admin Panel is disabled as per security requirements
    return <Navigate to="/" replace />;

    return <Outlet />;
};

export default AdminRoute;
