-- ==============================================================================
-- SS TECHWORKS - STAGE 2 MIGRATION: 01_schema.sql
-- Core Schema: Profiles, Roles, Services, Pricing, Projects, Enquiries,
-- Orders, Deliverables, Support Tickets, and Site Settings.
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USER ROLES (Secure RBAC, defaults to 'client')
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

-- Index for fast role lookups
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);

-- 2. PROFILES (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. SERVICES (Active services offered by SS TECHWORKS)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null,
  full_description text not null,
  icon text not null default 'Code2',
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_slug on public.services(slug);
create index if not exists idx_services_is_active on public.services(is_active);

-- 4. PRICING PLANS (Scoped pricing packages & models)
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_id uuid references public.services(id) on delete set null,
  description text not null,
  price_amount numeric, -- null indicates quote-based pricing
  currency text not null default 'USD',
  pricing_type text not null default 'quote',
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pricing_plans_is_active on public.pricing_plans(is_active);

-- 5. PROJECTS (Verified portfolio case studies)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  description text not null,
  category text not null,
  thumbnail_path text,
  gallery_paths jsonb not null default '[]'::jsonb,
  live_demo_url text,
  repository_url text,
  download_path text,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_is_published on public.projects(is_published);

-- 6. ENQUIRIES (Project enquiries submitted via Contact form)
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  whatsapp_number text,
  service_id uuid references public.services(id) on delete set null,
  project_title text not null,
  project_description text not null,
  budget_range text,
  deadline text,
  attachment_path text,
  status text not null default 'new' check (status in ('new', 'under_review', 'quoted', 'in_progress', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_enquiries_status on public.enquiries(status);
create index if not exists idx_enquiries_email on public.enquiries(email);

-- 7. ORDERS (Client contracts and active delivery orders)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  order_title text not null,
  order_description text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'in_review', 'completed', 'cancelled')),
  agreed_amount numeric,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_client_id on public.orders(client_id);
create index if not exists idx_orders_status on public.orders(status);

-- 8. DELIVERABLES (Private deliverables & download artifacts)
create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  client_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  content_type text not null default 'application/octet-stream',
  file_size bigint not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_deliverables_client_id on public.deliverables(client_id);
create index if not exists idx_deliverables_order_id on public.deliverables(order_id);

-- 9. SUPPORT TICKETS (Client support requests)
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_client_id on public.support_tickets(client_id);

-- 10. SITE SETTINGS (Public business contact and configurable parameters)
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_settings_key on public.site_settings(setting_key);

-- AUTOMATIC PROFILE & ROLE CREATION ON USER SIGNUP TRIGGER
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  -- 1. Create client profile
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end;

  -- 2. Create user role as 'client' (never allow client to self-promote to admin)
  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop trigger if existing and attach to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updating timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_modtime on public.profiles;
create trigger update_profiles_modtime before update on public.profiles for each row execute procedure public.handle_updated_at();

drop trigger if exists update_services_modtime on public.services;
create trigger update_services_modtime before update on public.services for each row execute procedure public.handle_updated_at();

drop trigger if exists update_pricing_plans_modtime on public.pricing_plans;
create trigger update_pricing_plans_modtime before update on public.pricing_plans for each row execute procedure public.handle_updated_at();

drop trigger if exists update_projects_modtime on public.projects;
create trigger update_projects_modtime before update on public.projects for each row execute procedure public.handle_updated_at();

drop trigger if exists update_enquiries_modtime on public.enquiries;
create trigger update_enquiries_modtime before update on public.enquiries for each row execute procedure public.handle_updated_at();

drop trigger if exists update_orders_modtime on public.orders;
create trigger update_orders_modtime before update on public.orders for each row execute procedure public.handle_updated_at();

drop trigger if exists update_support_tickets_modtime on public.support_tickets;
create trigger update_support_tickets_modtime before update on public.support_tickets for each row execute procedure public.handle_updated_at();

drop trigger if exists update_site_settings_modtime on public.site_settings;
create trigger update_site_settings_modtime before update on public.site_settings for each row execute procedure public.handle_updated_at();
