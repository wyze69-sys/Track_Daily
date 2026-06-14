import React, { useState, useEffect } from 'react';
import { announcementService, Announcement } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Megaphone, Trash2, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminAnnouncements: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementService.getAll();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load news records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await announcementService.create({ title, content });
      setTitle('');
      setContent('');
      await loadAnnouncements();
    } catch (err: any) {
      setError(err?.message || "Failed to post announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }
    setError(null);
    try {
      await announcementService.delete(id);
      await loadAnnouncements();
    } catch (err: any) {
      setError(err?.message || "Failed to remove announcement.");
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
                <Megaphone className="h-5 w-5 text-orange-600" />
                Publish Announcements & News
              </h1>
              <p className="text-xs text-gray-500 mt-1">Broadcast motivational prompts, tips, gym timing amendments, or group yoga schedules.</p>
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
            <h3 className="font-bold text-sm tracking-tight text-slate-900 border-b border-gray-50 pb-2">Publish Announcement</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Extended gym timing next week"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Content description</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell students details such as locations, guidelines, or motivations!"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                Publish Broadcast News
              </button>
            </form>
          </div>

          {/* List right */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Active Broadcasts Pool ({announcements.length})</h3>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center bg-white rounded-2xl border border-gray-100">No announcements posted yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-white p-5 rounded-xl border border-gray-150 shadow-xs flex justify-between items-start gap-4 hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium mt-1">{ann.content}</p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-2">Posted: {new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(ann.id)}
                      className="p-1.5 text-gray-400 hover:text-red-550 hover:bg-red-50 rounded-lg transition-colors shrink-0"
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
