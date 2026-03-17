import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaBell, FaPalette, FaLock, FaCamera } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
    const { user, updateProfile, requestEmailChange, resendVerificationEmail } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [newEmailAddress, setNewEmailAddress] = useState('');
    const [emailChangePassword, setEmailChangePassword] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification Settings State
    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('kh_notifications');
            return saved && saved !== "undefined" ? JSON.parse(saved) : {
                orders: true,
                marketing: false,
                security: true
            };
        } catch (e) {
            return { orders: true, marketing: false, security: true };
        }
    });

    useEffect(() => {
        localStorage.setItem('kh_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateProfile({ name });
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile. Please re-login and try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notification setting updated!`);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return toast.error("New passwords don't match!");
        }
        if (!currentPassword || !newPassword) {
            return toast.error("Please fill in all password fields");
        }

        setIsUpdating(true);
        try {
            await updateProfile({ currentPassword, newPassword });
            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEmailChangeRequest = async (e) => {
        e.preventDefault();

        if (!newEmailAddress) {
            return toast.error('Enter a new email address first');
        }

        setIsUpdating(true);
        try {
            await requestEmailChange(newEmailAddress, emailChangePassword);
            setNewEmailAddress('');
            setEmailChangePassword('');
        } catch (error) {
            toast.error(error.message || 'Failed to request email change');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleResendVerification = async () => {
        if (!user?.email) {
            return;
        }

        try {
            await resendVerificationEmail(user.email);
        } catch (error) {
            toast.error(error.message || 'Failed to resend verification email');
        }
    };


    const tabs = [
        { id: 'profile', label: 'Profile', icon: <FaUser /> },
        { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
        { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
        { id: 'security', label: 'Security', icon: <FaLock /> }
    ];

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="settings-page container">
            <motion.button
                className="back-btn"
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                <FaArrowLeft /> Back
            </motion.button>

            <h1 className="page-title">Account Settings</h1>

            <div className="settings-grid">
                <div className="settings-sidebar">
                    {tabs.map(tab => (
                        <motion.div
                            key={tab.id}
                            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {tab.icon} {tab.label}
                        </motion.div>
                    ))}
                </div>

                <div className="settings-content">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.section
                                key="profile"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="settings-section"
                            >
                                <h2>Public Profile</h2>
                                <div className="profile-photo-edit">
                                    <img src={user?.avatar} alt="Profile" />
                                    <motion.button
                                        className="change-photo-btn"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaCamera /> Change Photo
                                    </motion.button>
                                </div>

                                <form onSubmit={handleUpdate} className="settings-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={email} disabled />
                                        <small>{user?.emailVerified ? 'Email verified.' : 'Email not verified yet.'}</small>
                                        <div className={`verification-badge ${user?.emailVerified ? 'verified' : 'pending'}`}>
                                            {user?.emailVerified ? 'Verified' : 'Pending verification'}
                                        </div>
                                        {!user?.emailVerified && user?.email && !String(user.email).endsWith('@phone.login') && (
                                            <button type="button" className="link-button" onClick={handleResendVerification}>
                                                Resend verification email
                                            </button>
                                        )}
                                    </div>
                                    <motion.button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isUpdating}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </motion.button>
                                </form>
                            </motion.section>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.section
                                key="notifications"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="settings-section"
                            >
                                <h2>Email Notifications</h2>
                                <div className="toggle-group">
                                    <div className="toggle-info">
                                        <h3>Order Updates</h3>
                                        <p>Get notified when your order status changes.</p>
                                    </div>
                                    <motion.div
                                        className={`toggle-switch ${notifications.orders ? 'active' : ''}`}
                                        onClick={() => toggleNotification('orders')}
                                        whileTap={{ scale: 0.9 }}
                                    ></motion.div>
                                </div>
                                <div className="toggle-group">
                                    <div className="toggle-info">
                                        <h3>Marketing Emails</h3>
                                        <p>Receive information about new products and sales.</p>
                                    </div>
                                    <motion.div
                                        className={`toggle-switch ${notifications.marketing ? 'active' : ''}`}
                                        onClick={() => toggleNotification('marketing')}
                                        whileTap={{ scale: 0.9 }}
                                    ></motion.div>
                                </div>
                                <div className="toggle-group">
                                    <div className="toggle-info">
                                        <h3>Security Alerts</h3>
                                        <p>Get notified about important account security events.</p>
                                    </div>
                                    <motion.div
                                        className={`toggle-switch ${notifications.security ? 'active' : ''}`}
                                        onClick={() => toggleNotification('security')}
                                        whileTap={{ scale: 0.9 }}
                                    ></motion.div>
                                </div>
                            </motion.section>
                        )}

                        {activeTab === 'appearance' && (
                            <motion.section
                                key="appearance"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="settings-section"
                            >
                                <h2>Appearance Settings</h2>
                                <p style={{ color: 'var(--text-dim)', marginTop: '1rem' }}>
                                    Theme customization will be available in the next update.
                                </p>
                            </motion.section>
                        )}

                        {activeTab === 'security' && (
                            <motion.section
                                key="security"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="settings-section"
                            >
                                <h2>Security Settings</h2>

                                <div className="security-section">
                                    <h3>Change Password</h3>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                                        Update your password to keep your account secure.
                                    </p>
                                    <form className="settings-form" onSubmit={handlePasswordUpdate}>
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter current password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            className="btn btn-primary"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Updating...' : 'Update Password'}
                                        </motion.button>
                                    </form>
                                </div>

                                {user?.email && !String(user.email).endsWith('@phone.login') && (
                                    <div className="security-section" style={{ marginTop: '3rem' }}>
                                        <h3>Change Email Address</h3>
                                        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                                            Request an email update. We will send a confirmation link to the new address.
                                        </p>
                                        <form className="settings-form" onSubmit={handleEmailChangeRequest}>
                                            <div className="form-group">
                                                <label>New Email Address</label>
                                                <input
                                                    type="email"
                                                    placeholder="new-address@example.com"
                                                    value={newEmailAddress}
                                                    onChange={(e) => setNewEmailAddress(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Current Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="Enter current password"
                                                    value={emailChangePassword}
                                                    onChange={(e) => setEmailChangePassword(e.target.value)}
                                                />
                                                <small>Required for local email/password accounts.</small>
                                            </div>
                                            <motion.button
                                                type="submit"
                                                className="btn btn-primary"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? 'Sending...' : 'Send Email Change Link'}
                                            </motion.button>
                                        </form>
                                    </div>
                                )}

                                <div className="security-section" style={{ marginTop: '3rem' }}>
                                    <h3>Two-Factor Authentication</h3>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                                        Add an extra layer of security to your account.
                                    </p>
                                    <div className="toggle-group">
                                        <div className="toggle-info">
                                            <h4>Enable 2FA</h4>
                                            <p>Require a verification code in addition to your password when logging in.</p>
                                        </div>
                                        <motion.div
                                            className="toggle-switch"
                                            onClick={() => toast.info('Two-factor authentication will be available soon!')}
                                            whileTap={{ scale: 0.9 }}
                                        ></motion.div>
                                    </div>
                                </div>



                                <div className="security-section" style={{ marginTop: '3rem' }}>
                                    <h3>Active Sessions</h3>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                                        Manage devices where you're currently logged in.
                                    </p>
                                    <div className="session-item">
                                        <div>
                                            <h4>Current Device</h4>
                                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                                Windows • Chrome • Last active: Now
                                            </p>
                                        </div>
                                        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                                            Active
                                        </span>
                                    </div>
                                </div>

                                <div className="security-section" style={{ marginTop: '3rem' }}>
                                    <h3>Danger Zone</h3>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                                        Irreversible account actions.
                                    </p>
                                    <motion.button
                                        className="btn btn-danger"
                                        onClick={() => toast.error('Account deletion must be confirmed via email')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Delete Account
                                    </motion.button>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </div>
            </div>


        </div>
    );
};

export default Settings;
