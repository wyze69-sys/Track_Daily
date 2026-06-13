import React from 'react';
import { Plus } from 'lucide-react';
import { ActivityLibraryItem } from '../../../services/api';

interface ActivitySuggestionListProps {
  suggestions: ActivityLibraryItem[];
  onSelectActivity: (activity: ActivityLibraryItem) => void;
}

export const ActivitySuggestionList: React.FC<ActivitySuggestionListProps> = ({
  suggestions,
  onSelectActivity
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider font-mono">Suggestions</h3>
      <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {suggestions.map((activity) => (
          <button
            type="button"
            key={activity.id}
            onClick={() => onSelectActivity(activity)}
            className="w-full text-left p-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-white/[0.01] transition-all group flex items-center justify-between gap-2 active:scale-[0.99]"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{activity.name}</p>
              {activity.tags && activity.tags.length > 0 && (
                <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                  {activity.tags.join(' • ')}
                </p>
              )}
            </div>
            <span className="h-5 w-5 rounded bg-muted flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
              <Plus className="h-3 w-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
