import React, { useState, useEffect } from 'react';
import { nutritionService, FoodItem } from '../../../services/nutritionService';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export const FoodSearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const handleSearch = async (newOffset = 0) => {
    setLoading(true);
    try {
      const res = await nutritionService.searchFoods(query, limit, newOffset);
      setFoods(res.items || []);
      setTotal(res.total || 0);
      setOffset(newOffset);
    } catch (err) {
      console.error('Failed to search foods', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger initial empty search to show food items
  useEffect(() => {
    handleSearch(0);
  }, []);

  const handlePageChange = (direction: 'next' | 'prev') => {
    const nextOffset = direction === 'next' ? offset + limit : offset - limit;
    if (nextOffset >= 0 && nextOffset < total) {
      handleSearch(nextOffset);
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div
      className="p-6 rounded-2xl border border-border"
      style={{ background: 'var(--card)' }}
    >
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Food Search Panel
      </h2>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(0)}
          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          placeholder="Search dataset foods... (press Enter)"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground">
            No matching food items found in dataset.
          </div>
        ) : (
          foods.map((food) => (
            <div
              key={food.id}
              className="p-3 rounded-xl border border-border/60 bg-background flex items-center justify-between text-xs gap-4"
            >
              <div>
                <h4 className="font-bold text-foreground capitalize">
                  {food.name.replace(/-/g, ' ')}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Serving: {food.serving_size}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex-shrink-0">
                <div className="text-primary">{food.calories} kcal</div>
                <div>P: {food.protein_g}g</div>
                <div>C: {food.carbs_g}g</div>
                <div>F: {food.fat_g}g</div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Page {currentPage} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={offset === 0 || loading}
              className="p-1.5 rounded-lg border border-border hover:bg-background text-muted-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange('next')}
              disabled={offset + limit >= total || loading}
              className="p-1.5 rounded-lg border border-border hover:bg-background text-muted-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
