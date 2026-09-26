import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const OTPVerifyModal = ({ email, onSuccess, onClose }) => {
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyOTP(email, otp);
      setMessage('Email verified successfully! Loading your dashboard...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await resendOTP(email);
      setMessage('A fresh 6-digit OTP has been sent to your email address.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} color="#6366f1" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Verify Your Email</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Enter the 6-digit OTP sent to {email}</p>
            </div>
          </div>
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
              <CheckCircle size={16} />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700', padding: '12px' }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '11px' }}
            >
              {loading ? 'Verifying...' : 'Verify Account & Continue'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            <span>Didn't receive the email? </span>
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={resending ? 'spin' : ''} />
              <span>{resending ? 'Sending...' : 'Resend OTP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerifyModal;
