import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ShieldAlert, Check, Loader2 } from 'lucide-react';
import { nutritionService } from '../services/nutritionService';

interface StudentLoginPageProps {
  initialMode?: 'login' | 'register';
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ initialMode = 'login' }) => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(initialMode === 'register');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync state with prop if route changes
  useEffect(() => {
    setIsRegister(initialMode === 'register');
  }, [initialMode]);

  // Auto navigate on successful auth session
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        nutritionService.getProfile()
          .then((res) => {
            if (res.isIncomplete) {
              navigate('/profile/setup');
            } else {
              navigate('/dashboard');
            }
          })
          .catch((err) => {
            console.error('Failed to get profile status', err);
            navigate('/dashboard');
          });
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
        setSuccess('Account created successfully.');
      } else {
        await login(email, password);
        setSuccess('Signed in successfully.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand visual logo icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-md">
          <Dumbbell className="h-6 w-6" />
        </div>
        
        <h2 className="mt-4 font-sans font-extrabold text-3xl tracking-tight text-foreground">
          logweb <span className="text-primary font-medium text-lg">v2</span>
        </h2>
        
        <p className="mt-2 text-xs text-muted-foreground font-semibold">
          Workout tracking logs for students.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-sm rounded-2xl border border-border sm:px-10">
          {/* Tabs header */}
          <div className="flex border-b border-border mb-6 pb-1">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 text-center pb-2.5 text-sm font-bold border-b-2 transition-all ${
                !isRegister 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 text-center pb-2.5 text-sm font-bold border-b-2 transition-all ${
                isRegister 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground">Email Address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-primary-foreground transition-all bg-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <span className="text-xs text-muted-foreground">Are you an administrator? </span>
            <Link to="/admin/login" className="text-xs text-primary hover:opacity-85 font-semibold underline">
              Admin Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
