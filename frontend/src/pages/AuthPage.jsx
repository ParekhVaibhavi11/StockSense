import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OTPVerifyModal from '../features/auth/OTPVerifyModal';
import ResetPasswordModal from '../features/auth/ResetPasswordModal';
import { Boxes, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, otpPendingEmail, setOtpPendingEmail } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'warehouse_staff',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !formData.email.trim().toLowerCase().endsWith('@gmail.com')) {
      setError('Registration is only available for @gmail.com addresses.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await login(formData.email, formData.password);
        if (res.success) {
          navigate('/dashboard');
        }
      } else {
        await register(formData.name, formData.email.trim(), formData.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo fill helpers
  const fillDemoManager = () => {
    setFormData({ email: 'manager@stocksense.com', password: 'password123', name: '', role: 'inventory_manager' });
    setIsLogin(true);
  };

  const fillDemoStaff = () => {
    setFormData({ email: 'staff@stocksense.com', password: 'password123', name: '', role: 'warehouse_staff' });
    setIsLogin(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      {/* OTP Verification Modal */}
      {otpPendingEmail && (
        <OTPVerifyModal
          email={otpPendingEmail}
          onSuccess={() => navigate('/dashboard')}
          onClose={() => setOtpPendingEmail(null)}
        />
      )}

      {/* OTP Password Reset Modal */}
      {showResetModal && (
        <ResetPasswordModal
          onClose={() => setShowResetModal(false)}
          onSuccess={() => {
            setShowResetModal(false);
            setIsLogin(true);
          }}
        />
      )}

      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Brand Header Banner */}
        <div style={{ backgroundColor: '#0b1021', padding: '32px 24px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>
            SS
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '700' }}>StockSense</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Modular Real-Time Inventory Management</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{ flex: 1, padding: '14px', border: 'none', background: isLogin ? '#ffffff' : 'transparent', fontWeight: '600', fontSize: '14px', color: isLogin ? '#6366f1' : '#64748b', cursor: 'pointer', borderBottom: isLogin ? '2px solid #6366f1' : 'none' }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{ flex: 1, padding: '14px', border: 'none', background: !isLogin ? '#ffffff' : 'transparent', fontWeight: '600', fontSize: '14px', color: !isLogin ? '#6366f1' : '#64748b', cursor: 'pointer', borderBottom: !isLogin ? '2px solid #6366f1' : 'none' }}
          >
            Register Account
          </button>
        </div>

        <div style={{ padding: '28px 24px' }}>
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@gmail.com"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {!isLogin && (
              <div style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px' }}>
                ℹ️ Use an <strong>@gmail.com</strong> address to register. Public registrations are created as <strong>Warehouse Staff</strong>.
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '8px' }}>
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In to Dashboard' : 'Register & Send OTP'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Login Credentials Bar */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textAlign: 'center' }}>⚡ Quick Demo Logins</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={fillDemoManager} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                <ShieldCheck size={14} color="#6366f1" />
                <span>Manager</span>
              </button>
              <button onClick={fillDemoStaff} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                <User size={14} color="#10b981" />
                <span>Staff</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
