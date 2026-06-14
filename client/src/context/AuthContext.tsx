import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, UserSession } from '../services/api';

interface AuthContextType {
  user: {
    id: string;
    email: string;
    role: 'student' | 'admin';
    fullName: string;
    avatar: string;
  } | null;
  loading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  register: (email: string, passwordHash: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      const token = localStorage.getItem('track_daily_token');
      const stored = localStorage.getItem('track_daily_user');
      if (token && stored) {
        try {
          setUser(JSON.parse(stored));
          // Proactively fetch latest status in backend
          const fresh = await authService.me();
          const updatedUser = {
            id: fresh.id,
            email: fresh.email,
            role: fresh.role,
            fullName: fresh.fullName,
            avatar: fresh.avatar
          };
          setUser(updatedUser);
          localStorage.setItem('track_daily_user', JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Token invalid or backend disconnected, logging out", err);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadStoredUser();
  }, []);

  const login = async (email: string, passwordHash: string) => {
    const session = await authService.login(email, passwordHash);
    localStorage.setItem('track_daily_token', session.token);
    localStorage.setItem('track_daily_user', JSON.stringify(session.user));
    setUser(session.user);
  };

  const register = async (email: string, passwordHash: string, fullName: string) => {
    const session = await authService.register(email, passwordHash, fullName);
    localStorage.setItem('track_daily_token', session.token);
    localStorage.setItem('track_daily_user', JSON.stringify(session.user));
    setUser(session.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const fresh = await authService.me();
      const updatedUser = {
        id: fresh.id,
        email: fresh.email,
        role: fresh.role,
        fullName: fresh.fullName,
        avatar: fresh.avatar
      };
      setUser(updatedUser);
      localStorage.setItem('track_daily_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to refresh user credentials", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be called inside an AuthProvider component');
  }
  return context;
};
