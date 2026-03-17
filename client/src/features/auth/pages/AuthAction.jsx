import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import './AuthAction.css';

const AuthAction = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyEmailToken, resetPasswordWithToken, confirmEmailChange } = useAuth();
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const action = searchParams.get('action');
    const token = searchParams.get('token');

    const config = useMemo(() => {
        switch (action) {
            case 'verify-email':
                return {
                    title: 'Verify Email',
                    description: 'We are verifying your email address now.',
                };
            case 'reset-password':
                return {
                    title: 'Reset Password',
                    description: 'Choose a new password for your account.',
                };
            case 'confirm-email-change':
                return {
                    title: 'Confirm Email Change',
                    description: 'We are confirming your new email address now.',
                };
            default:
                return {
                    title: 'Invalid Link',
                    description: 'This account action link is not valid.',
                };
        }
    }, [action]);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('This link is missing a token. Request a new email and try again.');
            return;
        }

        if (action !== 'verify-email' && action !== 'confirm-email-change') {
            return;
        }

        const runAction = async () => {
            setStatus('processing');

            try {
                const result = action === 'verify-email'
                    ? await verifyEmailToken(token)
                    : await confirmEmailChange(token);

                setStatus('success');
                setMessage(result.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.message || 'This link is invalid or has expired.');
            }
        };

        runAction();
    }, [action, confirmEmailChange, token, verifyEmailToken]);

    const handlePasswordReset = async (event) => {
        event.preventDefault();

        if (!token) {
            setStatus('error');
            setMessage('This reset link is missing a token.');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        setStatus('processing');

        try {
            const result = await resetPasswordWithToken(token, password);
            setStatus('success');
            setMessage(result.message);
            setTimeout(() => navigate('/login'), 1200);
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Unable to reset password.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page container">
            <motion.div
                className="login-card auth-action-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="section-title">{config.title}</h2>
                <p className="login-subtitle">{config.description}</p>

                {action === 'reset-password' ? (
                    <form className="login-form" onSubmit={handlePasswordReset}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                minLength="8"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                minLength="8"
                                required
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                            />
                        </div>
                        {message && <div className={`auth-action-message ${status}`}>{message}</div>}
                        <button type="submit" className="btn btn-primary login-btn" disabled={submitting}>
                            {submitting ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                ) : (
                    <div className="auth-action-state">
                        <div className={`auth-action-message ${status === 'idle' ? 'processing' : status}`}>
                            {status === 'processing' ? 'Processing your request...' : message}
                        </div>
                    </div>
                )}

                <div className="login-footer auth-action-footer">
                    <Link to="/login" className="toggle-link">Back to Login</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthAction;
