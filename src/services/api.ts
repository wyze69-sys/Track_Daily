// logweb v2 Frontend Service API Layer
const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('logweb_token');
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface UserSession {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'student' | 'admin';
    fullName: string;
    avatar: string;
  };
}

export interface UserMeResponse {
  id: string;
  email: string;
  role: 'student' | 'admin';
  fullName: string;
  avatar: string;
  profile: any;
}

export const authService = {
  async register(email: string, passwordHash: string, fullName: string): Promise<UserSession> {
    const res = await request<any>(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordHash, name: fullName })
    });
    return {
      token: res.token,
      user: {
        id: res.user.id,
        email: res.user.email,
        role: res.user.role === 'admin' ? 'admin' : 'student',
        fullName: res.user.name || '',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(res.user.name || '')}`
      }
    };
  },

  async login(email: string, passwordHash: string): Promise<UserSession> {
    const res = await request<any>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordHash })
    });
    return {
      token: res.token,
      user: {
        id: res.user.id,
        email: res.user.email,
        role: res.user.role === 'admin' ? 'admin' : 'student',
        fullName: res.user.name || '',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(res.user.name || '')}`
      }
    };
  },

  async me(): Promise<UserMeResponse> {
    const res = await request<any>(`${API_BASE}/auth/me`);
    return {
      id: res.id,
      email: res.email,
      role: res.role === 'admin' ? 'admin' : 'student',
      fullName: res.name || '',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(res.name || '')}`,
      profile: res
    };
  },

  logout(): void {
    localStorage.removeItem('logweb_token');
    localStorage.removeItem('logweb_user');
  }
};

export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  id?: string;
  categoryId?: string;
  categoryName?: string;
  exerciseName: string;
  duration: number;
  caloriesBurned?: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  userId: string;
  workoutType: string;
  durationMinutes: number;
  moodAfterWorkout: string;
  note: string;
  templateId: string | null;
  xpEarned: number;
  createdAt: string;
  exercises?: WorkoutExercise[];
}

type WorkoutWriteBody = {
  workoutType: string;
  durationMinutes: number;
  moodAfterWorkout?: string;
  note?: string;
  templateId?: string | null;
  exercises?: WorkoutExercise[];
};

export const workoutService = {
  async getAll(): Promise<Workout[]> {
    return request<Workout[]>(`${API_BASE}/workouts`);
  },

  async getRecent(): Promise<Workout[]> {
    return request<Workout[]>(`${API_BASE}/workouts/recent`);
  },

  async getLast(): Promise<Workout | null> {
    return request<Workout | null>(`${API_BASE}/workouts/last`);
  },

  async create(body: WorkoutWriteBody): Promise<{ workout: Workout; profile: any; xpEarned: number }> {
    return request<{ workout: Workout; profile: any; xpEarned: number }>(`${API_BASE}/workouts`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async update(id: string, body: Partial<Workout>): Promise<Workout> {
    return request<Workout>(`${API_BASE}/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE}/workouts/${id}`, {
      method: 'DELETE'
    });
  },

  async quickLog(body: WorkoutWriteBody): Promise<{ workout: Workout; profile: any; xpEarned: number }> {
    return request<{ workout: Workout; profile: any; xpEarned: number }>(`${API_BASE}/workouts/quick-log`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async repeatLast(): Promise<{ workout: Workout; profile: any; xpEarned: number }> {
    return request<{ workout: Workout; profile: any; xpEarned: number }>(`${API_BASE}/workouts/repeat-last`, {
      method: 'POST'
    });
  }
};

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

export const insightService = {
  async getLatest(): Promise<{ text: string; date: string }> {
    return request<{ text: string; date: string }>(`${API_BASE}/insights/latest`);
  },

  async generate(): Promise<{ text: string; date: string }> {
    return request<{ text: string; date: string }>(`${API_BASE}/insights/generate`, {
      method: 'POST'
    });
  }
};

export interface AdminDashboardData {
  totalUsersCount: number;
  totalWorkoutsCount: number;
  totalCategoriesCount: number;
  totalFeedbackCount: number;
  activeStreakCount: number;
  totalXpEarned: number;
  categories: any[];
  recentFeedback: any[];
  recentUsers: any[];
  recentWorkouts: any[];
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    return request<AdminDashboardData>(`${API_BASE}/admin/dashboard`);
  },

  async getUsers(): Promise<any[]> {
    return request<any[]>(`${API_BASE}/admin/users`);
  }
};

export interface ExerciseCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  muscleGroup: string;
  equipment: string;
  exerciseType: string;
  defaultDuration: number;
  isCustom: boolean;
  createdAt: string;
}

export const exerciseLibraryService = {
  async getAll(params: { search?: string; categoryId?: string; exerciseType?: string } = {}): Promise<ExerciseLibraryItem[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.exerciseType) query.set('exerciseType', params.exerciseType);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<ExerciseLibraryItem[]>(`${API_BASE}/exercises${suffix}`);
  },

  async create(body: {
    name: string;
    categoryId?: string | null;
    muscleGroup?: string;
    equipment?: string;
    exerciseType?: string;
    defaultDuration?: number;
  }): Promise<ExerciseLibraryItem> {
    return request<ExerciseLibraryItem>(`${API_BASE}/exercises`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};

export const categoryService = {
  async getAll(): Promise<ExerciseCategory[]> {
    return request<ExerciseCategory[]>(`${API_BASE}/categories`);
  },

  async create(body: { name: string; icon: string; description: string }): Promise<ExerciseCategory> {
    return request<ExerciseCategory>(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async update(id: string, body: Partial<ExerciseCategory>): Promise<ExerciseCategory> {
    return request<ExerciseCategory>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

export interface WorkoutTemplate {
  id: string;
  title?: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  category: string;
  durationMin?: number;
  durationMinutes: number;
  exercises?: WorkoutExercise[];
  isActive?: boolean;
  createdBy?: string;
  createdAt: string;
}

type TemplateQuery = {
  search?: string;
  category?: string;
  mine?: boolean;
};

type TemplateWriteBody = {
  title?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  category?: string;
  durationMin?: number;
  durationMinutes?: number;
  exercises: WorkoutExercise[];
  isActive?: boolean;
};

export const templateService = {
  async getAll(params: TemplateQuery = {}): Promise<WorkoutTemplate[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.mine) query.set('mine', 'true');
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<WorkoutTemplate[]>(`${API_BASE}/templates${suffix}`);
  },

  async create(body: TemplateWriteBody): Promise<WorkoutTemplate> {
    return request<WorkoutTemplate>(`${API_BASE}/templates`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async update(id: string, body: Partial<WorkoutTemplate>): Promise<WorkoutTemplate> {
    return request<WorkoutTemplate>(`${API_BASE}/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE}/templates/${id}`, {
      method: 'DELETE'
    });
  }
};

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetWorkouts: number;
  xpReward: number;
  endDate: string;
}

export const challengeService = {
  async getAll(): Promise<Challenge[]> {
    return request<Challenge[]>(`${API_BASE}/challenges`);
  },

  async create(body: { title: string; description: string; targetWorkouts: number; xpReward: number; endDate: string }): Promise<Challenge> {
    return request<Challenge>(`${API_BASE}/challenges`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async update(id: string, body: Partial<Challenge>): Promise<Challenge> {
    return request<Challenge>(`${API_BASE}/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE}/challenges/${id}`, {
      method: 'DELETE'
    });
  },

  async optIn(id: string): Promise<any> {
    return request<any>(`${API_BASE}/challenges/${id}/opt-in`, {
      method: 'POST'
    });
  },

  async getUserChallenges(): Promise<any[]> {
    return request<any[]>(`${API_BASE}/challenges/user/active`);
  }
};

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const announcementService = {
  async getAll(): Promise<Announcement[]> {
    return request<Announcement[]>(`${API_BASE}/announcements`);
  },

  async create(body: { title: string; content: string }): Promise<Announcement> {
    return request<Announcement>(`${API_BASE}/announcements`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE'
    });
  }
};

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  content: string;
  status: 'pending' | 'reviewed';
  date: string;
}

export const feedbackService = {
  async getAll(): Promise<Feedback[]> {
    return request<Feedback[]>(`${API_BASE}/feedback`);
  },

  async submit(content: string): Promise<Feedback> {
    return request<Feedback>(`${API_BASE}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  async updateStatus(id: string, status: 'pending' | 'reviewed'): Promise<Feedback> {
    return request<Feedback>(`${API_BASE}/feedback/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};
