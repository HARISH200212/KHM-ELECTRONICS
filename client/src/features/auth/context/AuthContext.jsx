import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../shared/constants/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = `${API_BASE_URL}/api/auth`;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check local storage first for quick response
                const storedUser = localStorage.getItem('kh_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Verify with backend session
                const res = await fetch(`${API_URL}/login/success`, {
                    credentials: "include"
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
                console.error("Auth check failed:", err);
            } finally {
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
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('kh_user', JSON.stringify(data.user));
                toast.success('Logged in successfully');
                return data.user;
            } else {
                throw new Error(data.message || 'Login failed');
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
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('kh_user', JSON.stringify(data.user));
                toast.success('Account created successfully');
                return data.user;
            } else {
                throw new Error(data.message || 'Registration failed');
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
                throw new Error(data.message || 'Profile update failed');
            }
        } catch (err) {
            console.error("Profile update failed:", err);
            throw err;
        }
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
        <AuthContext.Provider value={{ user, login, register, updateProfile, socialLogin, logout, sendOtp, verifyOtp, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
