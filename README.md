# SS TECHWORKS — Stage 2: Supabase Backend Integration

This repository contains the production web application for **SS TECHWORKS**, engineered with React, TypeScript, Tailwind CSS, and powered by **Supabase** (PostgreSQL, Supabase Auth, Row Level Security, and Supabase Storage).

---

## 1. Creating Your Supabase Project

1. Navigate to [https://supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New Project** in your dashboard.
3. Choose an organization, provide a project name (e.g. `sstechworks-prod`), set a secure database password, and select a region close to your target audience.
4. Wait approximately 1–2 minutes for the database cluster to finish provisioning.

---

## 2. Locating Project URL and API Keys

1. In your Supabase project dashboard, open the left sidebar and navigate to **Project Settings** (gear icon) > **API**.
2. Locate the following values:
   - **Project URL**: Found under `Configuration > Project URL` (format: `https://[project-ref].supabase.co`).
   - **Project API Keys**: Copy the **`anon` / `public`** key (labeled as *client key*).
3. ⚠️ **SECURITY WARNING**: **NEVER** use the `service_role` key in frontend code or repository `.env` files. The frontend requires *only* the anonymous public key. All authorization is securely enforced at the database level via Row Level Security (RLS).

---

## 3. Configuring Environment Variables

Create or edit your local `.env` file in the root directory (based on `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key-here"
```

> **Note**: If environment variables are missing or invalid, the website will not crash. A setup diagnostics banner will be displayed at the top of the viewport guiding you to configure these variables.

---

## 4. Applying SQL Migrations

Open the **SQL Editor** in your Supabase dashboard and run the migration scripts located in the `/supabase/migrations/` directory in the following order:

### Migration Execution Sequence:

1. **`supabase/migrations/01_schema.sql`**
   - Enables the UUID extension.
   - Creates tables: `user_roles`, `profiles`, `services`, `pricing_plans`, `projects`, `enquiries`, `orders`, `deliverables`, `support_tickets`, `site_settings`.
   - Creates foreign keys, cascade deletes, and search indexes.
   - Creates the `handle_new_user()` trigger to automatically create client profiles and default `client` roles upon signup.

2. **`supabase/migrations/02_security_rls.sql`**
   - Creates the security definer function `is_admin()`.
   - Enables Row Level Security (RLS) on all 10 tables.
   - Enforces strict data isolation: clients can read *only* their own orders, deliverables, and support tickets.
   - Grants public read access *only* to active services, active pricing plans, and published projects (`is_published = true`).
   - Allows public enquiry submissions without granting public read access.

3. **`supabase/migrations/03_storage.sql`**
   - Provisions 4 storage buckets:
     - `project-assets` (Public: images, screenshots)
     - `enquiry-attachments` (Private: user uploads <10MB)
     - `client-deliverables` (Private: deliverables <100MB, accessible only via signed URLs)
     - `avatars` (Public view, owner upload <5MB)
   - Configures storage access control policies.

4. **`supabase/migrations/04_seed_data.sql`**
   - Populates the 9 real services with descriptions and icons.
   - Populates the 3 transparent scoping models with quote-based pricing.
   - Seeds initial site settings (`business_name`, `contact_email`, `contact_phone`, `whatsapp_number`).
   - **Zero fake projects or orders are inserted**, adhering to truth-in-engineering standards.

---

## 5. Configuring Authentication Redirect URLs

1. In the Supabase Dashboard, navigate to **Authentication** > **URL Configuration**.
2. Under **Site URL**, set your production or development URL:
   - For local development: `http://localhost:3000`
   - For AI Studio environment: `https://[your-app-url]`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/**`
   - `http://localhost:3000/reset-password`
   - `https://[your-app-url]/**`
   - `https://[your-app-url]/reset-password`
4. (Optional) Under **Authentication** > **Email Templates**, customize the confirmation and password recovery email templates.

---

## 6. Securely Provisioning the First Administrator

Newly registered users are assigned the `client` role by default. To provision the first administrator securely without exposing elevated registration endpoints:

1. Register an account using the website signup form at `/signup` with your administrative email (e.g. `sstechworks01@gmail.com`).
2. Go to the Supabase **SQL Editor** and run the following command, replacing the email with your registered administrator email:

```sql
update public.user_roles
set role = 'admin'
where user_id = (
  select id from auth.users where email = 'sstechworks01@gmail.com'
);
```

3. Confirm that the role was updated:

```sql
select u.email, r.role
from auth.users u
join public.user_roles r on r.user_id = u.id
where u.email = 'sstechworks01@gmail.com';
```

---

## 7. Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server on port 3000
npm run dev

# 3. Build for production
npm run build

# 4. Run TypeScript checks
npm run lint
```

---

## 8. Testing Procedures

### A. Testing Authentication & Session Persistence
1. Navigate to `/signup` and register a new account.
2. Sign out using the user button in the top navigation or sidebar.
3. Sign back in at `/login`. Verify session persistence on page refresh.
4. Navigate to `/forgot-password`, input your registered email, and verify the recovery dispatch message.

### B. Testing Project Enquiry Submission
1. Navigate to `/contact`.
2. Fill out the form fields with test parameters and attach a PDF or image under 10MB.
3. Submit the enquiry.
4. Verify in the Supabase Table Editor under `enquiries` that the record exists with status `new`.
5. Verify in the Supabase Storage Explorer under `enquiry-attachments` that the uploaded file exists.
6. Confirm that as an unauthenticated or ordinary client, executing `SELECT * FROM enquiries` directly returns zero rows due to RLS policies.

### C. Testing Client Data Isolation
1. Create two test accounts (Client A and Client B).
2. Log in as Client A and submit a support ticket via `/dashboard/support`.
3. Log out and sign in as Client B.
4. Verify that Client B *cannot* see Client A's support ticket in their dashboard.

### D. Testing Floating WhatsApp Button
1. In the Supabase Table Editor under `site_settings`, locate `whatsapp_number`.
2. If `null`, click the floating WhatsApp button: an informative dialog explains that the number is not yet configured, preventing broken links.
3. If updated to a real number (e.g. `"+15551234567"`), clicking the button opens `https://wa.me/15551234567`.
