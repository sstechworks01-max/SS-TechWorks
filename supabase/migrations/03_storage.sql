-- ==============================================================================
-- SS TECHWORKS - STAGE 2 MIGRATION: 03_storage.sql
-- Supabase Storage Buckets and Access Control Policies
-- ==============================================================================

-- 1. Create the 4 storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'project-assets',
    'project-assets',
    true,
    20971520, -- 20 MB limit
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  ),
  (
    'enquiry-attachments',
    'enquiry-attachments',
    false,
    10485760, -- 10 MB limit
    array[
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'client-deliverables',
    'client-deliverables',
    false,
    104857600, -- 100 MB limit
    null -- allows binaries, archives, documents
  ),
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB limit
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

-- ==============================================================================
-- STORAGE POLICIES
-- ==============================================================================

-- 1. project-assets (Public view for portfolio; Admin management)
create policy "Public can view project assets"
  on storage.objects for select
  using (bucket_id = 'project-assets');

create policy "Admins can upload project assets"
  on storage.objects for insert
  with check (bucket_id = 'project-assets' and public.is_admin());

create policy "Admins can delete project assets"
  on storage.objects for delete
  using (bucket_id = 'project-assets' and public.is_admin());

-- 2. enquiry-attachments (Public upload with unique uuid prefix; Admin-only read)
create policy "Anyone can upload enquiry attachments"
  on storage.objects for insert
  with check (bucket_id = 'enquiry-attachments');

create policy "Admins can read enquiry attachments"
  on storage.objects for select
  using (bucket_id = 'enquiry-attachments' and public.is_admin());

-- 3. client-deliverables (Strictly private; Admins or signed URLs)
create policy "Admins can manage client deliverables"
  on storage.objects for all
  using (bucket_id = 'client-deliverables' and public.is_admin())
  with check (bucket_id = 'client-deliverables' and public.is_admin());

create policy "Clients can read deliverables in their own directory"
  on storage.objects for select
  using (
    bucket_id = 'client-deliverables'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. avatars (Public read; Users can upload to their own folder)
create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
