-- ==============================================================================
-- SS TECHWORKS - COMPLETE DATABASE SETUP & REPAIR MIGRATION (CORRECTED)
-- File: supabase/migrations/00_complete_setup.sql
-- 
-- Run this entire script in your Supabase Project:
-- Dashboard -> SQL Editor -> New query -> Paste and click "Run"
--
-- This script:
-- 1. Defines public.is_admin() FIRST to prevent "ERROR 42883: function does not exist"
-- 2. Eliminates RLS recursion on user_roles
-- 3. Creates/updates all 11 tables with all required columns
-- 4. Establishes robust Row Level Security (RLS) for public, client, and admin roles
-- 5. Configures storage buckets and storage policies
-- 6. Flushes PostgREST schema cache via NOTIFY pgrst, 'reload schema'
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. USER ROLES (FOUNDATION TABLE FOR RBAC)
-- ------------------------------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER: is_admin() FUNCTION (DEFINED BEFORE ANY POLICIES)
-- ------------------------------------------------------------------------------
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

-- Explicitly grant execute permission to anon, authenticated, and service_role
-- so RLS evaluations from both public visitors and signed-in users never throw 42883 or permission errors
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. PROFILES (Linked to auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  phone text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists company text;

-- ------------------------------------------------------------------------------
-- 5. SERVICES (Active services catalog)
-- ------------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null default '',
  full_description text not null default '',
  category text not null default 'Web & Mobile',
  icon text not null default 'Code2',
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services add column if not exists category text not null default 'Web & Mobile';
create index if not exists idx_services_slug on public.services(slug);
create index if not exists idx_services_is_active on public.services(is_active);

-- ------------------------------------------------------------------------------
-- 6. PRICING PLANS (Scoping models & pricing tiers)
-- ------------------------------------------------------------------------------
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_id uuid references public.services(id) on delete set null,
  description text not null default '',
  price_amount numeric,
  currency text not null default 'USD',
  pricing_type text not null default 'quote',
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pricing_plans_is_active on public.pricing_plans(is_active);

-- ------------------------------------------------------------------------------
-- 7. ENQUIRIES (Inbound client briefs with 9-step workflow & notes)
-- ------------------------------------------------------------------------------
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
  status text not null default 'new',
  internal_notes text,
  converted_project_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.enquiries add column if not exists internal_notes text;
alter table public.enquiries add column if not exists attachment_path text;
alter table public.enquiries add column if not exists converted_project_id uuid;

create index if not exists idx_enquiries_status on public.enquiries(status);
create index if not exists idx_enquiries_email on public.enquiries(email);

-- ------------------------------------------------------------------------------
-- 8. PROJECTS (Verified portfolio case studies & active client projects)
-- ------------------------------------------------------------------------------
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
  status text not null default 'in_progress', -- planning, in_progress, review, completed, archived
  client_id uuid references auth.users(id) on delete set null,
  enquiry_id uuid references public.enquiries(id) on delete set null,
  deadline text,
  milestones jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist if table was partially created
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
alter table public.projects add column if not exists enquiry_id uuid references public.enquiries(id) on delete set null;
alter table public.projects add column if not exists deadline text;
alter table public.projects add column if not exists milestones jsonb not null default '[]'::jsonb;

create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_is_published on public.projects(is_published);
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_projects_status on public.projects(status);

-- ------------------------------------------------------------------------------
-- 9. QUOTATIONS (Formal project scopes, estimates & approvals)
-- ------------------------------------------------------------------------------
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.enquiries(id) on delete set null,
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null default '',
  client_email text not null default '',
  title text not null,
  scope_description text not null default '',
  price_amount numeric not null default 0,
  currency text not null default 'USD',
  estimated_delivery text not null default '',
  status text not null default 'draft' check (status in ('draft', 'sent', 'approved', 'rejected')),
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quotations_status on public.quotations(status);
create index if not exists idx_quotations_client_id on public.quotations(client_id);

-- ------------------------------------------------------------------------------
-- 10. ORDERS (Confirmed client contracts)
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  order_title text not null,
  order_description text not null,
  status text not null default 'pending', -- pending, active, in_review, completed, cancelled
  agreed_amount numeric,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists quotation_id uuid references public.quotations(id) on delete set null;

create index if not exists idx_orders_client_id on public.orders(client_id);
create index if not exists idx_orders_status on public.orders(status);

-- ------------------------------------------------------------------------------
-- 11. DELIVERABLES (Private client deliverables & signed downloads)
-- ------------------------------------------------------------------------------
create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  client_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  file_name text not null,
  storage_path text not null,
  content_type text not null default 'application/octet-stream',
  file_size bigint not null default 0,
  version text not null default '1.0',
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.deliverables add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.deliverables add column if not exists version text not null default '1.0';

create index if not exists idx_deliverables_client_id on public.deliverables(client_id);
create index if not exists idx_deliverables_order_id on public.deliverables(order_id);

-- ------------------------------------------------------------------------------
-- 12. SUPPORT TICKETS (Client support & admin replies)
-- ------------------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null,
  message text not null,
  admin_reply text,
  replied_at timestamptz,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets add column if not exists admin_reply text;
alter table public.support_tickets add column if not exists replied_at timestamptz;

create index if not exists idx_support_tickets_client_id on public.support_tickets(client_id);

-- ------------------------------------------------------------------------------
-- 13. SITE SETTINGS (Brand parameters, verified contact info, announcements)
-- ------------------------------------------------------------------------------
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_settings_key on public.site_settings(setting_key);

-- ------------------------------------------------------------------------------
-- 14. ADMIN NOTIFICATIONS (Internal events feed)
-- ------------------------------------------------------------------------------
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- enquiry, order, support, project
  title text not null,
  message text not null,
  reference_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_notifications_is_read on public.admin_notifications(is_read);

-- ------------------------------------------------------------------------------
-- 15. DATABASE TRIGGERS
-- ------------------------------------------------------------------------------
-- Auto-create profile & default client role on auth.users insert
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public, auth
language plpgsql
as $$
begin
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

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for auto-updating updated_at
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

drop trigger if exists update_quotations_modtime on public.quotations;
create trigger update_quotations_modtime before update on public.quotations for each row execute procedure public.handle_updated_at();

drop trigger if exists update_orders_modtime on public.orders;
create trigger update_orders_modtime before update on public.orders for each row execute procedure public.handle_updated_at();

drop trigger if exists update_support_tickets_modtime on public.support_tickets;
create trigger update_support_tickets_modtime before update on public.support_tickets for each row execute procedure public.handle_updated_at();

drop trigger if exists update_site_settings_modtime on public.site_settings;
create trigger update_site_settings_modtime before update on public.site_settings for each row execute procedure public.handle_updated_at();

-- Trigger for auto-creating admin notifications on new enquiry
create or replace function public.notify_on_new_enquiry()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.admin_notifications (type, title, message, reference_id)
  values (
    'enquiry',
    'New Project Enquiry',
    concat(new.full_name, ' submitted a brief: ', new.project_title),
    new.id::text
  );
  return new;
end;
$$;

drop trigger if exists on_new_enquiry_notify on public.enquiries;
create trigger on_new_enquiry_notify
  after insert on public.enquiries
  for each row execute procedure public.notify_on_new_enquiry();

-- ------------------------------------------------------------------------------
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.projects enable row level security;
alter table public.enquiries enable row level security;
alter table public.quotations enable row level security;
alter table public.orders enable row level security;
alter table public.deliverables enable row level security;
alter table public.support_tickets enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_notifications enable row level security;

-- Drop existing policies to prevent conflicts or duplicates
drop policy if exists "Users can read their own role" on public.user_roles;
drop policy if exists "Admins can update roles" on public.user_roles;
drop policy if exists "Admins can manage user_roles" on public.user_roles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Public can view active services" on public.services;
drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Public can view active pricing plans" on public.pricing_plans;
drop policy if exists "Admins can manage pricing plans" on public.pricing_plans;
drop policy if exists "Public can view published projects" on public.projects;
drop policy if exists "Admins can manage projects" on public.projects;
drop policy if exists "Public can submit enquiries" on public.enquiries;
drop policy if exists "Admins can read enquiries" on public.enquiries;
drop policy if exists "Admins can update enquiries" on public.enquiries;
drop policy if exists "Admins can delete enquiries" on public.enquiries;
drop policy if exists "Clients can view their own quotations" on public.quotations;
drop policy if exists "Admins can manage quotations" on public.quotations;
drop policy if exists "Clients can view their own orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;
drop policy if exists "Clients can view their own deliverables" on public.deliverables;
drop policy if exists "Admins can manage deliverables" on public.deliverables;
drop policy if exists "Clients can view their own support tickets" on public.support_tickets;
drop policy if exists "Clients can create support tickets" on public.support_tickets;
drop policy if exists "Admins can manage support tickets" on public.support_tickets;
drop policy if exists "Public can view site settings" on public.site_settings;
drop policy if exists "Admins can update site settings" on public.site_settings;
drop policy if exists "Admins can manage notifications" on public.admin_notifications;

-- 16.1 user_roles
-- CRITICAL ANTI-RECURSION: users can only select their own role based on auth.uid() = user_id.
-- This does NOT call is_admin() and therefore NEVER causes recursive loop errors!
create policy "Users can read their own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can manage user_roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.2 profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 16.3 services
create policy "Public can view active services"
  on public.services for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage services"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.4 pricing_plans
create policy "Public can view active pricing plans"
  on public.pricing_plans for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage pricing plans"
  on public.pricing_plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.5 projects
create policy "Public can view published projects"
  on public.projects for select
  using (is_published = true or public.is_admin() or (client_id is not null and auth.uid() = client_id));

create policy "Admins can manage projects"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.6 enquiries
create policy "Public can submit enquiries"
  on public.enquiries for insert
  with check (
    length(trim(full_name)) > 0 and
    length(trim(email)) > 3 and
    length(trim(project_title)) > 0 and
    length(trim(project_description)) >= 10
  );

create policy "Admins can read enquiries"
  on public.enquiries for select
  using (public.is_admin());

create policy "Admins can update enquiries"
  on public.enquiries for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete enquiries"
  on public.enquiries for delete
  using (public.is_admin());

-- 16.7 quotations
create policy "Clients can view their own quotations"
  on public.quotations for select
  using (auth.uid() = client_id or public.is_admin());

create policy "Admins can manage quotations"
  on public.quotations for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.8 orders
create policy "Clients can view their own orders"
  on public.orders for select
  using (auth.uid() = client_id or public.is_admin());

create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.9 deliverables
create policy "Clients can view their own deliverables"
  on public.deliverables for select
  using ((auth.uid() = client_id and is_available = true) or public.is_admin());

create policy "Admins can manage deliverables"
  on public.deliverables for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.10 support_tickets
create policy "Clients can view their own support tickets"
  on public.support_tickets for select
  using (auth.uid() = client_id or public.is_admin());

create policy "Clients can create support tickets"
  on public.support_tickets for insert
  with check (auth.uid() = client_id);

create policy "Admins can manage support tickets"
  on public.support_tickets for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.11 site_settings
create policy "Public can view site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- 16.12 admin_notifications
create policy "Admins can manage notifications"
  on public.admin_notifications for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 17. SEED SERVICES, PRICING, AND SITE SETTINGS
-- ------------------------------------------------------------------------------
insert into public.services (name, slug, short_description, full_description, category, icon, display_order)
values
  ('Website Development', 'website-development', 'High-performance, bespoke web platforms engineered for speed, responsiveness, and brand impact.', 'We build responsive, fast-loading, and standards-compliant web applications and business sites.', 'Web & Mobile', 'Globe', 1),
  ('Android App Development', 'android-app-development', 'Native and cross-platform Android mobile applications designed for fluid touch interaction and device efficiency.', 'Our Android development services focus on building dependable, battery-efficient mobile applications.', 'Web & Mobile', 'Smartphone', 2),
  ('Custom Software Development', 'custom-software', 'Tailored enterprise software, internal management tools, and automated pipelines designed around your business logic.', 'When off-the-shelf software falls short, we architect tailored digital systems that match your exact operational requirements.', 'Software & AI', 'Cpu', 3),
  ('AI Tools and Applications', 'ai-tools', 'Intelligent automation, natural language workflows, and custom algorithmic integrations embedded into your web apps.', 'We architect and build interfaces that harness generative and analytical AI capabilities to automate business tasks.', 'Software & AI', 'Sparkles', 4),
  ('E-commerce Website Development', 'ecommerce', 'Conversion-optimized digital storefronts with structured catalogs, cart flows, and secure checkout architectures.', 'We build digital storefronts designed to convert visitors into loyal customers.', 'Web & Mobile', 'ShoppingBag', 5),
  ('AI Photo Generation', 'ai-photo-generation', 'Custom AI image synthesis pipelines for commercial product staging, conceptual art, and brand visuals.', 'We design custom generative image pipelines for businesses that need high-volume, brand-consistent visual assets.', 'Media & Creative', 'Image', 6),
  ('AI Video Generation', 'ai-video-generation', 'Generative video sequences, animated product showcases, and dynamic motion assets generated via next-gen video models.', 'Bring static creative assets to life using cutting-edge generative video pipelines.', 'Media & Creative', 'Video', 7),
  ('Photo Editing', 'photo-editing', 'Professional image enhancement, color grading, background isolation, and commercial retouching services.', 'High-quality photography is essential for credibility. Our photo editing service provides precision retouching and background removal.', 'Media & Creative', 'Camera', 8),
  ('Video Editing', 'video-editing', 'Full-service post-production, dynamic cutting, sound design, color grading, and social reel optimization.', 'Transform raw footage into compelling brand stories. We provide comprehensive video post-production services.', 'Media & Creative', 'Film', 9)
on conflict (slug) do nothing;

insert into public.pricing_plans (name, description, price_amount, currency, pricing_type, features, display_order)
values
  ('MVP & Prototype Scoping', 'Ideal for early-stage startups and businesses validating new concepts or launching an initial market version.', null, 'USD', 'quote', '["Discovery & requirement specification", "Responsive web or mobile client interface", "Core user flow & state logic", "Pre-configured deployment pipeline", "Handover documentation"]'::jsonb, 1),
  ('Full-Scale Custom System', 'Comprehensive software development for growing businesses requiring custom business logic and database architecture.', null, 'USD', 'quote', '["Complete system architecture & DB schema", "Full-stack application with API integrations", "Role-based access control & authentication", "Automated testing & performance tuning", "Production staging & release rollout"]'::jsonb, 2),
  ('Enterprise & Media Pipelines', 'High-availability software infrastructure, specialized AI tool calling, or multi-format creative production.', null, 'USD', 'quote', '["Bespoke software automation & algorithms", "High-throughput data & media queues", "Security hardening & compliance audit", "SLA-backed milestone delivery schedule", "Dedicated sprint engineering cycles"]'::jsonb, 3)
on conflict do nothing;

insert into public.site_settings (setting_key, setting_value)
values
  ('business_name', '"SS TECHWORKS"'::jsonb),
  ('brand_tagline', '"Ideas to Digital Solutions"'::jsonb),
  ('contact_email', '"sstechworks01@gmail.com"'::jsonb),
  ('contact_phone', 'null'::jsonb),
  ('whatsapp_number', 'null'::jsonb),
  ('social_links', '{"github": "", "linkedin": "", "twitter": ""}'::jsonb),
  ('announcement_banner', '{"enabled": false, "text": ""}'::jsonb),
  ('business_type', '"Software Development, Web Development, Mobile Apps, Custom Software, and AI Solutions"'::jsonb)
on conflict (setting_key) do update set setting_value = excluded.setting_value;

-- ------------------------------------------------------------------------------
-- 18. STORAGE BUCKETS
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-assets', 'project-assets', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('enquiry-attachments', 'enquiry-attachments', false, 10485760, array['application/pdf', 'application/zip', 'application/x-zip-compressed', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('client-deliverables', 'client-deliverables', false, 104857600, null),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Public can view project assets" on storage.objects;
drop policy if exists "Admins can upload project assets" on storage.objects;
drop policy if exists "Admins can delete project assets" on storage.objects;
drop policy if exists "Anyone can upload enquiry attachments" on storage.objects;
drop policy if exists "Admins can read enquiry attachments" on storage.objects;
drop policy if exists "Admins can manage client deliverables" on storage.objects;
drop policy if exists "Clients can read deliverables in their own directory" on storage.objects;
drop policy if exists "Public can view avatars" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;

create policy "Public can view project assets"
  on storage.objects for select
  using (bucket_id = 'project-assets');

create policy "Admins can upload project assets"
  on storage.objects for insert
  with check (bucket_id = 'project-assets' and public.is_admin());

create policy "Admins can delete project assets"
  on storage.objects for delete
  using (bucket_id = 'project-assets' and public.is_admin());

create policy "Anyone can upload enquiry attachments"
  on storage.objects for insert
  with check (bucket_id = 'enquiry-attachments');

create policy "Admins can read enquiry attachments"
  on storage.objects for select
  using (bucket_id = 'enquiry-attachments' and public.is_admin());

create policy "Admins can manage client deliverables"
  on storage.objects for all
  using (bucket_id = 'client-deliverables' and public.is_admin())
  with check (bucket_id = 'client-deliverables' and public.is_admin());

create policy "Clients can read deliverables in their own directory"
  on storage.objects for select
  using (bucket_id = 'client-deliverables' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text);

-- ------------------------------------------------------------------------------
-- 19. GRANT INITIAL ADMIN ROLE TO sstechworks01@gmail.com (IF REGISTERED)
-- ------------------------------------------------------------------------------
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'sstechworks01@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- ------------------------------------------------------------------------------
-- 20. RELOAD POSTGREST SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
