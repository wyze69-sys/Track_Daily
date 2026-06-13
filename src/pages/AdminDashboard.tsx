import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminService,
  feedbackService,
  categoryService,
  templateService,
  AdminDashboardData,
  ExerciseCategory,
  WorkoutTemplate,
  Feedback
} from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import {
  Loader2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Users,
  Flame,
  Dumbbell,
  Trophy,
  Tag,
  FileCode2,
  Megaphone,
  MessageSquare,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [feedbackQueue, setFeedbackQueue] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSummaryTab, setActiveSummaryTab] = useState<'categories' | 'templates'>('categories');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dbData, catList, tplList, fbList] = await Promise.all([
        adminService.getDashboard(),
        categoryService.getAll(),
        templateService.getAll(),
        feedbackService.getAll()
      ]);
      
      setData(dbData);
      setCategories(catList);
      setTemplates(tplList);
      setFeedbackQueue(fbList);
      setError(null);
    } catch (err) {
      console.error('Failed to load admin summary indicators', err);
      setError('Failed to load real data from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleResolveFeedback = async (id: string) => {
    try {
      await feedbackService.updateStatus(id, 'reviewed');
      // Proactively reload the feedback list and dashboard statistics
      const [dbData, fbList] = await Promise.all([
        adminService.getDashboard(),
        feedbackService.getAll()
      ]);
      setData(dbData);
      setFeedbackQueue(fbList);
    } catch (err) {
      console.error('Failed to resolve feedback status', err);
      setError('Could not update feedback report status.');
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'dumbbell': return <Dumbbell className="h-4 w-4" />;
      case 'flame': return <Flame className="h-4 w-4" />;
      case 'sparkles': return <Trophy className="h-4 w-4" />;
      case 'trophy': return <Trophy className="h-4 w-4" />;
      case 'grid': return <Tag className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin data...</p>
        </div>
      </PageContainer>
    );
  }

  // Filter feedback queue to show pending items first, or highlight them
  const pendingFeedback = feedbackQueue.filter(f => f.status === 'pending');

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header Section */}
        <div 
          className="flex flex-col gap-4 rounded-xl p-5 lg:flex-row lg:items-center lg:justify-between"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">Admin Console</h1>
              <p className="text-xs text-muted-foreground">Manage platform categories, workout templates, and student issues.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {user && (
              <div className="text-xs font-semibold text-muted-foreground">
                Signed in as: <span className="font-bold text-foreground">{user.fullName} ({user.email})</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Online</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="flex items-center gap-1 font-bold uppercase tracking-wider text-red-300 hover:text-red-200"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {data && (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Total Users', value: data.totalUsersCount ?? 0, sub: 'Registered student accounts', icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
                { label: 'Active Streaks', value: data.activeStreakCount ?? 0, sub: 'Students with active streaks', icon: Flame, color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
                { label: 'Workouts Logged', value: data.totalWorkoutsCount ?? 0, sub: 'All-time workout entries', icon: Dumbbell, color: '#a3e635', bg: 'rgba(163,230,53,0.08)' },
                { label: 'XP Awarded', value: data.totalXpEarned ?? 0, sub: 'Experience points earned', icon: Trophy, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' }
              ].map((stat) => (
                <div 
                  key={stat.label} 
                  className="rounded-xl p-5" 
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: stat.bg }}>
                      <stat.icon size={15} color={stat.color} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-foreground">{stat.value.toLocaleString()}</div>
                  <span className="mt-1 block text-[10px] text-muted-foreground">{stat.sub}</span>
                </div>
              ))}
            </div>

            {/* Split Content Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column (Content and Action Queue) */}
              <div className="space-y-6 lg:col-span-2">
                
                {/* Real User Feedback Queue */}
                <div 
                  className="rounded-xl border border-border overflow-hidden" 
                  style={{ background: 'var(--card)' }}
                >
                  <div className="border-b border-border px-5 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-foreground">User Feedback Queue</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Triage and review feedback reports submitted by students.</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {pendingFeedback.length} Pending
                    </span>
                  </div>

                  <div className="divide-y divide-border">
                    {feedbackQueue.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs font-semibold text-foreground">Feedback Queue Clear</p>
                        <p className="text-[10px] text-muted-foreground mt-1">No user feedback reports have been submitted yet.</p>
                      </div>
                    ) : pendingFeedback.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                        <p className="text-xs font-semibold text-foreground">All Feedback Reviewed</p>
                        <p className="text-[10px] text-muted-foreground mt-1">All reports are marked reviewed. Good job keeping the queue clean!</p>
                      </div>
                    ) : (
                      pendingFeedback.map((fb) => (
                        <div key={fb.id} className="p-4 flex items-start justify-between gap-4 transition-colors hover:bg-white/[0.01]">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{fb.userName}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(fb.date).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed break-words">{fb.content}</p>
                          </div>
                          <button
                            onClick={() => handleResolveFeedback(fb.id)}
                            className="flex-shrink-0 flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
                          >
                            <Check className="h-3 w-3" />
                            Mark Reviewed
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Categories & Templates Summary */}
                <div 
                  className="rounded-xl border border-border overflow-hidden" 
                  style={{ background: 'var(--card)' }}
                >
                  <div className="border-b border-border bg-muted/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-foreground">Content Taxonomies</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Manage and inspect training structures used by students.</p>
                    </div>
                    <div className="flex rounded-lg bg-muted p-0.5 w-fit">
                      <button
                        onClick={() => setActiveSummaryTab('categories')}
                        className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                          activeSummaryTab === 'categories' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Categories ({categories.length})
                      </button>
                      <button
                        onClick={() => setActiveSummaryTab('templates')}
                        className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                          activeSummaryTab === 'templates' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Workout Templates ({templates.length})
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    {activeSummaryTab === 'categories' ? (
                      categories.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground italic">
                          No exercise categories found in system database.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {categories.map((cat) => (
                            <div 
                              key={cat.id} 
                              className="rounded-xl border border-border p-4 flex items-start gap-3 bg-muted/10"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                {getCategoryIcon(cat.icon)}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-foreground block">{cat.name}</span>
                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed truncate-2-lines">{cat.description || 'No description supplied.'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      templates.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground italic">
                          No workout templates found in system database.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border text-muted-foreground font-semibold">
                                <th className="pb-2">Name</th>
                                <th className="pb-2">Category</th>
                                <th className="pb-2 text-right">Standard Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {templates.map((tpl) => (
                                <tr key={tpl.id} className="text-foreground">
                                  <td className="py-2.5 font-bold">{tpl.name}</td>
                                  <td className="py-2.5">
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      {tpl.category}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right font-medium text-muted-foreground flex items-center justify-end gap-1">
                                    <Clock size={11} />
                                    {tpl.durationMinutes} min
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column (Sidebar console navigation & analytics logs) */}
              <div className="space-y-6">
                
                {/* Console Shortcuts Grid */}
                <div 
                  className="rounded-xl border border-border p-5 space-y-4"
                  style={{ background: 'var(--card)' }}
                >
                  <div>
                    <h3 className="text-sm font-black text-foreground">Console Shortcuts</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Quick routes to specialized management lists.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: 'Users', path: '/admin/users', icon: Users, desc: 'Update student roles and states', count: data.totalUsersCount },
                      { name: 'Categories', path: '/admin/categories', icon: Tag, desc: 'Manage workout taxonomies', count: data.totalCategoriesCount },
                      { name: 'Templates', path: '/admin/templates', icon: FileCode2, desc: 'Configure default schedules' },
                      { name: 'Challenges', path: '/admin/challenges', icon: Trophy, desc: 'Design student challenges' },
                      { name: 'Announcements', path: '/admin/announcements', icon: Megaphone, desc: 'Publish notifications' },
                      { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare, desc: 'Examine complete reports', count: data.totalFeedbackCount }
                    ].map((shortcut) => {
                      const Icon = shortcut.icon;
                      return (
                        <Link 
                          key={shortcut.name}
                          to={shortcut.path}
                          className="group rounded-xl border border-border p-3 flex items-start justify-between bg-muted/10 transition-all hover:border-primary/40 hover:bg-white/[0.01]"
                        >
                          <div className="flex gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{shortcut.name}</span>
                                {shortcut.count !== undefined && (
                                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9px] font-bold text-muted-foreground">
                                    {shortcut.count}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{shortcut.desc}</p>
                            </div>
                          </div>
                          <ArrowRight size={12} className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Platform Workouts */}
                <div 
                  className="rounded-xl border border-border p-5 space-y-4"
                  style={{ background: 'var(--card)' }}
                >
                  <div>
                    <h3 className="text-sm font-black text-foreground">Recent Activity Logs</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Most recent logs registered across the platform.</p>
                  </div>
                  <div className="space-y-3">
                    {(!data.recentWorkouts || data.recentWorkouts.length === 0) ? (
                      <div className="text-center text-xs text-muted-foreground italic py-4">
                        No platform activity logged.
                      </div>
                    ) : (
                      data.recentWorkouts.map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between text-xs gap-3">
                          <div className="min-w-0">
                            <span className="font-bold text-foreground block truncate">{workout.userName}</span>
                            <span className="text-[10px] text-muted-foreground">{workout.workoutType}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-semibold text-primary block">{workout.durationMinutes} min</span>
                            <span className="text-[9px] text-muted-foreground">
                              {workout.createdAt ? new Date(workout.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
};
