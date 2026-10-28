-- ==============================================================================
-- SS TECHWORKS - STAGE 2 MIGRATION: 02_security_rls.sql
-- Row Level Security (RLS) Policies and Role-Based Access Controls
-- ==============================================================================

-- 1. SECURITY DEFINER HELPER: Check if current authenticated user is an administrator
create or replace function public.is_admin()
returns boolean
security definer
set search_path = public
language plpgsql
stable
as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  return exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
end;
$$;

-- Enable RLS on all tables
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.projects enable row level security;
alter table public.enquiries enable row level security;
alter table public.orders enable row level security;
alter table public.deliverables enable row level security;
alter table public.support_tickets enable row level security;
alter table public.site_settings enable row level security;

-- ==============================================================================
-- TABLE POLICIES
-- ==============================================================================

-- 1. USER ROLES
-- Users can view their own role; administrators can view all roles.
create policy "Users can read their own role"
  on public.user_roles for select
  using (auth.uid() = user_id or public.is_admin());

-- No public insert/update allowed on user_roles through API (enforces client default)
create policy "Admins can update roles"
  on public.user_roles for update
  using (public.is_admin())
  with check (public.is_admin());

-- 2. PROFILES
-- Users can view their own profile; admins can view all profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Users can update only their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. SERVICES
-- Public can view active services
create policy "Public can view active services"
  on public.services for select
  using (is_active = true or public.is_admin());

-- Only admins can insert, update, or delete services
create policy "Admins can manage services"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

-- 4. PRICING PLANS
-- Public can view active pricing plans
create policy "Public can view active pricing plans"
  on public.pricing_plans for select
  using (is_active = true or public.is_admin());

-- Only admins can manage pricing plans
create policy "Admins can manage pricing plans"
  on public.pricing_plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5. PROJECTS
-- Public can view only published projects
create policy "Public can view published projects"
  on public.projects for select
  using (is_published = true or public.is_admin());

-- Only admins can create, update, or delete projects
create policy "Admins can manage projects"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- 6. ENQUIRIES
-- Anyone (anonymous or client) can submit a project enquiry
create policy "Public can submit enquiries"
  on public.enquiries for insert
  with check (
    length(trim(full_name)) > 0 and
    length(trim(email)) > 3 and
    length(trim(project_title)) > 0 and
    length(trim(project_description)) >= 10
  );

-- STRICT PRIVACY: Anonymous and clients CANNOT read any enquiries.
-- Only authorized administrators can read, update, or manage enquiries.
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

-- 7. ORDERS
-- Clients can view ONLY their own orders
create policy "Clients can view their own orders"
  on public.orders for select
  using (auth.uid() = client_id or public.is_admin());

-- Only admins can create or update orders (protects agreed_amount and status)
create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- 8. DELIVERABLES
-- Clients can view ONLY their own available deliverables
create policy "Clients can view their own deliverables"
  on public.deliverables for select
  using ((auth.uid() = client_id and is_available = true) or public.is_admin());

-- Only admins can manage deliverables
create policy "Admins can manage deliverables"
  on public.deliverables for all
  using (public.is_admin())
  with check (public.is_admin());

-- 9. SUPPORT TICKETS
-- Clients can view their own tickets; admins can view all
create policy "Clients can view their own support tickets"
  on public.support_tickets for select
  using (auth.uid() = client_id or public.is_admin());

-- Clients can create tickets for themselves
create policy "Clients can create support tickets"
  on public.support_tickets for insert
  with check (auth.uid() = client_id);

-- Only admins can update ticket statuses
create policy "Admins can manage support tickets"
  on public.support_tickets for update
  using (public.is_admin())
  with check (public.is_admin());

-- 10. SITE SETTINGS
-- Public can read site settings (contact info, business parameters)
create policy "Public can view site settings"
  on public.site_settings for select
  using (true);

-- Only admins can update site settings
create policy "Admins can update site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());
