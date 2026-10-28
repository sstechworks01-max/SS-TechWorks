-- ==============================================================================
-- SS TECHWORKS - STAGE 2 MIGRATION: 04_seed_data.sql
-- Initial verified services, pricing plans, and public business settings.
-- NOTE: In compliance with Stage 2 requirements, ZERO fake projects or orders are inserted.
-- ==============================================================================

-- 1. SEED 9 REAL SERVICES
insert into public.services (name, slug, short_description, full_description, icon, display_order)
values
  (
    'Website Development',
    'website-development',
    'High-performance, bespoke web platforms engineered for speed, responsiveness, and brand impact.',
    'We build responsive, fast-loading, and standards-compliant web applications and business sites. Using modern frontend frameworks, semantic HTML, and scalable architectures, we deliver digital platforms that provide seamless experiences across every device viewport.',
    'Globe',
    1
  ),
  (
    'Android App Development',
    'android-app-development',
    'Native and cross-platform Android mobile applications designed for fluid touch interaction and device efficiency.',
    'Our Android development services focus on building dependable, battery-efficient mobile applications. From sleek client-facing consumer apps to internal enterprise tools, we prioritize responsive touch ergonomics, offline resiliency, and smooth navigation.',
    'Smartphone',
    2
  ),
  (
    'Custom Software Development',
    'custom-software',
    'Tailored enterprise software, internal management tools, and automated pipelines designed around your business logic.',
    'When off-the-shelf software falls short, we architect tailored digital systems that match your exact operational requirements. We develop internal administrative dashboards, database systems, workflow automation utilities, and secure customer portals.',
    'Cpu',
    3
  ),
  (
    'AI Tools and Applications',
    'ai-tools',
    'Intelligent automation, natural language workflows, and custom algorithmic integrations embedded into your web apps.',
    'We architect and build interfaces that harness generative and analytical AI capabilities to automate business tasks. From semantic search to automated classification and intelligent content assistance, we connect cutting-edge model APIs with practical user workflows.',
    'Sparkles',
    4
  ),
  (
    'E-commerce Website Development',
    'ecommerce',
    'Conversion-optimized digital storefronts with structured catalogs, cart flows, and secure checkout architectures.',
    'We build digital storefronts designed to convert visitors into loyal customers. Our e-commerce platforms focus on instant product browsing, structured categorization, friction-free checkout workflows, and resilient inventory tracking.',
    'ShoppingBag',
    5
  ),
  (
    'AI Photo Generation',
    'ai-photo-generation',
    'Custom AI image synthesis pipelines for commercial product staging, conceptual art, and brand visuals.',
    'We design custom generative image pipelines for businesses that need high-volume, brand-consistent visual assets. We help teams integrate state-of-the-art diffusion models for product mockups, concept exploration, and marketing collateral generation.',
    'Image',
    6
  ),
  (
    'AI Video Generation',
    'ai-video-generation',
    'Generative video sequences, animated product showcases, and dynamic motion assets generated via next-gen video models.',
    'Bring static creative assets to life using cutting-edge generative video pipelines. We configure workflows that translate product scripts, imagery, and style references into engaging short-form video sequences, motion teasers, and brand backgrounds.',
    'Video',
    7
  ),
  (
    'Photo Editing',
    'photo-editing',
    'Professional image enhancement, color grading, background isolation, and commercial retouching services.',
    'High-quality photography is essential for credibility. Our photo editing service provides precision retouching, advanced background removal, color normalization, and multi-format export for e-commerce catalogs, corporate headshots, and marketing campaigns.',
    'Camera',
    8
  ),
  (
    'Video Editing',
    'video-editing',
    'Full-service post-production, dynamic cutting, sound design, color grading, and social reel optimization.',
    'Transform raw footage into compelling brand stories. We provide comprehensive video post-production services including rhythm-based narrative cutting, kinetic motion titles, professional color grading, clean audio mastering, and multi-platform aspect ratio deliverables.',
    'Film',
    9
  )
on conflict (slug) do nothing;

-- 2. SEED PRICING PLANS (Transparent Scoping Models, Quote-based)
insert into public.pricing_plans (name, description, price_amount, currency, pricing_type, features, display_order)
values
  (
    'MVP & Prototype Scoping',
    'Ideal for early-stage startups and businesses validating new concepts or launching an initial market version.',
    null,
    'USD',
    'quote',
    '["Discovery & requirement specification", "Responsive web or mobile client interface", "Core user flow & state logic", "Pre-configured deployment pipeline", "Handover documentation"]'::jsonb,
    1
  ),
  (
    'Full-Scale Custom System',
    'Comprehensive software development for growing businesses requiring custom business logic and database architecture.',
    null,
    'USD',
    'quote',
    '["Complete system architecture & DB schema", "Full-stack application with API integrations", "Role-based access control & authentication", "Automated testing & performance tuning", "Production staging & release rollout"]'::jsonb,
    2
  ),
  (
    'Enterprise & Media Pipelines',
    'High-availability software infrastructure, specialized AI tool calling, or multi-format creative production.',
    null,
    'USD',
    'quote',
    '["Bespoke software automation & algorithms", "High-throughput data & media queues", "Security hardening & compliance audit", "SLA-backed milestone delivery schedule", "Dedicated sprint engineering cycles"]'::jsonb,
    3
  )
on conflict do nothing;

-- 3. SEED SITE SETTINGS
insert into public.site_settings (setting_key, setting_value)
values
  ('business_name', '"SS TECHWORKS"'::jsonb),
  ('contact_email', '"sstechworks01@gmail.com"'::jsonb),
  ('contact_phone', '"Not configured yet"'::jsonb),
  ('whatsapp_number', 'null'::jsonb),
  ('business_type', '"Software Development, Web Development, Mobile Apps, Custom Software, and AI Solutions"'::jsonb)
on conflict (setting_key) do update set setting_value = excluded.setting_value;
