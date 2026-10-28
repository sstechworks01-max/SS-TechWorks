import React, { useState } from 'react';
import { CheckCircle2, Info, ShieldCheck, X } from './IconHelper';

export const StageStatusModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md transition-colors"
        aria-label="View Stage 2 Implementation Status"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Stage 2 Backend Status</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl text-slate-800 dark:text-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stage 2 Technical Status & Backend Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">SS TECHWORKS Production Implementation</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close status dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-6 text-sm">
              <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span>
                  Stage 2 delivers real backend integrations using Supabase. All database schemas, RLS policies, storage bucket configs, and client operations are wired.
                </span>
              </div>

              {/* Category A */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CATEGORY A · IMPLEMENTED & CONNECTED TO BACKEND</span>
                </div>
                <ul className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Supabase Client Module:</strong> Centralized client (<code>src/lib/supabase.ts</code>) reading <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code> with non-crashing safe fallback.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Supabase Authentication:</strong> Email/password signup, login, session persistence, password reset flow, and protected client routes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Role-Based Access Control:</strong> Default 'client' role via PostgreSQL trigger. Real admin authorization verified via database security policies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Database Migrations & RLS:</strong> Complete SQL migrations (<code>00_complete_setup.sql</code>) covering all tables with strict RLS isolation and admin checks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Real Project Enquiry Submission:</strong> Inserts directly into <code>enquiries</code> table with optional upload to private <code>enquiry-attachments</code> storage bucket.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Real Portfolio & Services Data:</strong> Fetches published projects and active services/plans directly from database.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Client Portal & Signed Downloads:</strong> Live queries for client orders, support ticket creation, profile updates, and on-demand short-lived signed URLs for deliverables.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span><strong>Theme Customization:</strong> Global dark and light mode toggle with system preference fallback and instant anti-FOUC initialization.</span>
                  </li>
                </ul>
              </div>

              {/* Category B & C */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CATEGORY C · AWAITING EXTERNAL SERVICE PROVIDERS (STAGE 3)</span>
                </div>
                <ul className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400">🔒</span>
                    <span><strong>Admin Dashboard CRUD & CMS:</strong> Full admin project creation, status updating, and invoice issuing available in Admin Power Panel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400">🔒</span>
                    <span><strong>Transactional Email Service:</strong> Direct outbound SMTP / Resend integration for automated confirmation notifications upon enquiry.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Close Status Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
