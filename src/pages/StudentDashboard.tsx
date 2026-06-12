import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  announcementService,
  gamificationService,
  weeklyPlanService,
  workoutService,
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
  Zap
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      workoutService.getRecent(),
      weeklyPlanService.get(),
      gamificationService.getSummary(),
      announcementService.getAll()
    ])
      .then(([workoutsList, plan, summary, anns]) => {
        if (!mounted) return;
        setWorkouts(workoutsList);
        setWeeklyPlan(plan);
        setGamification(summary);
        setAnnouncements(anns.slice(0, 2));
      })
      .catch((err) => console.error('Failed to fetch student dashboard data', err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
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
    () => workouts.reduce((sum, workout) => sum + (Number(workout.caloriesBurned || workout.calories) || 0), 0),
    [workouts]
  );

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Training overview</p>
            <h1 className="mt-0.5 text-2xl font-black text-foreground">{user?.fullName ? `${user.fullName.split(' ')[0]}'s dashboard` : 'Dashboard'}</h1>
          </div>
          <Link
            to="/quick-log"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all hover:brightness-110 active:scale-95"
            style={{ background: '#a3e635', color: '#09090f' }}
          >
            <Plus size={16} />
            Log Workout
          </Link>
        </div>

        <div
          className="flex flex-col gap-4 rounded-xl p-4 lg:flex-row lg:items-center lg:justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(163,230,53,0.15) 0%, rgba(132,204,22,0.05) 100%)', border: '1px solid rgba(163,230,53,0.2)' }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame size={20} color="#f97316" />
              <span className="font-bold text-orange-500">{gamification?.currentStreak || 0}-day streak</span>
            </div>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <div className="flex items-center gap-1.5">
              <Zap size={20} color="#a3e635" />
              <span className="font-bold text-primary">Level {gamification?.level || 1} · {gamification?.xp || 0} XP</span>
            </div>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <div className="flex items-center gap-1.5">
              <Trophy size={20} color="#fbbf24" />
              <span className="font-bold text-amber-400">{gamification?.badges?.length || 0} badges</span>
            </div>
          </div>
          <Link to="/badges" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Recent calories', value: totalCalories || 0, unit: 'kcal', icon: Flame, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
            { label: 'Active minutes', value: totalMinutes || 0, unit: 'min', icon: Clock, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
            { label: 'Tracked sets', value: totalSets || 0, unit: 'sets', icon: Dumbbell, color: '#a3e635', bg: 'rgba(163,230,53,0.12)' },
            { label: 'Plan target', value: weeklyPlan?.targetWorkouts || 0, unit: 'weekly', icon: Calendar, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: stat.bg }}>
                  <stat.icon size={16} color={stat.color} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold leading-none text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {announcements.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="mb-3 flex items-center gap-2">
              <Megaphone size={18} color="#fbbf24" />
              <h3 className="text-foreground">Announcements</h3>
            </div>
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-sm font-bold text-foreground">{announcement.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{announcement.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="text-foreground">Recent Workouts</h3>
            <Link to="/history" className="text-sm text-primary transition-colors hover:opacity-80">View all</Link>
          </div>

          {workouts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No workouts yet. Start with your first real log.</div>
          ) : (
            <div>
              {workouts.slice(0, 5).map((workout, index) => {
                const color = typeColor[workout.workoutType] || '#a3e635';
                const setCount = (workout.exercises || []).reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0);
                return (
                  <div
                    key={workout.id}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                    style={{ borderTop: index > 0 ? '1px solid var(--border)' : undefined }}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
                      {workout.workoutType === 'Cardio' ? <Heart size={18} color={color} /> : <Dumbbell size={18} color={color} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{workout.title || workout.workoutType}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(workout.createdAt)} · {workout.durationMinutes} min</p>
                    </div>
                    <div className="hidden text-right text-xs text-muted-foreground sm:block">
                      <p className="text-sm font-semibold text-foreground">{setCount || workout.exercises?.length || 0}</p>
                      <p>{setCount ? 'sets' : 'moves'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-500">{workout.caloriesBurned || workout.calories || 0} kcal</p>
                      <span className="rounded px-2 py-0.5 text-xs" style={{ background: `${color}18`, color }}>
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
    </PageContainer>
  );
};
