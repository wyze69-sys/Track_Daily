import React from 'react';
import { Users, Flame, Dumbbell, Trophy } from 'lucide-react';
import { AdminDashboardData } from '../../../services/api';

interface AdminKpiGridProps {
  data: AdminDashboardData;
}

export const AdminKpiGrid: React.FC<AdminKpiGridProps> = ({ data }) => {
  const stats = [
    { label: 'Total Users',      value: data.totalUsersCount ?? 0,    sub: 'Registered student accounts',     icon: Users,    color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
    { label: 'Active Streaks',   value: data.activeStreakCount ?? 0,   sub: 'Students with active streaks',    icon: Flame,    color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
    { label: 'Workouts Logged',  value: data.totalWorkoutsCount ?? 0,  sub: 'All-time workout entries',        icon: Dumbbell, color: '#a3e635', bg: 'rgba(163,230,53,0.08)' },
    { label: 'XP Awarded',       value: data.totalXpEarned ?? 0,       sub: 'Experience points earned',        icon: Trophy,   color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
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
  );
};
