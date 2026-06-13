import { request, API_BASE } from './http';

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
  trackingType?: string;
  distance?: number;
  pace?: string;
  calories?: number;
  focusArea?: string;
  difficulty?: string;
  intensity?: string;
  notes?: string;
  restTime?: number;
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
  // Real backend calories burned estimation, no client-side calculation to prevent fake calories
  caloriesBurned?: number;
  calorieEstimateSource?: string;
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
