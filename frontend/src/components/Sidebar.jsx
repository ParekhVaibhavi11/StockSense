import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  History, 
  MapPin, 
  Users, 
  User,
  Settings,
  LogOut, 
  Boxes 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
          SS
        </div>
        <span className="brand-name">StockSense</span>
      </div>

      {/* Shiprocket-style Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/products" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Products</span>
        </NavLink>

        <NavLink 
          to="/operations" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ArrowLeftRight size={18} />
          <span>Operations</span>
        </NavLink>

        <NavLink 
          to="/ledger" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <History size={18} />
          <span>Move History</span>
        </NavLink>

        <NavLink 
          to="/locations" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <MapPin size={18} />
          <span>Warehouses</span>
        </NavLink>

        <NavLink 
          to="/suppliers" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Suppliers</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Setting (Warehouse)</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      {/* User Session & Logout Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', marginBottom: '2px' }}>
          {user ? user.name : 'Guest User'}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize', marginBottom: '12px' }}>
          {user ? user.role.replace('_', ' ') : 'Warehouse Staff'}
        </div>
        <button 
          onClick={logout} 
          className="btn btn-secondary btn-sm" 
          style={{ width: '100%', justifyContent: 'center', backgroundColor: 'transparent', color: '#cbd5e1', borderColor: '#334155' }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
