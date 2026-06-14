import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { gamificationService, GamificationSummary } from '../../services/api';
import { Flame, Trophy, Award, BarChart3, Calendar, History, LogOut, LayoutDashboard, Zap, User, PlusCircle } from 'lucide-react';

export const StudentTopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState<GamificationSummary | null>(null);

  const fetchStats = async () => {
    try {
      const summary = await gamificationService.getSummary();
      setStats(summary);
    } catch (err) {
      console.error("Failed to load gamification top stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats when path shifts (e.g. after logging workout)
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Quick Log', path: '/quick-log', icon: PlusCircle },
    { label: 'Weekly Plan', path: '/weekly-plan', icon: Calendar },
    { label: 'History', path: '/history', icon: History },
    { label: 'Progress', path: '/progress', icon: BarChart3 },
    { label: 'Badges', path: '/badges', icon: Award }
  ];

  const initials = (user?.fullName || user?.email || 'U')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-xs backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-lg shadow-sm">
              L
            </span>
            <span className="font-sans font-bold tracking-tight text-xl text-gray-900">
              track_daily
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-5">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Level, XP, Streak indicators + Profile */}
        <div className="flex items-center gap-4">
          {stats && (
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 text-xs font-semibold">
              {/* Level indicator */}
              <div className="flex items-center gap-1 text-teal-700">
                <Trophy className="h-3.5 w-3.5" />
                <span>Lvl {stats.level}</span>
              </div>
              
              {/* XP status */}
              <div className="hidden sm:flex items-center gap-1 text-purple-700 border-l border-gray-200 pl-2">
                <Zap className="h-3.5 w-3.5 fill-purple-100" />
                <span>{stats.xp} XP</span>
              </div>

              {/* Streak status */}
              <div className="flex items-center gap-1 text-orange-600 border-l border-gray-200 pl-2">
                <Flame className="h-3.5 w-3.5 fill-orange-50" />
                <span>{stats.currentStreak} Day Streak</span>
              </div>
            </div>
          )}

          {/* User Meta & Logout */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-semibold text-gray-800">{user?.fullName}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user?.role} Log</p>
            </div>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-8 w-8 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full border border-gray-200 bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
            )}
            <button
              onClick={logout}
              title="Logout Securely"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav links (Horizontal Scroll) */}
      <div className="flex md:hidden border-t border-gray-100 overflow-x-auto bg-white px-2 py-1 scrollbar-none justify-start gap-1">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <IconComp className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
