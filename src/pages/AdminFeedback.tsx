import React, { useState, useEffect } from 'react';
import { feedbackService, Feedback } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { MessageSquare, Check, X, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminFeedback: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = async () => {
    try {
      const list = await feedbackService.getAll();
      setFeedback(list);
    } catch (err) {
      console.error("Failed to load feedback collection", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'reviewed' | 'pending') => {
    setError(null);
    try {
      await feedbackService.updateStatus(id, status);
      await loadFeedback();
    } catch (err: any) {
      setError(err?.message || "Failed to revise review note status.");
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
                <MessageSquare className="h-5 w-5 text-orange-600" />
                Review Student Feedback Loops
              </h1>
              <p className="text-xs text-gray-500 mt-1">Audit feature recommendations, habit extensions, and academic reviews from students.</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-orange-850 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Total Logs: {feedback.length}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-105 text-red-750 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-250 rounded-2xl p-16 text-center text-gray-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold">No feedback records found on the network.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {feedback.map(fb => {
              const isPending = fb.status === 'pending';
              return (
                <div key={fb.id} className="bg-white p-5 rounded-xl border border-gray-150 shadow-xs flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono tracking-wide font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        Student: {fb.userName}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(fb.date || Date.now()).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-relaxed pt-1.5">{fb.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    {isPending ? (
                      <button
                        onClick={() => handleUpdateStatus(fb.id, 'reviewed')}
                        className="px-3 py-1 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark Reviewed
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-xl flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-teal-600" /> Resolved
                        </span>
                        
                        <button
                          onClick={() => handleUpdateStatus(fb.id, 'pending')}
                          className="px-2 py-1 text-[10px] font-bold border border-gray-100 text-gray-400 hover:bg-gray-50 rounded-lg"
                          title="Restore to pending status"
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageContainer>
  );
};
