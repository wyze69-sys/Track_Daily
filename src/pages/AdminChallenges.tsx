import React, { useState, useEffect } from 'react';
import { challengeService, Challenge } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Trophy, Trash2, Plus, Loader2, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminChallenges: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCount, setTargetCount] = useState(3);
  const [xpReward, setXpReward] = useState(100);
  const [endDate, setEndDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChallenges = async () => {
    try {
      const data = await challengeService.getAll();
      setChallenges(data);
    } catch (err) {
      console.error("Failed to load challenges", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
    
    // Set default end date
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    setEndDate(weekFromNow.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !endDate) return;

    setSubmitting(true);
    setError(null);
    try {
      await challengeService.create({
        title,
        description,
        targetWorkouts: targetCount,
        xpReward,
        endDate
      });
      setTitle('');
      setDescription('');
      await loadChallenges();
    } catch (err: any) {
      setError(err?.message || "Failed to create challenge");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this challenge? Active student enrollments for this challenge will be removed.")) {
      return;
    }
    setError(null);
    try {
      await challengeService.delete(id);
      await loadChallenges();
    } catch (err: any) {
      setError(err?.message || "Failed to remove challenge.");
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
                <Trophy className="h-5 w-5 text-orange-600" />
                Manage Student Consistency Challenges
              </h1>
              <p className="text-xs text-gray-500 mt-1">Configure physical targets to trigger gamified XP bonuses and reward consistent workout habits.</p>
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
            <h3 className="font-bold text-sm tracking-tight text-slate-900 border-b border-gray-50 pb-2">Create New Active Challenge</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Exam Block Endurance Burst"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Goal Workouts Target</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">XP Points Reward</label>
                <input
                  type="number"
                  required
                  min="20"
                  max="500"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 20)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Explanatory Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Log at least 3 workouts this week to overcome stress during exam weeks!"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                Deploy Student Challenge
              </button>
            </form>
          </div>

          {/* List right */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Active Semester Challenges Pool ({challenges.length})</h3>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
            ) : challenges.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center bg-white rounded-2xl border border-gray-100">No challenges deployed yet.</p>
            ) : (
              <div className="space-y-3">
                {challenges.map(chg => {
                  return (
                    <div key={chg.id} className="bg-white p-5 rounded-xl border border-gray-150 shadow-xs flex justify-between items-start gap-4 hover:border-orange-200 transition-colors">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">{chg.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{chg.description}</p>
                        
                        <div className="flex items-center gap-3 mt-3 text-[10px] font-mono font-bold uppercase">
                          <span className="text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Zap className="h-2.5 w-2.5 fill-purple-100" />
                            +{chg.xpReward} XP Reward
                          </span>
                          <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                            {chg.targetWorkouts} workouts target
                          </span>
                          <span className="text-slate-400">Expires: {chg.endDate}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(chg.id)}
                        className="p-1.5 text-gray-400 hover:text-red-550 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </PageContainer>
  );
};
