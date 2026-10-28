import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowUpRight, WhatsAppIcon } from '../common/IconHelper';
import { companyInfo } from '../../data/companyData';
import { servicesList } from '../../data/servicesData';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-100 dark:bg-[#05070a] border-t border-slate-200 dark:border-slate-900 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Description (2 cols on large) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={companyInfo.logoUrl}
                alt="SS TECHWORKS Logo"
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-blue-500/30 shadow-md shadow-blue-500/10"
              />
              <div>
                <Link
                  to="/"
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                >
                  SS TECHWORKS
                </Link>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium tracking-wide uppercase">
                  {companyInfo.tagline}
                </span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
              We design and develop modern websites, mobile applications, custom software, and AI-powered solutions that help businesses grow.
            </p>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Contact Email:</span>
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors font-medium"
                >
                  {companyInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <WhatsAppIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current shrink-0" />
                <span>WhatsApp:</span>
                <a
                  href={companyInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 hover:underline transition-colors font-semibold"
                >
                  {companyInfo.whatsappFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>Direct Phone:</span>
                <span className="text-slate-900 dark:text-white font-medium">{companyInfo.phoneStatus}</span>
              </div>
            </div>

            {/* Social channels placeholder note */}
            <div className="pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Official Channels:</span>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span title="Channel placeholder - will link once officially registered">GitHub (Coming Soon)</span>
                <span>·</span>
                <span title="Channel placeholder - will link once officially registered">LinkedIn (Coming Soon)</span>
                <span>·</span>
                <span title="Channel placeholder - will link once officially registered">X (Coming Soon)</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white tracking-wider uppercase">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-slate-900 dark:hover:text-white transition-colors">All Services</Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-slate-900 dark:hover:text-white transition-colors">Portfolio & Work</Link>
              </li>
              <li>
                <Link to="/free-tools" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 transition-colors">
                  <span>Free AI Tools</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-blue-600 text-white font-bold uppercase">New</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing & Estimates</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact & Enquiries</Link>
              </li>
            </ul>
          </div>

          {/* Services (First 5) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white tracking-wider uppercase">Services</h4>
            <ul className="space-y-2 text-xs">
              {servicesList.slice(0, 5).map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors truncate block"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creative & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white tracking-wider uppercase">Media & Portals</h4>
            <ul className="space-y-2 text-xs">
              {servicesList.slice(5).map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors truncate block"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex items-center gap-1 font-medium">
                  <span>Client Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
                  <span>Admin Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {currentYear} SS TECHWORKS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Stage 1 Frontend Build</span>
            <span>·</span>
            <Link to="/pricing" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Scoping Terms</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
