import React, { useState, useEffect } from 'react';
import { adminService, feedbackService, AdminDashboardData } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Shield, Users, Trophy, Flame, Zap, MessageSquare, Megaphone, Loader2, CheckCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const dbData = await adminService.getDashboard();
      setData(dbData);
    } catch (err) {
      console.error("Failed to load admin summary indicators", err);
      setError("Failed to fetch administrative data stream.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleResolveFeedback = async (id: string) => {
    try {
      await feedbackService.updateStatus(id, 'reviewed');
      await fetchDashboard();
    } catch (err) {
      console.error("Failed to resolve feedback status", err);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        
        {/* welcome */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white font-bold text-lg shadow-md">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-heading font-black text-white leading-none">Administrative Core Analytics</h1>
              <p className="text-xs text-slate-400 mt-2 font-medium">Platform telemetry aggregates and operational controls.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          </div>
        ) : data && (
          <div className="space-y-6">
            
            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Registered Students</p>
                <div className="flex justify-between items-baseline mt-4">
                  <span className="text-3xl font-extrabold text-slate-950 font-sans">{data.totalUsersCount}</span>
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Total Logged Workouts</p>
                <div className="flex justify-between items-baseline mt-4">
                  <span className="text-3xl font-extrabold text-slate-950 font-sans">{data.totalWorkoutsCount}</span>
                  <Trophy className="h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Active Exercising Streaks</p>
                <div className="flex justify-between items-baseline mt-4">
                  <span className="text-3xl font-extrabold text-orange-600 font-sans">{data.activeStreakCount}</span>
                  <Flame className="h-5 w-5 text-orange-400 fill-orange-50" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Total Campus XP Distributed</p>
                <div className="flex justify-between items-baseline mt-4">
                  <span className="text-3xl font-extrabold text-purple-700 font-sans">{data.totalXpEarned}</span>
                  <Zap className="h-5 w-5 text-purple-400 fill-purple-55" />
                </div>
              </div>

            </div>

            {/* Operational row boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Feedback list */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
                <h3 className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5 border-b border-gray-50 pb-3">
                  <MessageSquare className="h-4.5 w-4.5 text-orange-600" />
                  Recent Student Feedback Loops
                </h3>

                {data.recentFeedback.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No current student feedback logs to review.</p>
                ) : (
                  <div className="space-y-3.5">
                    {data.recentFeedback.map(fb => (
                      <div key={fb.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">From: {fb.userName}</span>
                            <p className="text-xs font-semibold text-gray-850 mt-1">{fb.content}</p>
                            <span className="text-[9px] text-slate-400 block mt-2 font-mono">Submitted: {new Date(fb.date).toLocaleDateString()}</span>
                          </div>

                          {fb.status === 'pending' ? (
                            <button
                              onClick={() => handleResolveFeedback(fb.id)}
                              className="px-2.5 py-1 text-[10px] font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg whitespace-nowrap transition-colors"
                            >
                              Mark Reviewed
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-lg whitespace-nowrap flex items-center gap-0.5">
                              <CheckCircle className="h-3 w-3" /> Reviewed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Workout Categories summary */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5 border-b border-gray-50 pb-3">
                    <Megaphone className="h-4.5 w-4.5 text-orange-600" />
                    Classification Categories
                  </h3>

                  <div className="space-y-2">
                    {data.categories.map(cat => (
                      <div key={cat.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                        <span className="font-extrabold text-gray-900">{cat.name}</span>
                        <span className="text-gray-400 font-mono text-[10px]">Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-teal-50 border border-teal-100 text-teal-800 text-[11px] rounded-xl leading-normal mt-4 font-sans font-medium">
                  🔒 <strong>Privacy Shield Alert:</strong> Student workout journaling descriptions (notes) are kept confidential for personal mental safety and are shielded from detailed lists in admin analytics views.
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </PageContainer>
  );
};
