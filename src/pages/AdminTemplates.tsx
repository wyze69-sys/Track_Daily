import React, { useState, useEffect } from 'react';
import { templateService, categoryService, WorkoutTemplate, ExerciseCategory } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { FileCode2, Trash2, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(30);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [tpls, cats] = await Promise.all([
        templateService.getAll(),
        categoryService.getAll()
      ]);
      setTemplates(tpls);
      setCategories(cats);
      
      if (cats.length > 0) {
        setCategory(cats[0].name);
      }
    } catch (err) {
      console.error("Failed to load options", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !duration) return;

    setSubmitting(true);
    setError(null);
    try {
      await templateService.create({ name, category, durationMinutes: duration });
      setName('');
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to create workout template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template preset?")) {
      return;
    }
    setError(null);
    try {
      await templateService.delete(id);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to remove workout template.");
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-black text-slate-900 flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-orange-600" />
                Manage Student Workout Presets
              </h1>
              <p className="text-xs text-gray-500 mt-1">Deploy default template guidelines enabling 5-second rapid logs on student dashboards.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-105 text-red-750 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Form left */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-slate-900 border-b border-gray-50 pb-2">Create Rapid Log Preset</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Preset Template Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Campus Jogging Loop, Dorm Squat Routine"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Exercise category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Standard Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                Publish Workouts Preset
              </button>
            </form>
          </div>

          {/* List right */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Active Rapid Presets Pool ({templates.length})</h3>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center bg-white rounded-2xl border border-gray-100">No workout presets registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map(tpl => (
                  <div key={tpl.id} className="bg-white p-4.5 rounded-xl border border-gray-150 shadow-xs flex justify-between items-center gap-4 hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{tpl.name}</h4>
                      <div className="flex gap-2 items-center text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                        <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">{tpl.category}</span>
                        <span>•</span>
                        <span>{tpl.durationMinutes} min Duration</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1.5 text-gray-400 hover:text-red-550 hover:bg-red-550/10 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </PageContainer>
  );
};
