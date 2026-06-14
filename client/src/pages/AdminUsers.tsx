import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Users, Trophy, Award, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const uList = await adminService.getUsers();
        setUsers(uList);
      } catch (err) {
        console.error("Failed to load user rosters", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <PageContainer>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-black text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Manage Student Users Roster
              </h1>
              <p className="text-xs text-gray-500 mt-1">Review active students, level achievements, streaks, and platform registration info.</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-orange-850 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Total Accounts: {users.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Role Guard</th>
                    <th className="p-4">Active Level</th>
                    <th className="p-4">Earned XP</th>
                    <th className="p-4">Streak Status</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                      <td className="p-4 text-slate-900 font-bold">{u.fullName}</td>
                      <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                          u.role === 'admin'
                            ? 'bg-orange-50 text-orange-850 border-orange-100'
                            : 'bg-teal-50 text-teal-850 border-teal-100'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">
                        <span className="flex items-center gap-1 font-extrabold">
                          <Trophy className="h-3.5 w-3.5 text-gray-400" />
                          Lvl {u.level}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">
                        <span className="flex items-center gap-1 font-mono text-primary">
                          <Award className="h-3.5 w-3.5" />
                          {u.xp} XP
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">
                        <span className="flex items-center gap-1 text-muted-foreground font-mono">
                          <Calendar className="h-3.5 w-3.5" />
                          {u.currentStreak} days
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[10px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
