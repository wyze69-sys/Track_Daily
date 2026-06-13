import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { ActivityLibraryItem } from '../../../services/api';

interface CustomActivityInputProps {
  query: string;
  categoryId: string;
  existingItems: ActivityLibraryItem[];
  onCreateCustomActivity: (name: string) => Promise<void>;
}

export const CustomActivityInput: React.FC<CustomActivityInputProps> = ({
  query,
  categoryId,
  existingItems,
  onCreateCustomActivity
}) => {
  const [saving, setSaving] = useState(false);

  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return null;

  // Check if there is an exact name match in the existing list to avoid adding duplicates
  const hasExactMatch = existingItems.some(
    (item) => item.name.toLowerCase().trim() === trimmedQuery.toLowerCase()
  );

  if (hasExactMatch) return null;

  const handleAddCustom = async () => {
    setSaving(true);
    try {
      await onCreateCustomActivity(trimmedQuery);
    } catch (err) {
      console.error('Failed to add custom activity', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddCustom}
      disabled={saving}
      className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
    >
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Plus className="h-3.5 w-3.5" />
      )}
      Add "{trimmedQuery}" as custom exercise
    </button>
  );
};
