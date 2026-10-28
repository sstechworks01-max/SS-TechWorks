-- ==============================================================================
-- SS TECHWORKS - STAGE 3 MIGRATION: 05_stage3_admin_enhancements.sql
-- Admin CMS Enhancements: Support Ticket Replies, Order Statuses,
-- Downloadable Project Assets, and Extended Site Settings.
-- ==============================================================================

-- 1. ENHANCE SUPPORT TICKETS WITH ADMIN REPLY SUPPORT
alter table public.support_tickets
  add column if not exists admin_reply text,
  add column if not exists replied_at timestamptz;

-- 2. UPDATE ORDERS STATUS CONSTRAINT
-- Ensure status includes: pending, confirmed, in_progress, review, completed, cancelled
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled'));

-- 3. ENHANCE PROJECTS FOR PUBLIC PROJECT DOWNLOADS
alter table public.projects
  add column if not exists download_file_name text,
  add column if not exists download_file_size bigint default 0;

-- 4. SEED EXTENDED SITE SETTINGS FOR BRAND & SOCIAL MEDIA
insert into public.site_settings (setting_key, setting_value)
values
  ('brand_tagline', '"Building Powerful Digital Experiences"'::jsonb),
  ('official_logo_url', '"/images/ss-techworks-logo.png"'::jsonb),
  ('contact_phone', 'null'::jsonb),
  ('whatsapp_number', 'null'::jsonb),
  ('social_instagram', 'null'::jsonb),
  ('social_youtube', 'null'::jsonb),
  ('social_facebook', 'null'::jsonb),
  ('social_linkedin', 'null'::jsonb),
  ('footer_text', '"We design and develop modern websites, mobile applications, custom software, and AI solutions that help businesses grow."'::jsonb),
  ('copyright_text', '"© SS TECHWORKS. All rights reserved."'::jsonb),
  ('seo_title', '"SS TECHWORKS | Building Powerful Digital Experiences"'::jsonb),
  ('seo_description', '"Professional software development agency specializing in modern web, mobile apps, custom software, and AI solutions."'::jsonb)
on conflict (setting_key) do update set setting_value = excluded.setting_value;

-- 5. ALLOW PUBLIC DOWNLOAD OF AUTHORIZED PUBLIC PROJECT ASSETS
-- Ensures files stored in 'project-assets' bucket can be read by public visitors
create policy if not exists "Public can read project assets objects"
  on storage.objects for select
  using (bucket_id = 'project-assets');
