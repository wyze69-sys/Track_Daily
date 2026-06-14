import React, { useState, useEffect } from 'react';
import { progressService, ProgressSummary } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { BarChart3, Clock, Flame, PieChart as PieChartIcon, Loader2 } from 'lucide-react';

export const Progress: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [consistency, setConsistency] = useState<{ name: string; count: number }[]>([]);
  const [workoutMix, setWorkoutMix] = useState<{ name: string; value: number }[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [sum, con, mix] = await Promise.all([
          progressService.getSummary(),
          progressService.getConsistency(),
          progressService.getWorkoutMix()
        ]);
        setSummary(sum);
        setConsistency(con);
        setWorkoutMix(mix.filter(m => m.value > 0)); // Only show non-zero quantities in pie
      } catch (err) {
        console.error("Failed to load progress details", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg border border-border text-xs font-bold text-foreground"
          style={{ background: 'var(--popover)' }}
        >
          {label && <p className="mb-1 text-muted-foreground">{label}</p>}
          <p className="text-primary">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div 
          className="p-5 rounded-2xl border border-border"
          style={{ background: 'var(--card)' }}
        >
          <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Training Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Simple, actionable training visualizers built from your workout history.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Summary Stats Grid */}
            {summary && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Workouts Completed', value: summary.totalWorkouts, sub: 'Saved log sessions' },
                  { label: 'Focused Minutes', value: summary.totalMinutes, sub: 'Minutes active', unit: 'min' },
                  { label: 'Average Duration', value: summary.averageDuration, sub: 'Minutes per workout', unit: 'min' },
                  { label: 'Max Streak Record', value: summary.maxStreak, sub: 'Highest streak record', unit: 'days' }
                ].map((stat) => (
                  <div 
                    key={stat.label} 
                    className="p-5 rounded-2xl border border-border"
                    style={{ background: 'var(--card)' }}
                  >
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-2xl font-black text-foreground">{stat.value}</span>
                      {stat.unit && <span className="text-xs text-muted-foreground">{stat.unit}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recharts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Consistency BarChart */}
              <div 
                className="lg:col-span-2 p-6 rounded-2xl border border-border"
                style={{ background: 'var(--card)' }}
              >
                <h3 className="font-bold text-sm tracking-tight text-foreground mb-6 flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  Consistency Weekly Chart
                </h3>

                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consistency} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
                      <Tooltip content={customTooltip} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={24} name="Workouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Workout mix PieChart */}
              <div 
                className="p-6 rounded-2xl border border-border flex flex-col"
                style={{ background: 'var(--card)' }}
              >
                <h3 className="font-bold text-sm tracking-tight text-foreground mb-6 flex items-center gap-1.5">
                  <PieChartIcon className="h-4.5 w-4.5 text-primary" />
                  Activity Mix Distribution
                </h3>

                <div className="h-56 w-full flex-1 min-h-[220px]">
                  {workoutMix.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-muted-foreground text-xs">
                      <PieChartIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      No classifications logged yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workoutMix}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {workoutMix.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: 'var(--foreground)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </PageContainer>
  );
};
