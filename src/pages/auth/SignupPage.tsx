import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Info, ArrowRight, AlertTriangle, CheckCircle2 } from '../../components/common/IconHelper';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmationNotice(null);

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const { error: authError, user: newUser } = await signUp(email.trim(), password, name.trim());
    setIsLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      // Check if user confirmed or needs email confirmation
      if (newUser && newUser.identities && newUser.identities.length === 0) {
        setError('An account with this email address already exists.');
      } else if (newUser?.confirmed_at) {
        navigate('/dashboard');
      } else {
        setConfirmationNotice(
          'Account created successfully! If email verification is enabled on your Supabase project, please check your inbox to confirm your email before signing in.'
        );
      }
    }
  };

  return (
    <div className="py-16 md:py-24 max-w-md mx-auto px-4 sm:px-6">
      <div className="p-8 rounded-2xl bg-[#0b0f19] border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block group">
            <img
              src="/assets/aistudio/a_clean_high_resolution_futuristic_tech_logo_bra_0b441d93.png"
              alt="SS TECHWORKS"
              className="w-14 h-14 rounded-full mx-auto ring-2 ring-blue-500/30 group-hover:ring-blue-400 transition-all shadow-lg shadow-blue-500/20"
            />
            <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors block mt-2">
              SS TECHWORKS
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Client Account</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Register to track projects, manage scopes, and download assets
            </p>
          </div>
        </div>

        {!isSupabaseConfigured() && (
          <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Backend Notice: </strong>
              <span>Supabase environment variables are not yet configured. Please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-300">
            {error}
          </div>
        )}

        {confirmationNotice ? (
          <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Registration Successful</span>
            </div>
            <p className="leading-relaxed">{confirmationNotice}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Password (Min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors shadow-md"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
