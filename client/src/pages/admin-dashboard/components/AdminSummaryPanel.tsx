import React, { useState } from 'react';
import { Clock, Dumbbell, Flame, Tag, Trophy } from 'lucide-react';
import { ExerciseCategory, WorkoutTemplate } from '../../../services/api';

interface AdminSummaryPanelProps {
  categories: ExerciseCategory[];
  templates: WorkoutTemplate[];
}

function getCategoryIcon(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'dumbbell':  return <Dumbbell className="h-4 w-4" />;
    case 'flame':     return <Flame className="h-4 w-4" />;
    case 'sparkles':
    case 'trophy':    return <Trophy className="h-4 w-4" />;
    default:          return <Tag className="h-4 w-4" />;
  }
}

export const AdminSummaryPanel: React.FC<AdminSummaryPanelProps> = ({ categories, templates }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'templates'>('categories');

  return (
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
            onClick={() => setActiveTab('categories')}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              activeTab === 'categories' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              activeTab === 'templates' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Workout Templates ({templates.length})
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'categories' ? (
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
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      {cat.description || 'No description supplied.'}
                    </p>
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
  );
};
