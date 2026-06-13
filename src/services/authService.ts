import { request, API_BASE } from './http';

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
