import { request, API_BASE } from './http';

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
