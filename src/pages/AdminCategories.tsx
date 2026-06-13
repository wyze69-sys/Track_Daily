import React, { useState, useEffect } from 'react';
import { categoryService, ExerciseCategory } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Grid, Trash2, Edit2, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Dumbbell');
  const [description, setDescription] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await categoryService.create({ name, icon, description });
      setName('');
      setDescription('');
      await loadCategories();
    } catch (err: any) {
      setError(err?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? All templates matching this name will lose their classifier mapping.")) {
      return;
    }
    setError(null);
    try {
      await categoryService.delete(id);
      await loadCategories();
    } catch (err: any) {
      setError(err?.message || "Failed to remove category.");
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
                <Grid className="h-5 w-5 text-orange-600" />
                Manage Exercise Categories
              </h1>
              <p className="text-xs text-gray-500 mt-1">Add, update, or remove exercise categories used by logweb workouts.</p>
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
            <h3 className="font-bold text-sm tracking-tight text-slate-900 border-b border-gray-50 pb-2">Add New Category Classifier</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Strength, Cardio, Pilates"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Lucide Icon name String</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                >
                  <option value="Dumbbell">Dumbbell (Weightlifting)</option>
                  <option value="Flame">Flame (Cardio, Calories)</option>
                  <option value="Activity">Activity (Yoga, Pilates)</option>
                  <option value="Trophy">Trophy (Sports, Competition)</option>
                  <option value="Heart">Heart (Wellness, Core)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short explanation for students what exercises fall under this category."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Category Record
              </button>
            </form>
          </div>

          {/* List right */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Active Categories Pool ({categories.length})</h3>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center bg-white rounded-2xl border border-gray-100">No categories registered.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs flex justify-between items-start gap-4 hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-gray-400 font-mono text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">icon: {cat.icon}</span>
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal font-medium">{cat.description || 'No description assigned.'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors shrink-0"
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
