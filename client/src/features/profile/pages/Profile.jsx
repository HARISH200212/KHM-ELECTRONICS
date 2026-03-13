import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { FaArrowLeft, FaUser, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                <div className="profile-card">
                    <div className="profile-header">
                        <img src={user.avatar} alt={user.name} className="profile-avatar-large" />
                        <h1>{user.name}</h1>
                        {((user.isAdmin === true) || user.role === 'admin') && <span className="admin-badge"><FaShieldAlt /> Admin</span>}
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <FaEnvelope className="icon" />
                            <div>
                                <label>Email</label>
                                <p>{user.email}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaUser className="icon" />
                            <div>
                                <label>User ID</label>
                                <p>{user.id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        {((user.isAdmin === true) || user.role === 'admin') && (
                            <button className="btn btn-primary" onClick={() => navigate('/admin')}>
                                Admin Dashboard
                            </button>
                        )}
                        <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
                            Account Settings
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
                            View My Orders
                        </button>
                        <button className="btn btn-danger" onClick={() => { logout(); navigate('/'); }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
