import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Activity, ShieldAlert, Check, Loader2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto navigate on successful auth session
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || !password || (isRegister && !fullName)) {
      setError('Please fill in all requested fields.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register(email, password, fullName);
        setSuccess('Account created successfully! Synchronizing system profile...');
      } else {
        await login(email, password);
        setSuccess('Success! Entering campus portal...');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (mode: 'student' | 'admin') => {
    setIsRegister(false);
    if (mode === 'admin') {
      setEmail('admin@fitsync.edu');
      setPassword('admin');
      setIsAdminMode(true);
    } else {
      setEmail('student@fitsync.edu');
      setPassword('password');
      setIsAdminMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-teal-600">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand visual logo icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
          <Dumbbell className="h-6 w-6" />
        </div>
        
        <h2 className="mt-4 font-sans font-extrabold text-3xl tracking-tight text-gray-950">
          FitSync <span className="text-teal-600 font-medium text-lg">v2</span>
        </h2>
        
        <p className="mt-2 text-sm text-gray-500 font-medium">
          {isAdminMode 
            ? 'University Administration Portal' 
            : 'A student logbook to show up consistently.'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-2xl border border-gray-100 sm:px-10">
          {/* Tabs header */}
          <div className="flex border-b border-gray-100 mb-6 pb-1">
            <button
              onClick={() => { setIsRegister(false); setIsAdminMode(false); setError(null); }}
              className={`flex-1 text-center pb-2.5 text-sm font-semibold border-b-2 transition-all ${
                !isRegister && !isAdminMode 
                  ? 'border-teal-500 text-teal-700' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsRegister(true); setIsAdminMode(false); setError(null); }}
              className={`flex-1 text-center pb-2.5 text-sm font-semibold border-b-2 transition-all ${
                isRegister 
                  ? 'border-teal-500 text-teal-700' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setIsRegister(false); setIsAdminMode(true); setError(null); }}
              className={`flex-1 text-center pb-2.5 text-sm font-semibold border-b-2 transition-all ${
                !isRegister && isAdminMode 
                  ? 'border-orange-500 text-orange-700' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Portal Admin
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700">Student full name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Miller"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm shadow-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden bg-gray-50/55"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700">Email Address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdminMode ? "admin@fitsync.edu" : "student@fitsync.edu"}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm shadow-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden bg-gray-50/55"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm shadow-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden bg-gray-50/55"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs focus:outline-hidden transition-all ${
                  isAdminMode 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-teal-600 hover:bg-teal-700'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isRegister ? 'Register Student Sync' : isAdminMode ? 'Authorize Admin Portal' : 'Login Logbook'}
              </button>
            </div>
          </form>

          {/* Quick Demo Assist Links */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-center mb-3">Academic Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDemoCredentials('student')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-100 transition-all"
              >
                🎓 Student Account
              </button>
              <button
                onClick={() => setDemoCredentials('admin')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-850 border border-orange-100 transition-all"
              >
                🔐 Admin Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
