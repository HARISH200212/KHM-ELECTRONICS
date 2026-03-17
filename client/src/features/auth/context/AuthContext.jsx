import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../shared/constants/api';

const AuthContext = createContext();
const AUTH_CHECK_TIMEOUT_MS = 8000;
const LOGIN_FALLBACK_DELAY_MS = 1200;

export const useAuth = () => useContext(AuthContext);

const createApiError = (data, fallbackMessage) => {
    const error = new Error(data?.message || fallbackMessage);

    if (data && typeof data === 'object') {
        Object.assign(error, data);
    }

    return error;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = `${API_BASE_URL}/api/auth`;

    useEffect(() => {
        const checkAuth = async () => {
            const controller = new AbortController();
            const fallbackTimer = setTimeout(() => {
                setIsLoading(false);
            }, LOGIN_FALLBACK_DELAY_MS);

            const requestTimer = setTimeout(() => {
                controller.abort();
            }, AUTH_CHECK_TIMEOUT_MS);

            try {
                // Verify with backend session
                const res = await fetch(`${API_URL}/login/success`, {
                    credentials: 'include',
                    signal: controller.signal
                });
                const data = await res.json();

                if (data.success) {
                    setUser(data.user);
                    localStorage.setItem('kh_user', JSON.stringify(data.user));
                } else {
                    // If session expired or invalid, clear local state
                    setUser(null);
                    localStorage.removeItem('kh_user');
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Auth check failed:', err);
                }

                setUser(null);
            } finally {
                clearTimeout(fallbackTimer);
                clearTimeout(requestTimer);
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('kh_user', JSON.stringify(data.user));
                toast.success('Logged in successfully');
                return data.user;
            } else {
                throw createApiError(data, 'Login failed');
            }
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(null);
                localStorage.removeItem('kh_user');
                toast.success(data.message || 'Account created successfully');
                return data;
            } else {
                throw createApiError(data, 'Registration failed');
            }
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    const socialLogin = (provider) => {
        if (provider === 'Google') {
            window.location.href = `${API_URL}/google`;
        } else if (provider === 'Facebook') {
            window.location.href = `${API_URL}/facebook`;
        } else if (provider === 'X') {
            window.location.href = `${API_URL}/x`;
        }
    };

    const updateProfile = async (updates) => {
        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('kh_user', JSON.stringify(data.user));
                return data.user;
            } else {
                throw createApiError(data, 'Profile update failed');
            }
        } catch (err) {
            console.error("Profile update failed:", err);
            throw err;
        }
    };

    const resendVerificationEmail = async (email) => {
        try {
            const res = await fetch(`${API_URL}/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Verification email sent');
                return data;
            }

            throw createApiError(data, 'Failed to resend verification email');
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    const verifyEmailToken = async (token) => {
        const res = await fetch(`${API_URL}/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (!res.ok) {
            throw createApiError(data, 'Failed to verify email');
        }

        return data;
    };

    const forgotPassword = async (email) => {
        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Password reset email sent');
                return data;
            }

            throw createApiError(data, 'Failed to request password reset');
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    const resetPasswordWithToken = async (token, newPassword) => {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();

        if (!res.ok) {
            throw createApiError(data, 'Failed to reset password');
        }

        return data;
    };

    const forgotEmail = async (phone) => {
        try {
            const res = await fetch(`${API_URL}/forgot-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Email reminder sent');
                return data;
            }

            throw createApiError(data, 'Failed to find email address');
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    const requestEmailChange = async (newEmail, currentPassword) => {
        try {
            const res = await fetch(`${API_URL}/email-change/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newEmail, currentPassword })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Email change request sent');
                return data;
            }

            throw createApiError(data, 'Failed to request email change');
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    const confirmEmailChange = async (token) => {
        const res = await fetch(`${API_URL}/email-change/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (!res.ok) {
            throw createApiError(data, 'Failed to confirm email change');
        }

        return data;
    };

    const logout = async () => {
        try {
            // Logout from backend session
            window.location.href = `${API_URL}/logout`;

            setUser(null);
            localStorage.removeItem('kh_user');
            toast.success('Logged out successfully');
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };



    const sendOtp = async (phone) => {
        try {
            const res = await fetch(`${API_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (res.ok) {
                if (!data.devOtp) {
                    toast.success('OTP sent to your phone!');
                }
                return data.devOtp || null; // Return dev OTP so UI can display it
            } else {
                throw new Error(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    const verifyOtp = async (phone, otp) => {
        try {
            const res = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('kh_user', JSON.stringify(data.user));
                toast.success('Logged in successfully!');
                return data.user;
            } else {
                throw new Error(data.message || 'Invalid OTP');
            }
        } catch (err) {
            toast.error(err.message);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            updateProfile,
            socialLogin,
            logout,
            sendOtp,
            verifyOtp,
            resendVerificationEmail,
            verifyEmailToken,
            forgotPassword,
            resetPasswordWithToken,
            forgotEmail,
            requestEmailChange,
            confirmEmailChange,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
