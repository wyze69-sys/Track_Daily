import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { gamificationService, GamificationSummary } from '../../services/api';
import {
  Award,
  BarChart3,
  Calendar,
  ChevronRight,
  Dumbbell,
  FileCode2,
  Flame,
  Grid,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  PlusCircle,
  Shield,
  Trophy,
  Users,
  X,
  Zap
} from 'lucide-react';

interface PageContainerProps {
  children: React.ReactNode;
}

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Workout Log', path: '/quick-log', icon: Dumbbell },
  { label: 'Weekly Plan', path: '/weekly-plan', icon: Calendar },
  { label: 'History', path: '/history', icon: History },
  { label: 'Progress', path: '/progress', icon: BarChart3 },
  { label: 'Gamification', path: '/badges', icon: Trophy }
];

const adminNav = [
  { label: 'Admin Portal', path: '/admin/dashboard', icon: Shield },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Categories', path: '/admin/categories', icon: Grid },
  { label: 'Templates', path: '/admin/templates', icon: FileCode2 },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Challenges', path: '/admin/challenges', icon: Trophy },
  { label: 'Feedback', path: '/admin/feedback', icon: MessageSquare }
];

const initialsFor = (name?: string) => {
  if (!name) return 'FS';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'FS';
};

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<GamificationSummary | null>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const navItems = isAdminRoute ? adminNav : studentNav;

  useEffect(() => {
    if (isAdminRoute) return;
    let mounted = true;
    gamificationService
      .getSummary()
      .then((summary) => mounted && setStats(summary))
      .catch((err) => console.error('Failed to load sidebar gamification summary', err));
    return () => {
      mounted = false;
    };
  }, [location.pathname, isAdminRoute]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0"
        style={{
          background: 'var(--sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
          transform: sidebarOpen ? 'translateX(0)' : undefined
        }}
        data-mobile-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to={isAdminRoute ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #a3e635, #84cc16)' }}
            >
              {isAdminRoute ? <Shield size={17} color="#09090f" strokeWidth={2.5} /> : <Zap size={18} color="#09090f" strokeWidth={2.5} />}
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">
              FitSync
              {isAdminRoute && <span className="ml-1 text-xs font-bold text-primary">Admin</span>}
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
            style={{ background: 'linear-gradient(135deg, #a3e635, #84cc16)', color: '#09090f' }}
          >
            {initialsFor(user?.fullName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{user?.fullName || (isAdminRoute ? 'Campus Admin' : 'FitSync User')}</p>
            <div className="flex items-center gap-1.5">
              {isAdminRoute ? (
                <>
                  <Shield size={11} color="#fbbf24" />
                  <span className="text-[0.7rem] font-bold text-amber-400">Control panel</span>
                </>
              ) : (
                <>
                  <Flame size={11} color="#f97316" />
                  <span className="text-[0.7rem] font-bold text-orange-500">{stats?.currentStreak || 0}-day streak</span>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          <p className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {isAdminRoute ? 'Admin' : 'Main'}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                    isActive
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} />
                    <span className="flex-1 font-semibold">{item.label}</span>
                    {item.path === '/badges' && !isAdminRoute && (
                      <span className="rounded-lg px-1.5 py-0.5 text-xs font-bold text-orange-500" style={{ background: 'rgba(249,115,22,0.15)' }}>
                        {stats?.currentStreak || 0}🔥
                      </span>
                    )}
                    {isActive && <ChevronRight size={13} color="#a3e635" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {!isAdminRoute && stats && (
          <div className="px-4 py-4">
            <div className="rounded-xl p-3" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.12)' }}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Level {stats.level}</span>
                <span className="text-[0.7rem] font-bold text-primary">{stats.xp} XP</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, stats.progressToNextLevel || 0)}%`, background: 'linear-gradient(90deg, #84cc16, #a3e635)' }}
                />
              </div>
              <p className="mt-1.5 text-[0.65rem] text-muted-foreground">Real XP from your backend</p>
            </div>
          </div>
        )}

        <div className="border-t border-white/5 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/15"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex flex-shrink-0 items-center gap-3 px-4 py-3 lg:hidden" style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #a3e635, #84cc16)' }}>
              <Zap size={13} color="#09090f" strokeWidth={2.5} />
            </div>
            <span className="text-base font-black text-foreground">FitSync</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          aside[data-mobile-hidden="true"] {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};
