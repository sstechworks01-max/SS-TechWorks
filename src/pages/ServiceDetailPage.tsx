import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesList } from '../data/servicesData';
import {
  IconHelper,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Info,
  Layers,
} from '../components/common/IconHelper';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const service = servicesList.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="py-24 max-w-3xl mx-auto px-4 text-center space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Not Found</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The requested service URL does not match any current SS TECHWORKS capability.
        </p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
        >
          <span>Return to All Services</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/services" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Services</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-medium">{service.title}</span>
      </nav>

      {/* Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <IconHelper name={service.iconName} className="w-6 h-6" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>{service.category}</span>
              <span className="mx-2">·</span>
              <span>Production Service</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {service.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {service.shortDescription}
          </p>

          {service.stageNote && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white">Architecture & Stage 1 Status: </strong>
                {service.stageNote}
              </div>
            </div>
          )}
        </div>

        {/* Action Scoping Card */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Project Estimation & Scoping</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Ready to evaluate requirements for {service.title}? Submit your technical brief to receive a structured scope review and timeline estimate.
          </p>

          <Link
            to={`/contact?service=${service.slug}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md shadow-blue-600/20"
          >
            <span>Request a Quote</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="text-center">
            <Link
              to="/pricing"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              Review Scoping Methodology
            </Link>
          </div>
        </div>
      </div>

      {/* Main Body: Overview, Benefits, Capabilities, Workflow */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-12">
          {/* Detailed Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service Overview</h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {service.overview}
            </p>
          </section>

          {/* Key Benefits */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Client Benefits & Outcomes</h2>
            <div className="space-y-3">
              {service.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 flex items-start gap-3.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Workflow */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Typical Project Workflow</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Our structured approach guarantees clear communication, milestone verification, and dependable delivery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {service.workflow.map((item) => (
                <div
                  key={item.step}
                  className="p-5 rounded-lg bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">PHASE {item.step}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Capabilities & Other Services */}
        <div className="lg:col-span-4 space-y-8">
          {/* Relevant Capabilities */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Core Capabilities</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {service.capabilities.map((cap, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5 font-bold">·</span>
                  <span className="leading-relaxed">{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links to other services */}
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800/80 space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Related Services</h3>
            <ul className="space-y-2 text-xs">
              {servicesList
                .filter((s) => s.slug !== service.slug)
                .slice(0, 4)
                .map((rel) => (
                  <li key={rel.slug}>
                    <Link
                      to={`/services/${rel.slug}`}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-between py-1 transition-colors"
                    >
                      <span className="truncate">{rel.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800/80 text-center space-y-4 max-w-2xl mx-auto transition-colors">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to Discuss {service.title}?</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Reach out directly to outline your requirements and receive a structured scoping recommendation.
        </p>
        <div className="pt-2">
          <Link
            to={`/contact?service=${service.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md"
          >
            <span>Request a Quote for {service.title}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
