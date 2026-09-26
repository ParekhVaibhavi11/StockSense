import React, { useState } from 'react';
import api from '../../services/api';
import { KeyRound, Mail, CheckCircle2, AlertCircle, X, ArrowRight, Lock } from 'lucide-react';

const ResetPasswordModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // Step 1: Request Email OTP, Step 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Step 1: Request Password Reset OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage('A 6-digit password reset OTP code has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP & New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      setMessage('Password reset successful! Redirecting to Sign In...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={18} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>OTP Password Reset</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                {step === 1 ? 'Enter your registered email address' : 'Enter 6-digit OTP & new password'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{ padding: '10px 14px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          )}

          {/* STEP 1: Email Request Form */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP}>
              <div className="form-group">
                <label className="form-label">Registered Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@stocksense.com"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '8px' }}>
                <span>{loading ? 'Sending OTP...' : 'Send Reset OTP Code'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: OTP Entry & New Password Form */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center' }}>6-Digit Reset OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="form-input"
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700', padding: '10px' }}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '8px' }}>
                <span>{loading ? 'Resetting Password...' : 'Reset Password & Sign In'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
