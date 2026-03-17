import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebookF, FaTwitter, FaMobileAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const VIEW_COPY = {
    login: {
        title: 'Welcome Back',
        subtitle: 'Enter your details to access your account'
    },
    signup: {
        title: 'Create Account',
        subtitle: 'Create your account and verify your email to get started'
    },
    'forgot-password': {
        title: 'Forgot Password',
        subtitle: 'Enter your email and we will send you a password reset link'
    },
    'forgot-email': {
        title: 'Forgot Email ID',
        subtitle: 'Enter your phone number and we will help you recover your account email'
    },
    'verify-email': {
        title: 'Verify Your Email',
        subtitle: 'Check your inbox and click the verification link we sent you'
    }
};

const Login = () => {
    const [authView, setAuthView] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [phoneRecovery, setPhoneRecovery] = useState('');
    const [recoveryHint, setRecoveryHint] = useState('');

    const [isOtpLogin, setIsOtpLogin] = useState(false);
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [devOtp, setDevOtp] = useState(null);

    const {
        login,
        register,
        socialLogin,
        sendOtp,
        verifyOtp,
        forgotPassword,
        forgotEmail,
        resendVerificationEmail
    } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

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

            const timer = setTimeout(autoSend, 800);
            return () => clearTimeout(timer);
        }
    }, [phone, isOtpLogin, isOtpSent, sendOtp]);

    const setView = (view) => {
        setAuthView(view);
        setError('');
        setRecoveryHint('');

        if (view !== 'login') {
            setIsOtpLogin(false);
            setIsOtpSent(false);
            setDevOtp(null);
            setOtpCode('');
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            await socialLogin(provider);
            navigate(from, { replace: true });
        } catch (_err) {
            setError('Social login failed');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isOtpLogin) {
                const user = await verifyOtp(phone, otpCode);
                if (user?.isAdmin || user?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate(from, { replace: true });
                }
            } else if (authView === 'login') {
                const user = await login(email, password);
                if (user?.isAdmin || user?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate(from, { replace: true });
                }
            } else if (authView === 'signup') {
                await register(name, email, password);
                setVerificationEmail(email);
                setPassword('');
                setView('verify-email');
            } else if (authView === 'forgot-password') {
                await forgotPassword(email);
                setVerificationEmail(email);
                setView('login');
            } else if (authView === 'forgot-email') {
                const result = await forgotEmail(phoneRecovery);
                setRecoveryHint(result.maskedEmail ? `Possible account email: ${result.maskedEmail}` : result.message);
            }
        } catch (err) {
            if (err.requiresEmailVerification) {
                setVerificationEmail(err.email || email);
                setView('verify-email');
            }

            setError(err.message || 'Authentication failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        const targetEmail = verificationEmail || email;
        if (!targetEmail) {
            setError('Enter your email address first.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await resendVerificationEmail(targetEmail);
        } catch (err) {
            setError(err.message || 'Failed to resend verification email.');
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
                        key={authView}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <h2 className="section-title">{VIEW_COPY[authView].title}</h2>
                        <p className="login-subtitle">{VIEW_COPY[authView].subtitle}</p>
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

                {recoveryHint && <div className="auth-helper-card">{recoveryHint}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {authView === 'login' && !isOtpLogin && (
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <motion.button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => { setIsOtpLogin(true); setError(''); setIsOtpSent(false); }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '2px dashed var(--primary)', background: 'rgba(34, 197, 94, 0.06)', color: 'var(--primary)' }}
                                >
                                    <FaMobileAlt /> Phone OTP
                                </motion.button>
                            </div>

                            <div className="login-divider" style={{ textAlign: 'center', margin: '15px 0', position: 'relative' }}>
                                <span style={{ background: 'var(--bg-card)', padding: '0 10px', color: 'var(--text-dim)', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>or email</span>
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-light)', zIndex: 0 }}></div>
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
                                                background: 'linear-gradient(135deg, rgba(6, 12, 9, 0.94), rgba(8, 28, 16, 0.9))',
                                                border: '1px solid var(--border-olive)',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                                marginBottom: '12px',
                                                textAlign: 'center',
                                                boxShadow: 'var(--shadow-olive)'
                                            }}>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dev Mode OTP</p>
                                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-light)', letterSpacing: '8px' }}>{devOtp}</p>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--text-dim)' }}>This appears only when SMS is not configured.</p>
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
                                    style={{ width: '100%', background: 'var(--primary-gradient)', border: '1px solid var(--border-olive)', color: '#04110a' }}
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
                                key={authView}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <AnimatePresence>
                                    {authView === 'signup' && (
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

                                {(authView === 'login' || authView === 'signup' || authView === 'forgot-password') && (
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
                                )}

                                {(authView === 'login' || authView === 'signup') && (
                                    <>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                required
                                                minLength="8"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        {authView === 'login' && (
                                            <div className="login-inline-actions">
                                                <button type="button" className="link-button" onClick={() => setView('forgot-password')}>
                                                    Forgot password?
                                                </button>
                                                <button type="button" className="link-button" onClick={() => setView('forgot-email')}>
                                                    Forgot email ID?
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {authView === 'forgot-email' && (
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+919876543210"
                                            value={phoneRecovery}
                                            onChange={(e) => setPhoneRecovery(e.target.value)}
                                        />
                                    </div>
                                )}

                                {authView === 'verify-email' ? (
                                    <div className="auth-helper-card verify-state-card">
                                        <p>Verification email sent to <strong>{verificationEmail}</strong>.</p>
                                        <div className="login-inline-actions centered">
                                            <button type="button" className="btn btn-primary" disabled={isSubmitting} onClick={handleResendVerification}>
                                                {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.button
                                        type="submit"
                                        className="btn btn-primary login-btn"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isSubmitting ? 'Processing...' : (
                                            authView === 'login'
                                                ? 'Sign In'
                                                : authView === 'signup'
                                                    ? 'Create Account'
                                                    : authView === 'forgot-password'
                                                        ? 'Send Reset Link'
                                                        : 'Find My Email'
                                        )}
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <div className="login-footer">
                    {authView === 'login' && (
                        <p>
                            Don't have an account?{' '}
                            <motion.span
                                className="toggle-link"
                                onClick={() => setView('signup')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ display: 'inline-block', cursor: 'pointer' }}
                            >
                                Sign Up
                            </motion.span>
                        </p>
                    )}

                    {authView !== 'login' && authView !== 'verify-email' && (
                        <p>
                            Remembered your details?{' '}
                            <motion.span
                                className="toggle-link"
                                onClick={() => setView('login')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ display: 'inline-block', cursor: 'pointer' }}
                            >
                                Back to Login
                            </motion.span>
                        </p>
                    )}

                    {authView === 'verify-email' && (
                        <p>
                            Already verified?{' '}
                            <motion.span
                                className="toggle-link"
                                onClick={() => setView('login')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ display: 'inline-block', cursor: 'pointer' }}
                            >
                                Sign In
                            </motion.span>
                        </p>
                    )}

                    {authView === 'login' && (
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
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
