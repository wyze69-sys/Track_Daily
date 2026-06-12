import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, feedbackService, AdminDashboardData } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Grid,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Tag,
  Trophy,
  Users
} from 'lucide-react';

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(163,230,53,0.12)', color: '#a3e635' },
    pending: { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
    reviewed: { bg: 'rgba(56,189,248,0.12)', color: '#38bdf8' },
    resolved: { bg: 'rgba(163,230,53,0.12)', color: '#a3e635' }
  };
  const style = map[status] || { bg: 'rgba(136,136,160,0.12)', color: '#8888a0' };
  return (
    <span className="rounded px-2 py-0.5 text-xs capitalize" style={{ background: style.bg, color: style.color, fontWeight: 600 }}>
      {status}
    </span>
  );
};

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'categories' | 'feedback'>('overview');
  const [search, setSearch] = useState('');

  const fetchDashboard = async () => {
    try {
      const dbData = await adminService.getDashboard();
      setData(dbData);
      setError(null);
    } catch (err) {
      console.error('Failed to load admin summary indicators', err);
      setError('Failed to fetch administrative data stream.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleResolveFeedback = async (id: string) => {
    try {
      await feedbackService.updateStatus(id, 'reviewed');
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to resolve feedback status', err);
      setError('Could not mark feedback as reviewed.');
    }
  };

  const filteredFeedback = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.recentFeedback.filter((item) =>
      item.userName.toLowerCase().includes(q) || item.content.toLowerCase().includes(q)
    );
  }, [data, search]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(251,191,36,0.12)' }}>
            <Shield size={20} color="#fbbf24" />
          </div>
          <div>
            <h1 className="text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">Manage users, content & platform data</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Total Users', value: data.totalUsersCount, sub: 'Registered accounts' },
                { label: 'Active Streaks', value: data.activeStreakCount, sub: 'Current activity' },
                { label: 'Workouts Logged', value: data.totalWorkoutsCount, sub: 'All-time logs' },
                { label: 'Campus XP', value: data.totalXpEarned, sub: 'Issued by backend' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-extrabold leading-tight text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex w-fit flex-wrap gap-1 rounded-xl p-0.5" style={{ background: 'var(--muted)' }}>
              {(['overview', 'categories', 'feedback'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className="rounded-lg px-4 py-1.5 text-sm capitalize transition-all"
                  style={{
                    background: tab === item ? '#a3e635' : 'transparent',
                    color: tab === item ? '#09090f' : 'var(--muted-foreground)',
                    fontWeight: tab === item ? 700 : 400
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Link to="/admin/users" className="rounded-xl p-5 transition-colors hover:bg-white/[0.03]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users size={20} color="#a3e635" />
                      <div>
                        <h3 className="text-foreground">User Management</h3>
                        <p className="text-sm text-muted-foreground">Review student accounts and roles</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </div>
                </Link>
                <Link to="/admin/challenges" className="rounded-xl p-5 transition-colors hover:bg-white/[0.03]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy size={20} color="#fbbf24" />
                      <div>
                        <h3 className="text-foreground">Challenges & Badges</h3>
                        <p className="text-sm text-muted-foreground">Manage gamified content</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </div>
                </Link>
              </div>
            )}

            {tab === 'categories' && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-foreground">Exercise Categories</h3>
                  <Link to="/admin/categories" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all hover:brightness-110" style={{ background: '#a3e635', color: '#09090f' }}>
                    <Plus size={14} /> Add Category
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.categories.map((category) => (
                    <div key={category.id} className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(163,230,53,0.12)' }}>
                          <Tag size={20} color="#a3e635" />
                        </div>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                      <p className="font-bold text-foreground">{category.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">Active exercise taxonomy</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'feedback' && (
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between p-5 pb-4">
                  <h3 className="text-foreground">User Feedback</h3>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--input-background)' }}>
                    <Search size={13} className="text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search feedback..."
                      className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-0">
                  {filteredFeedback.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">No feedback found.</p>
                  ) : filteredFeedback.map((feedback, index) => (
                    <div key={feedback.id} className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]" style={{ borderTop: index > 0 ? '1px solid var(--border)' : undefined }}>
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(56,189,248,0.1)' }}>
                          <MessageSquare size={14} color="#38bdf8" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{feedback.userName}</p>
                            <span className="text-xs text-muted-foreground">{new Date(feedback.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{feedback.content}</p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {statusBadge(feedback.status)}
                        {feedback.status === 'pending' && (
                          <button
                            onClick={() => handleResolveFeedback(feedback.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-colors hover:text-foreground"
                            style={{ background: 'rgba(163,230,53,0.1)' }}
                          >
                            <Check size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl p-4 text-xs text-muted-foreground" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <Grid className="mr-2 inline h-4 w-4 text-amber-400" />
              This admin screen follows the <code>D:\PROJECT\figma</code> Admin Portal layout, but uses real backend dashboard data.
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
};
