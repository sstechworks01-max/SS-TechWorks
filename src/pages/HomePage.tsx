import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  IconHelper,
  Sparkles,
  Wand2,
  Music,
  Mic,
  MessageSquare,
  Volume2,
} from '../components/common/IconHelper';
import { servicesList } from '../data/servicesData';
import { companyPrinciples, projectWorkflow } from '../data/companyData';
import { StatsSection } from '../components/home/StatsSection';

export const HomePage: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-full">
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-slate-800/60 transition-colors">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-600/10 dark:from-blue-600/15 via-indigo-600/5 dark:via-indigo-600/10 to-violet-600/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <img
                  src="/assets/aistudio/a_clean_high_resolution_futuristic_tech_logo_bra_0b441d93.png"
                  alt="SS TECHWORKS"
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/40"
                />
                <span className="font-semibold text-slate-900 dark:text-white tracking-wide">SS TECHWORKS</span>
                <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">·</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Ideas to Digital Solutions</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]" style={{ textWrap: 'balance' }}>
                Building Powerful Digital Experiences
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                We design and develop modern websites, mobile applications, custom software, and AI-powered solutions that help businesses grow.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap"
                >
                  <span>Start Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portfolio"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  <span>Explore Our Work</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Subtle scope indicators (unboxed text metadata) */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Web Platforms</span>
                <span aria-hidden="true">·</span>
                <span>Android Applications</span>
                <span aria-hidden="true">·</span>
                <span>Custom Systems</span>
                <span aria-hidden="true">·</span>
                <span>AI Integrations</span>
              </div>
            </div>

            {/* Right Column: Software-Inspired Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0d121f] shadow-xl dark:shadow-2xl">
                {!imageError ? (
                  <img
                    src="/src/assets/images/hero_tech_network_1793000469980.jpg"
                    alt="SS TECHWORKS software architecture and digital nodes visualization"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-[320px] sm:h-[380px] lg:h-[420px] object-cover object-center filter brightness-95"
                  />
                ) : (
                  <div className="w-full h-[320px] sm:h-[380px] lg:h-[420px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-[#0c101d] dark:via-[#11192e] dark:to-[#070a12] text-center">
                    <div className="w-16 h-16 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                      <IconHelper name="Cpu" className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Modular Digital Architecture</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-xs">
                      Engineered for high reliability, performance, and maintainable software systems.
                    </span>
                  </div>
                )}
                {/* Visual caption */}
                <div className="p-4 bg-slate-50 dark:bg-[#0a0e18] border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono text-slate-800 dark:text-slate-300">SYSTEM ARCHITECTURE</span>
                  <span>Modern Stack Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1.5: KEY METRICS & SOCIAL PROOF */}
      <StatsSection />

      {/* SECTION 2: SERVICES OVERVIEW */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 max-w-3xl">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Our Capabilities</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Specialized Software & Creative Services
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From performant client-facing web and mobile applications to internal business software and digital media pipelines, we deliver complete solutions tailored to your operational goals.
          </p>
        </div>

        {/* 9 Services Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service, idx) => (
            <div
              key={service.slug}
              className="group relative flex flex-col justify-between p-6 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-lg dark:hover:shadow-blue-950/20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:border-blue-400 dark:group-hover:border-blue-700 transition-colors">
                    <IconHelper name={service.iconName} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">0{idx + 1}</span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {service.category}
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {service.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {service.shortDescription}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to={`/contact?service=${service.slug}`}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                >
                  Quote Request
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800 rounded-lg transition-colors shadow-sm"
          >
            <span>View All Service Specifications & Workflows</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </section>

      {/* SECTION 2.5: FREE AI TOOLS SHOWCASE */}
      <section className="py-20 md:py-24 bg-linear-to-b from-blue-950/20 via-indigo-950/15 to-transparent border-y border-slate-200 dark:border-slate-800/80 transition-colors relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXPERIMENT IN OUR FREE AI LAB</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Free AI Generation & Creative Suite
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Test-drive our multimodal AI integrations. Create high-resolution visuals, compose original music tracks with Lyria, transcribe audio recordings, chat with technical architects, and synthesize speech at zero cost.
              </p>
            </div>
            <Link
              to="/free-tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all self-start md:self-auto shrink-0"
            >
              <span>Explore All Free Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              to="/free-tools"
              className="group p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wand2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  AI Image Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Generate 1K/2K images or edit existing artwork with Gemini Nano Banana.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Create Images <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/free-tools"
              className="group p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Music Composer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Generate 30-second audio tracks in synthwave, lofi, or orchestral with Lyria.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Compose Music <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/free-tools"
              className="group p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Audio Transcriber
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Record meetings or upload voice notes for verbatim text and action points.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Transcribe Audio <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/free-tools"
              className="group p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Tech Architect
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Get real-time engineering consultations for Supabase, React, and cloud systems.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Chat With AI <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/free-tools"
              className="group p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Speech Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Synthesize human-grade speech across 5 vocal personas and custom delivery styles.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Synthesize Speech <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY CHOOSE SS TECHWORKS */}
      <section className="py-20 md:py-24 bg-slate-100/60 dark:bg-[#05070c] border-y border-slate-200 dark:border-slate-800/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Our Foundation</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why Choose SS TECHWORKS
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              We base our business on engineering rigor, transparent project management, and scalable development principles.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyPrinciples.map((principle, idx) => (
              <div
                key={principle.title}
                className="p-6 rounded-xl bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-800/70 space-y-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5 text-xs text-blue-600 dark:text-blue-400 font-mono">
                  <span>PRINCIPLE 0{idx + 1}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{principle.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PROJECT WORKFLOW */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Delivery Methodology</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            How We Deliver Your Project
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A structured four-phase delivery cycle that ensures scope alignment, rapid iteration, and verifiable milestones.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectWorkflow.map((step) => (
            <div
              key={step.step}
              className="p-6 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 space-y-3 relative shadow-sm"
            >
              <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-500/80">
                {step.step}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: CTA SECTION */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-100 to-white dark:from-[#080c16] dark:to-[#05070a] border-t border-slate-200 dark:border-slate-800/60 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Have an Idea? Let's Build It.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
            Whether you need a new web application, an Android mobile solution, or custom workflow software, our team is ready to evaluate your requirements and scope a practical solution.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap"
            >
              <span>Contact Our Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <span>Review Scoping & Pricing</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
