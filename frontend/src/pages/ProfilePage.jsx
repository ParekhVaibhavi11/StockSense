import React, { useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, Key, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, login } = useAuth();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await api.put('/auth/profile', profileData);
      setProfileSuccess(res.data.message);
      
      // Update local storage user data
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('stocksense_user', JSON.stringify(updatedUser));
      window.location.reload(); // Refresh to sync topbar & sidebar
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess(res.data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Header title="My Profile & Account Settings" />

      <div className="page-content" style={{ maxWidth: '900px' }}>
        {/* User Account Summary Card */}
        <div className="card-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', flexShrink: 0 }}>
            {user ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{user?.name}</h2>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} color="#6366f1" />
                {user?.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                <ShieldCheck size={14} color="#10b981" />
                Role: <strong>{user?.role.replace('_', ' ')}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#065f46', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', fontSize: '11px' }}>
                Verified Account
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Form 1: Edit Profile Details */}
          <div className="card-container" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <User size={20} color="#6366f1" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Edit Profile Information</h3>
            </div>

            {profileError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div style={{ padding: '10px 14px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                <Save size={16} />
                <span>{profileLoading ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div className="card-container" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <Key size={20} color="#6366f1" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Change Password</h3>
            </div>

            {passwordError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div style={{ padding: '10px 14px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={passwordLoading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                <Key size={16} />
                <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
