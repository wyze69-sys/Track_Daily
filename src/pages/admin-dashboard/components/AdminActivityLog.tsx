import React from 'react';
import { AdminDashboardData } from '../../../services/api';

interface AdminActivityLogProps {
  data: AdminDashboardData;
}

export const AdminActivityLog: React.FC<AdminActivityLogProps> = ({ data }) => {
  return (
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
                  {workout.createdAt
                    ? new Date(workout.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
