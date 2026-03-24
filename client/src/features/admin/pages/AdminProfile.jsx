import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaShieldAlt, FaEdit, FaArrowLeft, FaClock } from 'react-icons/fa';
import './AdminProfile.css';

const AdminProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profileId } = useParams();
    const [selectedProfile, setSelectedProfile] = useState(profileId || user?.email);
    const [adminData, setAdminData] = useState(null);
    const [adminList, setAdminList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});

    // Mock admin profiles - in real app, fetch from backend
    useEffect(() => {
        const fetchAdminProfiles = async () => {
            setLoading(true);
            try {
                const requestedProfileEmail = decodeURIComponent(profileId || '').trim();
                const currentUserProfile = user?.email
                    ? {
                        id: 'current-admin',
                        name: user?.name || 'Admin User',
                        email: user.email,
                        phone: user?.phone || 'Not available',
                        role: user?.role === 'admin' ? 'Admin' : (user?.role || 'Admin'),
                        department: 'Administration',
                        joinDate: user?.createdAt || new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        status: 'Active',
                        profilePicture: '👤'
                    }
                    : null;

                // Mock data for multiple admin profiles
                const mockAdmins = [
                    {
                        id: 1,
                        name: 'Admin Manager',
                        email: 'admin@khm-electronics.com',
                        phone: '+91-9876543210',
                        role: 'Super Admin',
                        department: 'Management',
                        joinDate: '2024-01-15',
                        lastLogin: new Date().toISOString(),
                        status: 'Active',
                        profilePicture: '👔'
                    },
                    {
                        id: 2,
                        name: 'Product Manager',
                        email: 'product@khm-electronics.com',
                        phone: '+91-9876543211',
                        role: 'Product Admin',
                        department: 'Product Management',
                        joinDate: '2024-02-20',
                        lastLogin: new Date(Date.now() - 3600000).toISOString(),
                        status: 'Active',
                        profilePicture: '📦'
                    },
                    {
                        id: 3,
                        name: 'Order Manager',
                        email: 'orders@khm-electronics.com',
                        phone: '+91-9876543212',
                        role: 'Order Admin',
                        department: 'Order Processing',
                        joinDate: '2024-03-10',
                        lastLogin: new Date(Date.now() - 7200000).toISOString(),
                        status: 'Active',
                        profilePicture: '📋'
                    },
                    {
                        id: 4,
                        name: 'Finance Officer',
                        email: 'finance@khm-electronics.com',
                        phone: '+91-9876543213',
                        role: 'Finance Admin',
                        department: 'Finance',
                        joinDate: '2024-04-05',
                        lastLogin: new Date(Date.now() - 86400000).toISOString(),
                        status: 'Active',
                        profilePicture: '💰'
                    }
                ];

                const mergedAdmins = currentUserProfile
                    ? [
                        currentUserProfile,
                        ...mockAdmins.filter((admin) => admin.email !== currentUserProfile.email)
                    ]
                    : mockAdmins;

                setAdminList(mergedAdmins);

                // Prefer explicitly requested profile, then selected profile, then current logged-in user.
                const selected = mergedAdmins.find((admin) => admin.email === requestedProfileEmail)
                    || mergedAdmins.find((admin) => admin.email === selectedProfile)
                    || mergedAdmins.find((admin) => admin.email === user?.email)
                    || mergedAdmins[0];

                setAdminData(selected);
                setEditedData(selected);
                setSelectedProfile(selected.email);
            } catch (error) {
                console.error('Error fetching admin profiles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminProfiles();
    }, [profileId, selectedProfile, user?.email, user?.name, user?.phone, user?.createdAt, user?.role]);

    const handleProfileChange = (email) => {
        const normalizedEmail = String(email || '').trim();
        setSelectedProfile(normalizedEmail);

        if (!normalizedEmail) {
            navigate('/admin/profile');
            return;
        }

        navigate(`/admin/profile/${encodeURIComponent(normalizedEmail)}`);
    };

    const handleEditChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            // In real app, send to backend
            setAdminData(editedData);
            setIsEditing(false);
            // Show success message
            console.log('Profile updated:', editedData);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="admin-profile-page">
                <div className="loading-skeleton">
                    <div className="skeleton-header"></div>
                    <div className="skeleton-content"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-profile-page">
            {/* Header */}
            <div className="profile-header">
                <button className="btn-back" onClick={() => navigate('/admin')}>
                    <FaArrowLeft /> Back to Dashboard
                </button>
                <h1>Admin Profile Management</h1>
            </div>

            {/* Profile Selector */}
            <div className="profile-selector-section">
                <label>Select Admin Profile:</label>
                <div className="profile-selector-wrapper">
                    <select 
                        value={selectedProfile} 
                        onChange={(e) => handleProfileChange(e.target.value)}
                        className="profile-selector-dropdown"
                    >
                        <option value="">-- Choose Profile --</option>
                        {adminList.map((admin) => (
                            <option key={admin.email} value={admin.email}>
                                {admin.profilePicture} {admin.name} ({admin.role})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="profile-content-grid">
                {/* Left Column: Profile Card */}
                <div className="profile-card-section">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <span className="avatar-emoji">{adminData?.profilePicture}</span>
                        </div>
                        
                        <div className="profile-header-info">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.name}
                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                    className="edit-input profile-name-edit"
                                />
                            ) : (
                                <h2 className="profile-name">{adminData?.name}</h2>
                            )}
                            
                            <div className="profile-badge">
                                <FaShieldAlt /> {adminData?.role}
                            </div>
                        </div>

                        {!isEditing && (
                            <button 
                                className="btn-edit"
                                onClick={() => setIsEditing(true)}
                            >
                                <FaEdit /> Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="quick-stats">
                        <div className="stat-item">
                            <label>Department</label>
                            <span className="stat-value">{adminData?.department}</span>
                        </div>
                        <div className="stat-item">
                            <label>Status</label>
                            <span className={`stat-value status-${adminData?.status?.toLowerCase()}`}>
                                {adminData?.status}
                            </span>
                        </div>
                        <div className="stat-item">
                            <label>Join Date</label>
                            <span className="stat-value">{formatDate(adminData?.joinDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Information */}
                <div className="profile-details-section">
                    <div className="details-container">
                        <h3>Contact Information</h3>
                        
                        {/* Email */}
                        <div className="detail-item">
                            <label className="detail-label">
                                <FaEnvelope /> Email Address
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editedData.email}
                                    onChange={(e) => handleEditChange('email', e.target.value)}
                                    className="edit-input"
                                />
                            ) : (
                                <p className="detail-value">{adminData?.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="detail-item">
                            <label className="detail-label">
                                <FaPhone /> Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editedData.phone}
                                    onChange={(e) => handleEditChange('phone', e.target.value)}
                                    className="edit-input"
                                />
                            ) : (
                                <p className="detail-value">{adminData?.phone}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="detail-item">
                            <label className="detail-label">
                                <FaShieldAlt /> Admin Role
                            </label>
                            {isEditing ? (
                                <select 
                                    value={editedData.role}
                                    onChange={(e) => handleEditChange('role', e.target.value)}
                                    className="edit-input"
                                >
                                    <option>Super Admin</option>
                                    <option>Product Admin</option>
                                    <option>Order Admin</option>
                                    <option>Finance Admin</option>
                                </select>
                            ) : (
                                <p className="detail-value">{adminData?.role}</p>
                            )}
                        </div>

                        {/* Department */}
                        <div className="detail-item">
                            <label className="detail-label">
                                <FaUser /> Department
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.department}
                                    onChange={(e) => handleEditChange('department', e.target.value)}
                                    className="edit-input"
                                />
                            ) : (
                                <p className="detail-value">{adminData?.department}</p>
                            )}
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="details-container">
                        <h3>Activity Information</h3>

                        {/* Join Date */}
                        <div className="detail-item">
                            <label className="detail-label">
                                <FaCalendar /> Join Date
                            </label>
                            <p className="detail-value">{formatDate(adminData?.joinDate)}</p>
                        </div>

                        {/* Last Login */}
                        <div className="detail-item">
                            <label className="detail-label">
                                <FaClock /> Last Login
                            </label>
                            <p className="detail-value">
                                {formatDate(adminData?.lastLogin)} at {formatTime(adminData?.lastLogin)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
                {isEditing ? (
                    <>
                        <button className="btn-save" onClick={handleSaveProfile}>
                            Save Changes
                        </button>
                        <button className="btn-cancel" onClick={() => {
                            setEditedData(adminData);
                            setIsEditing(false);
                        }}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn-action btn-primary" onClick={() => setIsEditing(true)}>
                            <FaEdit /> Edit Profile
                        </button>
                        <button className="btn-action btn-secondary" onClick={() => navigate('/admin')}>
                            Back to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminProfile;
