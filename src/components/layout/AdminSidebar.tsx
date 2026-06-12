import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Users,
  Grid,
  FileCode2,
  Trophy,
  Megaphone,
  MessageSquare,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Workout Categories', path: '/admin/categories', icon: Grid },
    { label: 'Workout Templates', path: '/admin/templates', icon: FileCode2 },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Badges & Challenges', path: '/admin/challenges', icon: Trophy },
    { label: 'Review Feedback', path: '/admin/feedback', icon: MessageSquare }
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-slate-900 text-slate-100 min-h-screen sticky top-0 flex flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white font-bold text-lg shadow-md">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-heading font-extrabold text-base tracking-tight text-white leading-none">
              FitSync <span className="text-orange-500 font-medium text-xs">Admin</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Campus Control Panel</p>
          </div>
        </div>

        {/* Navigation Admin Menu */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
            alt="Admin profile"
            className="h-10 w-10 rounded-full border border-slate-755 object-cover"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Campus Admin'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-950/60 border border-red-900/30 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          Disconnect Portal
        </button>
      </div>
    </aside>
  );
};
