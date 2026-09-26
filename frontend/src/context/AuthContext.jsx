import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpPendingEmail, setOtpPendingEmail] = useState(null);

  // Load active session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('stocksense_token');
    const savedUser = localStorage.getItem('stocksense_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('stocksense_user');
      }
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem('stocksense_token', token);
      localStorage.setItem('stocksense_user', JSON.stringify(userData));
      setUser(userData);
      setOtpPendingEmail(null);
      return { success: true };
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setOtpPendingEmail(email);
        return {
          requiresVerification: true,
          email,
          error: err.response?.data?.error || 'Email verification required.',
        };
      }
      throw new Error(err.response?.data?.error || 'Login failed. Please check credentials.');
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'warehouse_staff') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      setOtpPendingEmail(email);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Registration failed.');
    }
  };

  // OTP Verification handler
  const verifyOTP = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { token, user: userData } = res.data;

      if (token && userData) {
        localStorage.setItem('stocksense_token', token);
        localStorage.setItem('stocksense_user', JSON.stringify(userData));
        setUser(userData);
      }
      setOtpPendingEmail(null);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Invalid OTP verification code.');
    }
  };

  // Resend OTP handler
  const resendOTP = async (email) => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to resend OTP.');
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('stocksense_token');
    localStorage.removeItem('stocksense_user');
    setUser(null);
    setOtpPendingEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        otpPendingEmail,
        setOtpPendingEmail,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        isManager: user?.role === 'inventory_manager',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
