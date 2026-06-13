import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useAdminDashboardData } from './hooks/useAdminDashboardData';
import { AdminKpiGrid } from './components/AdminKpiGrid';
import { FeedbackQueue } from './components/FeedbackQueue';
import { AdminSummaryPanel } from './components/AdminSummaryPanel';
import { AdminShortcutGrid } from './components/AdminShortcutGrid';
import { AdminActivityLog } from './components/AdminActivityLog';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    data,
    categories,
    templates,
    feedbackQueue,
    loading,
    error,
    fetchDashboardData,
    handleResolveFeedback
  } = useAdminDashboardData();

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin data...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* Header */}
        <div
          className="flex flex-col gap-4 rounded-xl p-5 lg:flex-row lg:items-center lg:justify-between"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">Admin Console</h1>
              <p className="text-xs text-muted-foreground">Manage platform categories, workout templates, and student issues.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {user && (
              <div className="text-xs font-semibold text-muted-foreground">
                Signed in as: <span className="font-bold text-foreground">{user.fullName} ({user.email})</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Online</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1 font-bold uppercase tracking-wider text-red-300 hover:text-red-200"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {data && (
          <>
            {/* KPI Cards */}
            <AdminKpiGrid data={data} />

            {/* Content split */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2/3 */}
              <div className="space-y-6 lg:col-span-2">
                <FeedbackQueue
                  feedbackQueue={feedbackQueue}
                  onResolveFeedback={handleResolveFeedback}
                />
                <AdminSummaryPanel
                  categories={categories}
                  templates={templates}
                />
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                <AdminShortcutGrid data={data} />
                <AdminActivityLog data={data} />
              </div>
            </div>
          </>
        )}

      </div>
    </PageContainer>
  );
};
