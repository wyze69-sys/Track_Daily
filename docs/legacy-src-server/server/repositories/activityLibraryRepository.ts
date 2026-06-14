import { readDatabase, writeDatabase, ActivityLibraryItem } from '../../db/db';

export interface ActivityFilters {
  categoryId?: string;
  categoryName?: string;
  search?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
  includeCustom?: boolean;
  currentUserId?: string;
}

export const activityLibraryRepository = {
  getAll(filters: ActivityFilters = {}): { items: ActivityLibraryItem[]; total: number } {
    const db = readDatabase();
    const activities = db.activityLibrary || [];

    let filtered = [...activities];

    // Filter by isActive
    if (!filters.includeInactive) {
      filtered = filtered.filter(item => item.isActive !== false);
    }

    // Filter by categoryId
    if (filters.categoryId) {
      filtered = filtered.filter(item => item.categoryId === filters.categoryId);
    }

    // Filter by categoryName
    if (filters.categoryName) {
      const lowerCat = filters.categoryName.toLowerCase().trim();
      filtered = filtered.filter(item => item.categoryName.toLowerCase() === lowerCat);
    }

    // Filter by source (exclude custom unless includeCustom is true)
    if (!filters.includeCustom) {
      filtered = filtered.filter(item => item.source !== 'custom');
    }

    // Filter by ownership of custom activities if currentUserId is provided
    if (filters.currentUserId) {
      filtered = filtered.filter(item =>
        item.source !== 'custom' || item.createdByUserId === filters.currentUserId
      );
    }

    // Filter by search query (match name or tags)
    if (filters.search && filters.search.trim() !== '') {
      const query = filters.search.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    const total = filtered.length;

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit !== undefined ? filters.limit : 25;
    const items = filtered.slice(offset, offset + limit);

    return {
      items,
      total
    };
  },

  getById(id: string): ActivityLibraryItem | null {
    const db = readDatabase();
    const activities = db.activityLibrary || [];
    return activities.find(item => item.id === id) || null;
  },

  findByNameAndCategory(normalizedName: string, categoryId: string): ActivityLibraryItem | null {
    const db = readDatabase();
    const activities = db.activityLibrary || [];
    return activities.find(item => 
      item.normalizedName === normalizedName && 
      item.categoryId === categoryId
    ) || null;
  },

  create(item: ActivityLibraryItem): ActivityLibraryItem {
    const db = readDatabase();
    if (!db.activityLibrary) {
      db.activityLibrary = [];
    }
    db.activityLibrary.push(item);
    writeDatabase(db);
    return item;
  },

  update(id: string, updates: Partial<ActivityLibraryItem>): ActivityLibraryItem | null {
    const db = readDatabase();
    const activities = db.activityLibrary || [];
    const index = activities.findIndex(item => item.id === id);
    if (index === -1) return null;

    activities[index] = {
      ...activities[index],
      ...updates
    };
    writeDatabase(db);
    return activities[index];
  }
};
