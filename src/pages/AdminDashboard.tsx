import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, feedbackService, AdminDashboardData } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Database,
  FileCode2,
  Grid,
  Loader2,
  Megaphone,
  MessageSquare,
  Server,
  ShieldCheck,
  Trophy,
  Users,
  Zap
} from 'lucide-react';

type KpiCardProps = {
  label: string;
  value: number | string;
  helper: string;
  tone: 'slate' | 'blue' | 'emerald' | 'amber';
  icon: React.ElementType;
};

const toneMap = {
  slate: 'border-slate-200 bg-white text-slate-950',
  blue: 'border-blue-100 bg-blue-50/50 text-blue-950',
  emerald: 'border-emerald-100 bg-emerald-50/50 text-emerald-950',
  amber: 'border-amber-100 bg-amber-50/50 text-amber-950'
};

const iconToneMap = {
  slate: 'bg-slate-900 text-white',
  blue: 'bg-blue-700 text-white',
  emerald: 'bg-emerald-700 text-white',
  amber: 'bg-amber-500 text-slate-950'
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, helper, tone, icon: Icon }) => (
  <div className={`rounded-2xl border p-5 shadow-xs ${toneMap[tone]}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconToneMap[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">{helper}</p>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const dbData = await adminService.getDashboard();
      setData(dbData);
      setError(null);
    } catch (err) {
      console.error('Failed to load admin summary indicators', err);
      setError('Failed to fetch administrative dashboard data.');
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

  const pendingFeedbackCount = useMemo(() => {
    if (!data) return 0;
    return data.recentFeedback.filter((fb) => fb.status === 'pending').length;
  }, [data]);

  const engagementRate = useMemo(() => {
    if (!data || data.totalUsersCount === 0) return 0;
    return Math.round((data.activeStreakCount / data.totalUsersCount) * 100);
  }, [data]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Admin Workspace</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Operations Dashboard</h1>
                  <p className="mt-1 max-w-2xl text-sm text-slate-400">
                    Separate control room for platform health, student engagement, content setup, and feedback review.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/15"
                >
                  Manage Users <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/admin/feedback"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950 transition-colors hover:bg-slate-100"
                >
                  Review Feedback <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-200 bg-slate-50/60 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="flex items-center gap-3 px-6 py-4">
              <Server className="h-4.5 w-4.5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-950">System status</p>
                <p className="text-[11px] font-medium text-slate-500">API and dashboard online</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4">
              <Database className="h-4.5 w-4.5 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-slate-950">Data scope</p>
                <p className="text-[11px] font-medium text-slate-500">Aggregated metrics only</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4">
              <Activity className="h-4.5 w-4.5 text-amber-600" />
              <div>
                <p className="text-xs font-bold text-slate-950">Engagement rate</p>
                <p className="text-[11px] font-medium text-slate-500">{engagementRate}% active streak coverage</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="h-4.5 w-4.5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        ) : data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Students"
                value={data.totalUsersCount}
                helper="Registered accounts in the FitSync workspace."
                tone="slate"
                icon={Users}
              />
              <KpiCard
                label="Workouts"
                value={data.totalWorkoutsCount}
                helper="Total submitted workout logs across users."
                tone="blue"
                icon={Trophy}
              />
              <KpiCard
                label="Active Streaks"
                value={data.activeStreakCount}
                helper="Students currently maintaining activity momentum."
                tone="emerald"
                icon={BarChart3}
              />
              <KpiCard
                label="XP Distributed"
                value={data.totalXpEarned}
                helper="Gamification points issued by real workout activity."
                tone="amber"
                icon={Zap}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <section className="xl:col-span-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Feedback Queue</p>
                    <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">Recent student messages</h2>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-800">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {pendingFeedbackCount} pending
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {data.recentFeedback.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <CheckCircle className="mx-auto h-8 w-8 text-emerald-600" />
                      <p className="mt-3 text-sm font-bold text-slate-900">No feedback waiting</p>
                      <p className="mt-1 text-xs text-slate-500">The review queue is clear.</p>
                    </div>
                  ) : (
                    data.recentFeedback.map((fb) => (
                      <div key={fb.id} className="px-6 py-4 transition-colors hover:bg-slate-50/70">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black text-slate-950">{fb.userName}</p>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                {new Date(fb.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{fb.content}</p>
                          </div>

                          {fb.status === 'pending' ? (
                            <button
                              onClick={() => handleResolveFeedback(fb.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-slate-800"
                            >
                              Mark Reviewed
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                              <CheckCircle className="h-3.5 w-3.5" /> Reviewed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <aside className="xl:col-span-4 space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Operations</p>
                      <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">Admin actions</h2>
                    </div>
                    <ClipboardList className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="space-y-2">
                    <Link to="/admin/categories" className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                      <span className="flex items-center gap-2"><Grid className="h-4 w-4" /> Categories</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </Link>
                    <Link to="/admin/templates" className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                      <span className="flex items-center gap-2"><FileCode2 className="h-4 w-4" /> Templates</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </Link>
                    <Link to="/admin/announcements" className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                      <span className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Announcements</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Taxonomy</p>
                      <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">Workout categories</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                      {data.totalCategoriesCount}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {data.categories.slice(0, 6).map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                        <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 ring-1 ring-emerald-100">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
                    <strong>Privacy note:</strong> Admin views use aggregate activity and feedback review. Personal workout notes stay out of broad analytics cards.
                  </div>
                </section>
              </aside>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
