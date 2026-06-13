import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { StudentLoginPage } from './pages/StudentLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { QuickLog } from './pages/QuickLog';
import { WeeklyPlan } from './pages/WeeklyPlan';
import { History } from './pages/History';
import { Progress } from './pages/Progress';
import { Badges } from './pages/Badges';
import { Profile } from './pages/Profile';
import { ProfileSetup } from './pages/ProfileSetup';
import { NutritionInsights } from './pages/insights/NutritionInsights';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminCategories } from './pages/AdminCategories';
import { AdminTemplates } from './pages/AdminTemplates';
import { AdminChallenges } from './pages/AdminChallenges';
import { AdminAnnouncements } from './pages/AdminAnnouncements';
import { AdminFeedback } from './pages/AdminFeedback';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<StudentLoginPage initialMode="login" />} />
          <Route path="/register" element={<StudentLoginPage initialMode="register" />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Student Auth-Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quick-log"
            element={
              <ProtectedRoute allowedRole="student">
                <QuickLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-plan"
            element={
              <ProtectedRoute allowedRole="student">
                <WeeklyPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRole="student">
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute allowedRole="student">
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights/nutrition"
            element={
              <ProtectedRoute allowedRole="student">
                <NutritionInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <ProtectedRoute allowedRole="student">
                <Badges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRole="student">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/setup"
            element={
              <ProtectedRoute allowedRole="student">
                <ProfileSetup />
              </ProtectedRoute>
            }
          />

          {/* Admin Auth-Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/templates"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminTemplates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/challenges"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminChallenges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminFeedback />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
