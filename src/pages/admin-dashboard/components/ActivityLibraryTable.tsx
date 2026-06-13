import React from 'react';
import { Search, Plus, Edit2, CheckCircle2, XCircle, Dumbbell, Shield, User } from 'lucide-react';
import { ExerciseCategory, ActivityLibraryItem } from '../../../services/api';

interface ActivityLibraryTableProps {
  categories: ExerciseCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activities: ActivityLibraryItem[];
  loading: boolean;
  includeInactive: boolean;
  onIncludeInactiveChange: (val: boolean) => void;
  includeCustom: boolean;
  onIncludeCustomChange: (val: boolean) => void;
  onAddClick: () => void;
  onEditClick: (activity: ActivityLibraryItem) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const trackingTypeLabels: { [key: string]: string } = {
  sets_reps_weight: 'Sets & Reps (Weight)',
  duration_distance: 'Duration & Distance',
  duration_focus: 'Duration & Focus',
  duration_intensity: 'Duration & Intensity'
};

const difficultyLabels: { [key: string]: string } = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
};

export const ActivityLibraryTable: React.FC<ActivityLibraryTableProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activities,
  loading,
  includeInactive,
  onIncludeInactiveChange,
  includeCustom,
  onIncludeCustomChange,
  onAddClick,
  onEditClick,
  onToggleStatus
}) => {
  return (
    <div className="space-y-5">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all active:scale-[0.98] ${
              selectedCategoryId === cat.id
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-muted/10 text-muted-foreground border-border hover:bg-muted/30 hover:text-foreground'
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
            />
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => onIncludeInactiveChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border bg-input-background text-primary focus:ring-0"
              />
              Show Inactive
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={includeCustom}
                onChange={(e) => onIncludeCustomChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border bg-input-background text-primary focus:ring-0"
              />
              Show Custom (User)
            </label>
          </div>
        </div>

        {/* Add Activity Button */}
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-xl text-xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Activity
        </button>
      </div>

      {/* Activities Grid/Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/10 text-muted-foreground font-bold uppercase tracking-wider font-mono">
              <th className="p-4">Name</th>
              <th className="p-4">Tracking Type</th>
              <th className="p-4">Tags</th>
              <th className="p-4">Difficulty</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading activities...
                  </div>
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  No activities found matching filters.
                </td>
              </tr>
            ) : (
              activities.map((activity) => {
                const isCustom = activity.source === 'custom';
                return (
                  <tr key={activity.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* Name */}
                    <td className="p-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{activity.name}</span>
                        {!activity.isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-muted/30 text-muted-foreground uppercase border border-border">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tracking Type */}
                    <td className="p-4 text-muted-foreground font-medium">
                      {trackingTypeLabels[activity.trackingType] || activity.trackingType}
                    </td>

                    {/* Tags */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {activity.tags && activity.tags.length > 0 ? (
                          activity.tags.map((tag) => (
                            <span 
                              key={tag} 
                              className="px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground text-[9px] font-bold uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        activity.difficulty === 'advanced' 
                          ? 'border-red-500/20 bg-red-500/10 text-red-400'
                          : activity.difficulty === 'intermediate'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {difficultyLabels[activity.difficulty || 'beginner'] || 'Beginner'}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="p-4 font-bold">
                      {isCustom ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[9px] uppercase">
                          <User size={10} />
                          Custom
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg text-[9px] uppercase">
                          <Shield size={10} />
                          Default
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(activity.id, activity.isActive !== false)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider text-[9px] transition-colors border ${
                          activity.isActive !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {activity.isActive !== false ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Disabled
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => onEditClick(activity)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted/30 transition-all active:scale-95"
                        title="Edit Activity"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
