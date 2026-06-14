import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ExerciseCategory, ActivityLibraryItem } from '../../../services/api';

interface ActivityEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExerciseCategory[];
  editingActivity: ActivityLibraryItem | null;
  onSave: (data: {
    name: string;
    categoryId: string;
    trackingType: string;
    tags: string[];
    difficulty?: string;
    isActive?: boolean;
    defaultMet?: number;
    distanceMultiplier?: number;
    bodyweightFactor?: number;
    calorieMethod?: string;
    intensityLevel?: string;
    estimateConfidence?: string;
  }) => Promise<void>;
}

export const ActivityEditorModal: React.FC<ActivityEditorModalProps> = ({
  isOpen,
  onClose,
  categories,
  editingActivity,
  onSave
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [trackingType, setTrackingType] = useState('sets_reps_weight');
  const [tagsInput, setTagsInput] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [isActive, setIsActive] = useState(true);
  const [defaultMet, setDefaultMet] = useState('');
  const [distanceMultiplier, setDistanceMultiplier] = useState('');
  const [bodyweightFactor, setBodyweightFactor] = useState('');
  const [calorieMethod, setCalorieMethod] = useState('');
  const [intensityLevel, setIntensityLevel] = useState('');
  const [estimateConfidence, setEstimateConfidence] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with editingActivity when it changes
  useEffect(() => {
    if (editingActivity) {
      setName(editingActivity.name);
      setCategoryId(editingActivity.categoryId);
      setTrackingType(editingActivity.trackingType);
      setTagsInput(editingActivity.tags ? editingActivity.tags.join(', ') : '');
      setDifficulty(editingActivity.difficulty || 'beginner');
      setIsActive(editingActivity.isActive !== false);
      setDefaultMet(editingActivity.defaultMet !== undefined ? String(editingActivity.defaultMet) : '');
      setDistanceMultiplier(editingActivity.distanceMultiplier !== undefined ? String(editingActivity.distanceMultiplier) : '');
      setBodyweightFactor(editingActivity.bodyweightFactor !== undefined ? String(editingActivity.bodyweightFactor) : '');
      setCalorieMethod(editingActivity.calorieMethod || '');
      setIntensityLevel(editingActivity.intensityLevel || '');
      setEstimateConfidence(editingActivity.estimateConfidence || '');
    } else {
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setTrackingType('sets_reps_weight');
      setTagsInput('');
      setDifficulty('beginner');
      setIsActive(true);
      setDefaultMet('');
      setDistanceMultiplier('');
      setBodyweightFactor('');
      setCalorieMethod('');
      setIntensityLevel('');
      setEstimateConfidence('');
    }
    setError(null);
  }, [editingActivity, categories, isOpen]);

  // Set default category when categories load
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    // Input Validation
    let parsedDefaultMet: number | undefined = undefined;
    if (defaultMet !== '') {
      parsedDefaultMet = Number(defaultMet);
      if (isNaN(parsedDefaultMet) || parsedDefaultMet < 0) {
        setError('MET value must be a number greater than or equal to 0.');
        return;
      }
    }

    let parsedDistanceMultiplier: number | undefined = undefined;
    if (distanceMultiplier !== '') {
      parsedDistanceMultiplier = Number(distanceMultiplier);
      if (isNaN(parsedDistanceMultiplier) || parsedDistanceMultiplier < 0) {
        setError('Distance Multiplier must be a number greater than or equal to 0.');
        return;
      }
    }

    let parsedBodyweightFactor: number | undefined = undefined;
    if (bodyweightFactor !== '') {
      parsedBodyweightFactor = Number(bodyweightFactor);
      if (isNaN(parsedBodyweightFactor) || parsedBodyweightFactor < 0) {
        setError('Bodyweight Factor must be a number greater than or equal to 0.');
        return;
      }
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await onSave({
        name: trimmedName,
        categoryId,
        trackingType,
        tags,
        difficulty: difficulty || undefined,
        isActive,
        defaultMet: parsedDefaultMet,
        distanceMultiplier: parsedDistanceMultiplier,
        bodyweightFactor: parsedBodyweightFactor,
        calorieMethod: calorieMethod || undefined,
        intensityLevel: intensityLevel || undefined,
        estimateConfidence: estimateConfidence || undefined
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save activity.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-black text-foreground">
            {editingActivity ? 'Edit Activity' : 'Add Activity'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-muted-foreground">Activity Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Bench Press"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground">Category</label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground">Tracking Type</label>
              <select 
                value={trackingType}
                onChange={(e) => setTrackingType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
              >
                <option value="sets_reps_weight">Sets, Reps, Weight</option>
                <option value="duration_distance">Duration & Distance</option>
                <option value="duration_focus">Duration & Focus</option>
                <option value="duration_intensity">Duration & Intensity</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground">Difficulty (Optional)</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground">Tags (Comma separated)</label>
              <input 
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Chest, Barbell, Upper"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
              />
            </div>
          </div>

          {/* Calorie Metadata Section */}
          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">Calorie Metadata (Optional)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">Default MET</label>
                <input 
                  type="number"
                  step="any"
                  value={defaultMet}
                  onChange={(e) => setDefaultMet(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">Calorie Method</label>
                <select 
                  value={calorieMethod}
                  onChange={(e) => setCalorieMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
                >
                  <option value="">None / Default category MET</option>
                  <option value="met_duration">MET * Duration</option>
                  <option value="distance_weight">Distance * Weight</option>
                  <option value="strength_volume_adjusted">Strength Volume Adjusted</option>
                  <option value="met_duration_intensity">MET * Duration * Intensity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">Dist Mult</label>
                <input 
                  type="number"
                  step="any"
                  value={distanceMultiplier}
                  onChange={(e) => setDistanceMultiplier(e.target.value)}
                  placeholder="e.g. 1.0"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">BW Factor</label>
                <input 
                  type="number"
                  step="any"
                  value={bodyweightFactor}
                  onChange={(e) => setBodyweightFactor(e.target.value)}
                  placeholder="e.g. 0.65"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">Intensity</label>
                <select 
                  value={intensityLevel}
                  onChange={(e) => setIntensityLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
                >
                  <option value="">None</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground">Estimate Confidence</label>
              <select 
                value={estimateConfidence}
                onChange={(e) => setEstimateConfidence(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
              >
                <option value="">None / Fallback</option>
                <option value="exact">Exact</option>
                <option value="close_match">Close Match</option>
                <option value="fallback">Fallback</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-input-background text-primary focus:ring-0"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-foreground cursor-pointer">
              Active / Visible to users
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold border border-border rounded-xl hover:bg-muted/30 transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold bg-primary hover:brightness-110 text-primary-foreground rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
