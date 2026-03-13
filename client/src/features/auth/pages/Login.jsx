import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebookF, FaTwitter, FaMobileAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import './Login.css';

const Login = () => {
    const [isLoginMsg, setIsLoginMsg] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    


    // OTP State
    const [isOtpLogin, setIsOtpLogin] = useState(false);
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [devOtp, setDevOtp] = useState(null); // Only set in dev mode when no SMS is configured

    const { login, register, socialLogin, sendOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Where the user came from (or home as fallback)
    const from = location.state?.from?.pathname || '/';

    // Auto-send OTP when phone number is >= 10 digits
    useEffect(() => {
        if (isOtpLogin && !isOtpSent && phone.replace(/\D/g, '').length >= 10) {
            const autoSend = async () => {
                try {
                    setIsSubmitting(true);
                    const returnedDevOtp = await sendOtp(phone);
                    if (returnedDevOtp) setDevOtp(returnedDevOtp);
                    setIsOtpSent(true);
                } catch (err) {
                    setError(err.message || 'Failed to send OTP');
                } finally {
                    setIsSubmitting(false);
                }
            };
            // small debounce so it doesn't fire on every keystroke
            const timer = setTimeout(autoSend, 800);
            return () => clearTimeout(timer);
        }
    }, [phone, isOtpLogin, isOtpSent]);

    const handleSocialLogin = async (provider) => {
        try {
            await socialLogin(provider);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Social login failed');
        }
    };




    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isOtpLogin) {
                // Only step 2 remains (step 1 is auto-triggered)
                const user = await verifyOtp(phone, otpCode);
                if (user?.isAdmin || user?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate(from, { replace: true });
                }
            } else {
                // Standard Email Login / Register
                if (isLoginMsg) {
                    const user = await login(email, password);
                    if (user?.isAdmin || user?.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate(from, { replace: true });
                    }
                } else {
                    await register(name, email, password);
                    navigate(from, { replace: true });
                }
            }
        } catch (err) {
            // Error messages are generated from AuthContext
            setError(err.message || 'Authentication failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page container">
            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLoginMsg ? 'login' : 'signup'}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <h2 className="section-title">{isLoginMsg ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="login-subtitle">
                            {isLoginMsg ? 'Enter your details to access your account' : 'Join the future of electronics shopping'}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {error && (
                    <motion.div
                        className="error-alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    
                    {isLoginMsg && !isOtpLogin && (
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <motion.button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => { setIsOtpLogin(true); setError(''); setIsOtpSent(false); }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '2px dashed #ff00cc', background: 'transparent', color: '#ff00cc' }}
                                >
                                    <FaMobileAlt /> Phone OTP
                                </motion.button>
                            </div>
                            
                            <div className="login-divider" style={{ textAlign: 'center', margin: '15px 0', position: 'relative' }}>
                                <span style={{ background: 'var(--bg-card)', padding: '0 10px', color: '#888', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>or email</span>
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#ddd', zIndex: 0 }}></div>
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isOtpLogin ? (
                            <motion.div
                                key="otp-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="form-group">
                                    <label>Phone Number (with Country Code)</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+1234567890"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={isOtpSent}
                                    />
                                </div>
                                
                                {isOtpSent && (
                                    <motion.div 
                                        className="form-group"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        {devOtp && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                                border: '1px solid #ff00cc',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                                marginBottom: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#ff00cc', textTransform: 'uppercase', letterSpacing: '1px' }}>🔧 Dev Mode — Your OTP Code</p>
                                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'white', letterSpacing: '8px' }}>{devOtp}</p>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#888' }}>This box only appears when SMS is not configured</p>
                                            </div>
                                        )}
                                        <label>6-Digit OTP Code</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="123456"
                                            maxLength="6"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                        />
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    className="btn btn-primary login-btn"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ width: '100%', background: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)', border: 'none' }}
                                >
                                    {isSubmitting ? 'Processing...' : (isOtpSent ? 'Verify & Login' : 'Send OTP')}
                                </motion.button>
                                
                                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                    <span 
                                        style={{ color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                                        onClick={() => { setIsOtpLogin(false); setIsOtpSent(false); setPhone(''); setOtpCode(''); setError(''); }}
                                    >
                                        Back to Email Login
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="email-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <AnimatePresence>
                                    {!isLoginMsg && (
                                        <motion.div
                                            className="form-group"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    className="btn btn-primary login-btn"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isSubmitting ? 'Processing...' : (isLoginMsg ? 'Sign In' : 'Sign Up')}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <div className="login-footer">
                    <p>
                        {isLoginMsg ? "Don't have an account? " : "Already have an account? "}
                        <motion.span
                            className="toggle-link"
                            onClick={() => setIsLoginMsg(!isLoginMsg)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                        >
                            {isLoginMsg ? 'Sign Up' : 'Login'}
                        </motion.span>
                    </p>

                    <div className="social-login">
                        <p className="divider"><span>Or continue with</span></p>
                        <div className="social-btns">
                            {['Google', 'Facebook', 'X'].map((provider) => (
                                <motion.button
                                    key={provider}
                                    type="button"
                                    className={`social-btn ${provider.toLowerCase()}`}
                                    onClick={() => handleSocialLogin(provider)}
                                    title={`Login with ${provider}`}
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {provider === 'Google' ? <FaGoogle /> : provider === 'Facebook' ? <FaFacebookF /> : <FaTwitter />}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>


        </div>
    );
};

export default Login;
