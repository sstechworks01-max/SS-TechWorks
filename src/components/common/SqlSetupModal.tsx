import React, { useState } from 'react';
import { X, CheckCircle2, ExternalLink, Info, ShieldCheck, Database, Code, Check } from './IconHelper';

interface SqlSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTable?: string;
}

export const SqlSetupModal: React.FC<SqlSetupModalProps> = ({
  isOpen,
  onClose,
  targetTable = 'public.projects',
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'full'>('quick');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Standalone, self-contained quick SQL script that defines user_roles and is_admin() FIRST
  // to avoid ERROR 42883: function public.is_admin() does not exist
  const quickSqlSnippet = `-- ==============================================================================
-- SS TECHWORKS - STANDALONE FIX FOR 'public.projects' & 'public.is_admin()'
-- Safe to execute in Supabase -> SQL Editor (Idempotent & Non-destructive)
-- ==============================================================================

-- 1. Ensure uuid-ossp extension exists
create extension if not exists "uuid-ossp";

-- 2. Create user_roles table if missing
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

-- 3. DEFINE public.is_admin() FIRST (Prevents ERROR 42883)
create or replace function public.is_admin()
returns boolean
security definer
set search_path = public, auth
language plpgsql
stable
as $$
declare
  current_uid uuid;
  is_adm boolean;
begin
  current_uid := auth.uid();
  if current_uid is null then
    return false;
  end if;

  select exists (
    select 1
    from public.user_roles
    where user_id = current_uid
      and role = 'admin'
  ) into is_adm;

  return coalesce(is_adm, false);
exception
  when others then
    return false;
end;
$$;

-- Grant execution to anon, authenticated, and service_role
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 4. Enable RLS on user_roles (Non-recursive policy)
alter table public.user_roles enable row level security;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can manage user_roles" on public.user_roles;
create policy "Admins can manage user_roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  category text not null default 'Websites',
  thumbnail_path text,
  gallery_paths jsonb not null default '[]'::jsonb,
  live_demo_url text,
  repository_url text,
  download_path text,
  download_file_name text,
  download_file_size bigint default 0,
  is_published boolean not null default false,
  status text not null default 'in_progress',
  client_id uuid references auth.users(id) on delete set null,
  enquiry_id uuid,
  deadline text,
  milestones jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure all columns exist
alter table public.projects add column if not exists short_description text not null default '';
alter table public.projects add column if not exists description text not null default '';
alter table public.projects add column if not exists category text not null default 'Websites';
alter table public.projects add column if not exists thumbnail_path text;
alter table public.projects add column if not exists gallery_paths jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists live_demo_url text;
alter table public.projects add column if not exists repository_url text;
alter table public.projects add column if not exists download_path text;
alter table public.projects add column if not exists download_file_name text;
alter table public.projects add column if not exists download_file_size bigint default 0;
alter table public.projects add column if not exists is_published boolean not null default false;
alter table public.projects add column if not exists status text not null default 'in_progress';
alter table public.projects add column if not exists client_id uuid references auth.users(id) on delete set null;
alter table public.projects add column if not exists enquiry_id uuid;
alter table public.projects add column if not exists deadline text;
alter table public.projects add column if not exists milestones jsonb not null default '[]'::jsonb;

-- Indexes
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_is_published on public.projects(is_published);

-- 6. Enable RLS on projects
alter table public.projects enable row level security;

drop policy if exists "Public can view published projects" on public.projects;
create policy "Public can view published projects"
  on public.projects for select
  using (is_published = true or public.is_admin() or (client_id is not null and auth.uid() = client_id));

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Grant admin role to sstechworks01@gmail.com (if already registered)
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'sstechworks01@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- 8. FLUSH POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';`;

  const fullMigrationGuide = `-- For the complete multi-table schema (projects, enquiries, quotations, orders, deliverables,
-- support tickets, site settings, notifications, storage buckets, and triggers),
-- open and execute the complete file:
-- supabase/migrations/00_complete_setup.sql

-- You can copy the complete migration file directly from your codebase!`;

  const activeSnippet = activeTab === 'quick' ? quickSqlSnippet : fullMigrationGuide;

  const handleCopy = () => {
    navigator.clipboard.writeText(quickSqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-200 space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supabase SQL Migration: {targetTable}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Execute this script in your Supabase SQL Editor. Defines <code className="text-amber-600 dark:text-amber-300 font-mono">public.is_admin()</code> first to prevent Error 42883.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
            <Info className="w-4 h-4" />
            <span>Resolution for Error 42883 ("function public.is_admin() does not exist")</span>
          </div>
          <p className="leading-relaxed">
            In PostgreSQL, Row Level Security policies that invoke a function require the function to exist <em>before</em> the policy is created. The script below defines <code className="text-amber-700 dark:text-amber-300 font-mono">public.is_admin()</code> and <code className="text-blue-700 dark:text-blue-300 font-mono">public.user_roles</code> at the very top, grants execution to all roles, applies non-recursive policies, and flushes PostgREST's schema cache.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'quick'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Standalone Projects + is_admin() Script
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'full'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Full Migration Notice (All 11 Tables)
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-white uppercase tracking-wider">
              {activeTab === 'quick' ? 'SQL Script (Copy & Run)' : 'Full Migration File'}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <span>Copy SQL Script</span>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-100 dark:bg-[#06080d] border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto max-h-64 leading-relaxed">
            {activeSnippet}
          </pre>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-white block">Instructions:</strong>
          <ol className="list-decimal list-inside space-y-1">
            <li>Copy the SQL script above.</li>
            <li>Open your Supabase Project Dashboard &gt; <strong>SQL Editor</strong>.</li>
            <li>Click <strong>New Query</strong>, paste the script, and click <strong>Run</strong>.</li>
            <li>Return to this page and click <strong>Retry Query</strong>.</li>
          </ol>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
