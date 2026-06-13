import { request, API_BASE } from './http';

export interface WeeklyPlan {
  id: string;
  userId: string;
  targetCount: number;
  currentCount: number;
  weekStartDate: string;
}

export const weeklyPlanService = {
  async get(): Promise<WeeklyPlan> {
    return request<WeeklyPlan>(`${API_BASE}/weekly-plan`);
  },

  async update(targetCount: number): Promise<WeeklyPlan> {
    return request<WeeklyPlan>(`${API_BASE}/weekly-plan`, {
      method: 'POST',
      body: JSON.stringify({ targetCount })
    });
  }
};

export interface ProgressSummary {
  totalWorkouts: number;
  totalMinutes: number;
  averageDuration: number;
  level: number;
  xp: number;
  currentStreak: number;
  maxStreak: number;
}

export const progressService = {
  async getSummary(): Promise<ProgressSummary> {
    return request<ProgressSummary>(`${API_BASE}/progress/summary`);
  },

  async getConsistency(): Promise<{ name: string; count: number }[]> {
    return request<{ name: string; count: number }[]>(`${API_BASE}/progress/consistency`);
  },

  async getMoodDistribution(): Promise<{ name: string; value: number }[]> {
    return request<{ name: string; value: number }[]>(`${API_BASE}/progress/mood`);
  },

  async getWorkoutMix(): Promise<{ name: string; value: number }[]> {
    return request<{ name: string; value: number }[]>(`${API_BASE}/progress/workout-mix`);
  }
};

export interface GamificationSummary {
  level: number;
  xp: number;
  currentStreak: number;
  maxStreak: number;
  badgesCount: number;
  nextLevelXp: number;
}

export interface BadgeStatus {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export const gamificationService = {
  async getSummary(): Promise<GamificationSummary> {
    return request<GamificationSummary>(`${API_BASE}/gamification/summary`);
  },

  async getBadges(): Promise<BadgeStatus[]> {
    return request<BadgeStatus[]>(`${API_BASE}/gamification/badges`);
  }
};

