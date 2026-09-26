import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, User } from 'lucide-react';

const Header = ({ title = 'Inventory Dashboard' }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 className="topbar-title">{title}</h1>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            backgroundColor: '#f1f5f9', 
            padding: '4px 10px', 
            borderRadius: '12px', 
            fontSize: '12px', 
            color: '#475569',
            fontWeight: '500'
          }}
        >
          <Building2 size={14} color="#6366f1" />
          <span>Warehouse: WH/MAIN</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div className="user-profile-pill">
            <div className="user-avatar">{getInitials(user.name)}</div>
            <div>
              <div style={{ fontWeight: '600', color: '#0f172a', lineHeight: '1.2' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#10b981" />
                <span style={{ textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
