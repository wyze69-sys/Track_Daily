import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Dumbbell, AlertTriangle } from 'lucide-react';
import { useActivityLibraryAdmin } from './admin-dashboard/hooks/useActivityLibraryAdmin';
import { ActivityLibraryTable } from './admin-dashboard/components/ActivityLibraryTable';
import { ActivityEditorModal } from './admin-dashboard/components/ActivityEditorModal';

export const AdminActivityLibrary: React.FC = () => {
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    activities,
    loading,
    error,
    includeInactive,
    setIncludeInactive,
    includeCustom,
    setIncludeCustom,
    modalOpen,
    setModalOpen,
    editingActivity,
    handleSave,
    handleToggleStatus,
    handleOpenCreate,
    handleOpenEdit
  } = useActivityLibraryAdmin();

  return (
    <PageContainer>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div
          className="flex flex-col gap-4 rounded-xl p-5 lg:flex-row lg:items-center lg:justify-between animate-fade-in"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">Activity Library</h1>
              <p className="text-xs text-muted-foreground">Manage default workout activities by category.</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Activities Table */}
        <div 
          className="rounded-xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ActivityLibraryTable
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activities={activities}
            loading={loading}
            includeInactive={includeInactive}
            onIncludeInactiveChange={setIncludeInactive}
            includeCustom={includeCustom}
            onIncludeCustomChange={setIncludeCustom}
            onAddClick={handleOpenCreate}
            onEditClick={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Editor Modal */}
        <ActivityEditorModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categories={categories}
          editingActivity={editingActivity}
          onSave={handleSave}
        />

      </div>
    </PageContainer>
  );
};
