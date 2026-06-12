import React from 'react';
import { StudentTopNav } from './StudentTopNav';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute && user?.role === 'admin') {
    return (
      <div className="flex bg-slate-50 min-h-screen text-slate-900 leading-normal font-sans">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Student view container with Top Nav
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 leading-normal font-sans">
      <StudentTopNav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 transition-all duration-300">
        {children}
      </main>
      <footer className="w-full text-center py-6 text-xs text-gray-500 border-t border-gray-100 bg-white">
        &copy; 2026 FitSync v2. Simple campus logbook focused on showing up consistently.
      </footer>
    </div>
  );
};
