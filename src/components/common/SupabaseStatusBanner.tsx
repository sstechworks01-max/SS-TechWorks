import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, checkSupabaseConnection, ConnectionStatus } from '../../lib/supabase';
import { X } from './IconHelper';

export const SupabaseStatusBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const configured = isSupabaseConfigured();

  const handleTestConnection = async () => {
    setIsTesting(true);
    const result = await checkSupabaseConnection();
    setStatus(result);
    setIsTesting(false);
  };

  useEffect(() => {
    if (configured) {
      checkSupabaseConnection().then(setStatus);
    }
  }, [configured]);

  if (isDismissed && configured) return null;

  return (
    <>
      <div className="w-full bg-blue-50 dark:bg-[#0a0f1d] border-b border-blue-200 dark:border-blue-900/40 text-xs px-4 py-2 flex items-center justify-between gap-4 text-slate-700 dark:text-slate-300 transition-colors">
        <div className="flex items-center gap-2 max-w-4xl truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              configured ? (status?.isConfigured ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-blue-500'
            }`}
          />
          <span className="font-semibold text-slate-900 dark:text-white">Stage 2 Backend:</span>
          <span className="truncate">
            {configured
              ? 'Supabase client connected. Database operations active.'
              : 'Supabase credentials pending in .env. Setup instructions available.'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium underline underline-offset-2 transition-colors whitespace-nowrap"
          >
            Backend Setup & Status
          </button>
          {configured && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl text-slate-800 dark:text-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Supabase Connection Diagnostics</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">SS TECHWORKS Backend Infrastructure</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Environment Configuration:</span>
                <span className={`font-semibold ${configured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {configured ? 'Configured (VITE_SUPABASE_URL found)' : 'Missing / Incomplete'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Database Status:</span>
                <span className="text-slate-800 dark:text-slate-300">
                  {status ? status.message : 'Not yet verified'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <h4 className="font-semibold text-slate-900 dark:text-white">How to connect your Supabase project:</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Create a project on Supabase (<a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">supabase.com</a>).</li>
                <li>Go to <strong>Project Settings &gt; API</strong> and copy your <strong>Project URL</strong> and <strong>anon / public key</strong>.</li>
                <li>Add them to your environment:
                  <pre className="mt-1 p-2 bg-slate-100 dark:bg-[#06080d] border border-slate-200 dark:border-slate-800 rounded font-mono text-[11px] text-slate-800 dark:text-slate-300 overflow-x-auto">
                    VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </pre>
                </li>
                <li>Run the SQL migrations located in <code className="text-blue-600 dark:text-blue-300">/supabase/migrations/</code> in the Supabase SQL Editor.</li>
              </ol>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Connection Now'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
