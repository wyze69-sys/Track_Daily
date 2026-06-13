import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Shield, ShieldAlert, Check, Loader2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto navigate on successful admin session
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all requested fields.');
      setLoading(false);
      return;
    }

    try {
      // First verify role using authService.login directly to avoid leaking student session into context
      const session = await authService.login(email, password);
      if (session.user.role !== 'admin') {
        logout(); // clear any existing session if present
        setError('This account is not an admin account.');
        setLoading(false);
        return;
      }
      
      // If admin, proceed with standard login to update context
      await login(email, password);
      setSuccess('Signed in successfully.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-amber-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand visual shield logo icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-md">
          <Shield className="h-6 w-6" />
        </div>
        
        <h2 className="mt-4 font-sans font-extrabold text-3xl tracking-tight text-foreground">
          logweb <span className="text-amber-500 font-medium text-lg font-mono">Admin</span>
        </h2>
        
        <p className="mt-2 text-xs text-muted-foreground font-semibold">
          Console operator login.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-xl rounded-2xl border border-border sm:px-10">
          <h3 className="text-sm font-black text-foreground mb-6 border-b border-border pb-3 flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-amber-500" />
            Console Operator Access
          </h3>

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

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground">Console Username</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-foreground text-sm focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground">Access Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-foreground text-sm focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-background bg-amber-550 hover:brightness-95 transition-all bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In to Console
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <span className="text-xs text-muted-foreground">Are you a student? </span>
            <Link to="/login" className="text-xs text-primary hover:opacity-85 font-semibold underline">
              Go to user login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
