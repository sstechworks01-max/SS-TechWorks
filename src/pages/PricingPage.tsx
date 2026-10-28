import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Info, Clock, Layers } from '../components/common/IconHelper';
import { servicesList } from '../data/servicesData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface PricingPlan {
  id?: string;
  name: string;
  description: string;
  price_amount: number | null;
  currency?: string;
  features: string[];
  turnaround?: string;
  bestFor?: string;
  featured?: boolean;
}

const fallbackScopingModels: PricingPlan[] = [
  {
    name: 'MVP & Prototype Scoping',
    description: 'Ideal for early-stage startups and businesses validating new concepts or launching an initial market version.',
    price_amount: null,
    features: [
      'Discovery & requirement specification',
      'Responsive web or mobile client interface',
      'Core user flow & state logic',
      'Pre-configured deployment pipeline',
      'Handover documentation',
    ],
    turnaround: '2 – 4 Weeks',
    bestFor: 'Targeted proof-of-concept / Lean Launch',
  },
  {
    name: 'Full-Scale Custom System',
    description: 'Comprehensive software development for growing businesses requiring custom business logic and database architecture.',
    price_amount: null,
    features: [
      'Complete system architecture & DB schema',
      'Full-stack application with API integrations',
      'Role-based access control & authentication',
      'Automated testing & performance tuning',
      'Production staging & release rollout',
    ],
    turnaround: '1 – 3 Months',
    bestFor: 'Production business applications',
    featured: true,
  },
  {
    name: 'Enterprise & Media Pipelines',
    description: 'High-availability software infrastructure, specialized AI tool calling, or multi-format creative production.',
    price_amount: null,
    features: [
      'Bespoke software automation & algorithms',
      'High-throughput data & media queues',
      'Security hardening & compliance audit',
      'SLA-backed milestone delivery schedule',
      'Dedicated sprint engineering cycles',
    ],
    turnaround: 'Ongoing / Milestone Milestones',
    bestFor: 'Large organizations & scale-ups',
  },
];

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackScopingModels);
  const [isFromDatabase, setIsFromDatabase] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!isSupabaseConfigured()) return;

      try {
        const { data, error } = await supabase
          .from('pricing_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: PricingPlan[] = data.map((d: any, idx: number) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            price_amount: d.price_amount,
            currency: d.currency || 'USD',
            features: Array.isArray(d.features) ? d.features : JSON.parse(d.features || '[]'),
            turnaround: idx === 0 ? '2 – 4 Weeks' : idx === 1 ? '1 – 3 Months' : 'Ongoing',
            bestFor: idx === 0 ? 'Lean Launch' : idx === 1 ? 'Production System' : 'Enterprise Operations',
            featured: idx === 1,
          }));
          setPlans(mapped);
          setIsFromDatabase(true);
        }
      } catch {
        // Safe fallback
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
          <span>Transparent Scoping</span>
          {isFromDatabase && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono lowercase">(live database)</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Project Pricing & Estimates
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          At SS TECHWORKS, we do not invent arbitrary fixed price tags. Every project has unique technical constraints, scale requirements, and feature sets. We provide transparent, requirement-based project scoping.
        </p>
      </div>

      {/* Honest Database Notice */}
      <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900 dark:text-white">Truth-in-Pricing Policy: </strong>
          {isFromDatabase
            ? 'Pricing plans are synchronized from the database. All figures represent genuine scoping frameworks.'
            : 'Quote-based pricing is displayed. Real-time rate cards and custom scopes connect to the Supabase pricing_plans table.'}
        </p>
      </div>

      {/* 3 Scoping Models */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((model) => (
          <div
            key={model.name}
            className={`p-6 sm:p-8 rounded-2xl flex flex-col justify-between transition-all ${
              model.featured
                ? 'bg-white dark:bg-[#0d1322] border-2 border-blue-600 shadow-xl dark:shadow-2xl dark:shadow-blue-950/30'
                : 'bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="space-y-6">
              {model.featured && (
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Recommended Architecture
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{model.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              {/* Price Display */}
              <div className="py-4 border-y border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {model.price_amount !== null
                    ? `${model.currency || '$'}${model.price_amount.toLocaleString()}`
                    : 'Custom Quote'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {model.price_amount !== null ? 'Base starting rate' : 'Scoped based on deliverables & timeline'}
                </div>
              </div>

              {/* Turnaround & Best For */}
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {model.turnaround && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Timeline: <strong>{model.turnaround}</strong></span>
                  </div>
                )}
                {model.bestFor && (
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>Target: <strong>{model.bestFor}</strong></span>
                  </div>
                )}
              </div>

              {/* Deliverables */}
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Includes:</div>
                {model.features.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800/80">
              <Link
                to="/contact"
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  model.featured
                    ? 'text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20'
                    : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Service-Specific Quote Matrix */}
      <div className="mt-20 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Service-Specific Quotes</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Select a service to immediately pre-fill a tailored project enquiry form.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesList.map((service) => (
            <div
              key={service.slug}
              className="p-5 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{service.title}</h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{service.category}</div>
              </div>
              <Link
                to={`/contact?service=${service.slug}`}
                className="shrink-0 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-md transition-colors"
              >
                Quote
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
