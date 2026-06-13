import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  announcementService,
  gamificationService,
  weeklyPlanService,
  workoutService,
  authService,
  Announcement,
  GamificationSummary,
  WeeklyPlan,
  Workout
} from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import {
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Loader2,
  Megaphone,
  Plus,
  Trophy,
  Zap,
  RefreshCw
} from 'lucide-react';

const typeColor: Record<string, string> = {
  Strength: '#a3e635',
  Cardio: '#38bdf8',
  Mobility: '#a78bfa',
  Flexibility: '#a78bfa',
  Sports: '#f97316'
};

const formatDate = (iso?: string) => {
  if (!iso) return 'Recent';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [workoutsList, plan, summary, anns, meData] = await Promise.all([
        workoutService.getRecent(),
        weeklyPlanService.get(),
        gamificationService.getSummary(),
        announcementService.getAll(),
        authService.me()
      ]);
      setWorkouts(workoutsList);
      setWeeklyPlan(plan);
      setGamification(summary);
      setAnnouncements(anns.slice(0, 2));
      setProfile(meData?.profile || meData);
    } catch (err) {
      console.error('Failed to fetch student dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalSets = useMemo(
    () => workouts.reduce((sum, workout) => sum + (workout.exercises || []).reduce((exerciseSum, exercise) => exerciseSum + (exercise.sets?.length || 0), 0), 0),
    [workouts]
  );

  const totalMinutes = useMemo(
    () => workouts.reduce((sum, workout) => sum + (Number(workout.durationMinutes) || 0), 0),
    [workouts]
  );

  const totalCalories = useMemo(
    () => workouts.reduce((sum, workout) => sum + (Number(workout.caloriesBurned || 0) || 0), 0),
    [workouts]
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading training dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header section */}
        <div 
          className="flex flex-col gap-4 rounded-xl p-5 lg:flex-row lg:items-center lg:justify-between"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Student Hub</p>
              <h1 className="text-lg font-black text-foreground">
                {user?.fullName ? `${user.fullName.split(' ')[0]}'s dashboard` : 'Dashboard'}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/quick-log"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
            >
              <Plus size={14} />
              Log Workout
            </Link>
          </div>
        </div>

        {/* Streak & Level Widget */}
        <div
          className="flex flex-col gap-4 rounded-xl p-5 lg:flex-row lg:items-center lg:justify-between"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Calendar size={18} color="var(--primary)" />
              </div>
              <div>
                <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider">Workout Streak</span>
                <span className="text-sm font-black text-foreground">{gamification?.currentStreak || 0}-day streak</span>
              </div>
            </div>
            <div className="hidden h-6 w-px bg-border lg:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Trophy size={18} color="var(--primary)" />
              </div>
              <div>
                <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider">Level Status</span>
                <span className="text-sm font-black text-primary">Level {gamification?.level || 1} · {gamification?.xp || 0} XP</span>
              </div>
            </div>
            <div className="hidden h-6 w-px bg-border lg:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Trophy size={18} color="var(--primary)" />
              </div>
              <div>
                <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider">Achievements</span>
                <span className="text-sm font-black text-foreground">{gamification?.badgesCount || 0} Badges Earned</span>
              </div>
            </div>
          </div>
          <Link to="/badges" className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
            View milestones <ChevronRight size={13} />
          </Link>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Recent Energy Card */}
          <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent energy</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'rgba(163, 230, 53, 0.08)' }}>
                <Flame size={15} color="var(--primary)" />
              </div>
            </div>
            {workouts.length > 0 && !profile?.weight && !profile?.weightKg ? (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-bold text-yellow-500 leading-normal">
                  Set profile weight to estimate calories.
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{totalCalories || 0}</span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </div>
            )}
          </div>

          {[
            { label: 'Active time', value: totalMinutes || 0, unit: 'min', icon: Clock, color: 'var(--primary)', bg: 'rgba(163, 230, 53, 0.08)' },
            { label: 'Tracked sets', value: totalSets || 0, unit: 'sets', icon: Dumbbell, color: 'var(--primary)', bg: 'rgba(163, 230, 53, 0.08)' },
            { label: 'Weekly target', value: weeklyPlan?.targetCount || 0, unit: 'weekly', icon: Calendar, color: 'var(--primary)', bg: 'rgba(163, 230, 53, 0.08)' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: stat.bg }}>
                  <stat.icon size={15} color={stat.color} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Recent Workouts list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-black text-foreground">Recent Workouts</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Your latest 5 logged physical activities.</p>
                </div>
                <Link to="/history" className="text-xs font-bold text-primary transition-colors hover:opacity-85">View Journal</Link>
              </div>

              {workouts.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground italic">
                  No workouts logged yet. Save your first workout using the Quick Log builder.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {workouts.slice(0, 5).map((workout) => {
                    const color = typeColor[workout.workoutType] || '#a3e635';
                    const setCount = (workout.exercises || []).reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0);
                    return (
                      <div
                        key={workout.id}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.01]"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}10` }}>
                          {workout.workoutType === 'Cardio' ? <Heart size={16} color={color} /> : <Dumbbell size={16} color={color} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">{workout.workoutType} Session</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {formatDate(workout.createdAt)} · {workout.durationMinutes} min
                          </p>
                        </div>
                        <div className="hidden text-right text-xs text-muted-foreground sm:block">
                          <p className="text-xs font-bold text-foreground">{setCount || workout.exercises?.length || 0}</p>
                          <p className="text-[10px]">{setCount ? 'sets' : 'exercises'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-foreground">+{workout.xpEarned} XP</p>
                          <span className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: `${color}15`, color }}>
                            {workout.workoutType}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Announcements & Goal Progress */}
          <div className="space-y-6">
            {/* Weekly Target Progress Card */}
            {weeklyPlan && (
              <div className="rounded-xl border border-border p-5 space-y-4 bg-card">
                <div>
                  <h3 className="text-sm font-black text-foreground">Weekly Target Status</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Progress toward your weekly workout target.</p>
                </div>
                <div className="rounded-xl bg-muted/10 border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Logged:</span>
                    <span className="font-bold text-foreground">{weeklyPlan.currentCount} / {weeklyPlan.targetCount} workouts</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (weeklyPlan.currentCount / (weeklyPlan.targetCount || 1)) * 100)}%` }}
                    />
                  </div>
                  {weeklyPlan.currentCount >= weeklyPlan.targetCount ? (
                    <p className="text-[10px] font-bold text-primary flex items-center gap-1 leading-none mt-1">
                      Target hit! Weekly bonus points unlocked.
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                      Log {weeklyPlan.targetCount - weeklyPlan.currentCount} more workouts to claim your bonus.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Announcements Card */}
            {announcements.length > 0 && (
              <div className="rounded-xl border border-border p-5 space-y-4 bg-card">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-primary" />
                  <h3 className="text-sm font-black text-foreground">Announcements</h3>
                </div>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="rounded-lg p-3 border border-border bg-muted/10 space-y-1">
                      <p className="text-xs font-bold text-foreground">{ann.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
