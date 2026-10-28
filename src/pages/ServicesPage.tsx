import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesList as fallbackServices } from '../data/servicesData';
import { IconHelper, ArrowRight, CheckCircle2 } from '../components/common/IconHelper';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ServiceItem } from '../types';

export const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  const categories = ['All', 'Web & Mobile', 'Software & AI', 'Media & Creative'];

  useEffect(() => {
    const fetchServices = async () => {
      if (!isSupabaseConfigured()) {
        setServices(fallbackServices);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error || !data || data.length === 0) {
          setServices(fallbackServices);
        } else {
          // Map DB rows to ServiceItem structure
          const mapped: ServiceItem[] = data.map((d: any) => {
            const fallback = fallbackServices.find((s) => s.slug === d.slug);
            return {
              id: d.id,
              slug: d.slug,
              title: d.name,
              shortDescription: d.short_description,
              overview: d.full_description,
              category: fallback?.category || 'Web & Mobile',
              benefits: fallback?.benefits || [
                'Production-grade implementation and clean architecture',
                'WCAG AA accessible interface design',
                'Performance optimized with zero unnecessary bloat',
              ],
              capabilities: fallback?.capabilities || [
                'Full-stack API Integration',
                'Modern Frontend Components',
                'Automated Testing and Handover',
              ],
              workflow: fallback?.workflow || [
                { step: '01', title: 'Scoping', description: 'Technical analysis and architecture mapping.' },
                { step: '02', title: 'Execution', description: 'Modular sprint builds and verification.' },
              ],
              iconName: d.icon || fallback?.iconName || 'Code2',
              stageNote: fallback?.stageNote,
            };
          });
          setServices(mapped);
          setDataSource('supabase');
        }
      } catch {
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
          <span>Our Services</span>
          {dataSource === 'supabase' && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono lowercase">(live database)</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Engineered Digital Solutions
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Explore our specialized development, software engineering, and creative services. Each service is built with modular code, scalable architecture, and strict attention to performance.
        </p>
      </div>

      {/* Category Filter Tabs (Interactive Segmented Control) */}
      <div className="mt-10 flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Services List Grid */}
      {loading ? (
        <div className="mt-12 py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading verified services...</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.slug}
              className="flex flex-col justify-between p-6 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-lg dark:hover:shadow-blue-950/20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <IconHelper name={service.iconName} className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{service.category}</span>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  <Link to={`/services/${service.slug}`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                    {service.title}
                  </Link>
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Sample capabilities */}
                <div className="pt-2 space-y-1.5">
                  {service.capabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>

                {service.stageNote && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Stage Note: </span>
                    {service.stageNote}
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <span>View Full Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/contact?service=${service.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md transition-colors"
                >
                  <span>Request Quote</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Scoping Banner */}
      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 dark:from-blue-950/20 dark:via-[#0b0f19] dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Need a Multi-Service Architecture?</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Many client systems require both web platforms, mobile clients, and custom backend software. We create integrated technical plans tailored to your specific ecosystem.
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-md"
        >
          <span>Initiate Scoping Call</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
