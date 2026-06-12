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
  Legend
} from 'recharts';
import { BarChart3, Clock, Flame, PieChart as PieChartIcon, ShieldAlert, Loader2, Award } from 'lucide-react';

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

  const COLORS = ['#0d9488', '#2563eb', '#f97316', '#a855f7', '#ec4899', '#eab308'];

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 flex items-center gap-2">
            <BarChart3 className="h-5.5 w-5.5 text-teal-600" />
            Your Habits Progress Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Simple, actionable data visualizers. No high-pressure bodybuilding telemetry.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Summary Stat banner */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Workouts Completed</p>
                  <p className="text-3xl font-extrabold mt-1 text-gray-950 font-sans">{summary.totalWorkouts}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Focused Minutes</p>
                  <p className="text-3xl font-extrabold mt-1 text-teal-700 font-sans flex items-baseline gap-1.5">
                    {summary.totalMinutes}
                    <span className="text-xs font-mono text-gray-400">min</span>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Average Log Duration</p>
                  <p className="text-3xl font-extrabold mt-1 text-purple-700 font-sans flex items-baseline gap-1.5">
                    {summary.averageDuration}
                    <span className="text-xs font-mono text-gray-400">min</span>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">All-Time Max Streak</p>
                  <p className="text-3xl font-extrabold mt-1 text-orange-600 font-sans flex items-baseline gap-1.5">
                    {summary.maxStreak}
                    <span className="text-xs font-mono text-gray-400">days</span>
                  </p>
                </div>
              </div>
            )}

            {/* Recharts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Consistency BarChart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <h3 className="font-bold text-sm tracking-tight text-gray-900 mb-6 flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-teal-600" />
                  Weekday Consistency Chart
                </h3>

                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consistency} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 leading-normal font-mono">
                  📊 Tracks logging counts per week day (Monday to Sunday) across your full FitSync history logbook.
                </p>
              </div>

              {/* Workout mix PieChart */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
                <h3 className="font-bold text-sm tracking-tight text-gray-900 mb-6 flex items-center gap-1.5">
                  <PieChartIcon className="h-4.5 w-4.5 text-teal-600" />
                  Activity Mix Distribution
                </h3>

                <div className="h-56 w-full flex-1 min-h-[220px]">
                  {workoutMix.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-gray-400 text-xs">
                      <PieChartIcon className="h-8 w-8 text-gray-300 mb-2" />
                      No items classified.
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
                        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'semibold' }} />
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
