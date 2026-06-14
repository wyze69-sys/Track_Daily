import React, { useMemo } from 'react';
import { Search, Save } from 'lucide-react';
import { WorkoutTemplate, ExerciseCategory } from '../../../services/api';

interface TemplatePickerProps {
  templates: WorkoutTemplate[];
  activeCategory: ExerciseCategory | undefined;
  templateSearch: string;
  selectedTemplateId: string | null;
  onSearchChange: (search: string) => void;
  onSelectTemplate: (tpl: WorkoutTemplate) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  templates,
  activeCategory,
  templateSearch,
  selectedTemplateId,
  onSearchChange,
  onSelectTemplate
}) => {
  const filteredTemplates = useMemo(() => {
    const search = templateSearch.trim().toLowerCase();
    return templates
      .filter((tpl) => !activeCategory?.name || tpl.category === activeCategory.name || tpl.categoryName === activeCategory.name)
      .filter((tpl) => {
        if (!search) return true;
        return [tpl.name, tpl.title, tpl.description, tpl.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .slice(0, 6);
  }, [templates, templateSearch, activeCategory?.name]);

  if (templates.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Templates</p>
          <h3 className="text-sm font-black text-foreground">Load Template</h3>
        </div>
        <Save className="h-4 w-4 text-primary" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={templateSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none"
        />
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filteredTemplates.map((tpl) => (
          <button
            type="button"
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl)}
            className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99] ${
              selectedTemplateId === tpl.id
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border hover:border-primary/20 hover:bg-white/[0.01] text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-foreground">{tpl.name || tpl.title}</p>
              {tpl.createdBy && (
                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  Mine
                </span>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase font-semibold">
              {tpl.category} • {tpl.durationMinutes || tpl.durationMin || 0}m • {tpl.exercises?.length || 0} moves
            </p>
          </button>
        ))}
        {filteredTemplates.length === 0 && (
          <p className="text-xs text-muted-foreground bg-muted/10 rounded-xl p-3 text-center italic">No templates match search.</p>
        )}
      </div>
    </div>
  );
};
