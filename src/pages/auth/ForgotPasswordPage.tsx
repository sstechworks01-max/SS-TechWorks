import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Info, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from '../../components/common/IconHelper';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setIsLoading(true);
    const { error: resetError } = await resetPasswordForEmail(email.trim());
    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setStatusMessage(
        'Password recovery instructions dispatched. Please check your inbox for the secure reset link to configure your new credentials.'
      );
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
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your registered email to receive a secure recovery link
            </p>
          </div>
        </div>

        {!isSupabaseConfigured() && (
          <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Backend Notice: </strong>
              <span>Supabase environment variables are not yet configured. Password recovery requires <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-300">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-200 space-y-1.5">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recovery Link Dispatched</span>
            </div>
            <p className="leading-relaxed">{statusMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Registered Email
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors shadow-md"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
