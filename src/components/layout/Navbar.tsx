import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, User, LogOut, Sparkles, WhatsAppIcon } from '../common/IconHelper';
import { StageStatusModal } from '../common/StageStatusModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { companyInfo } from '../../data/companyData';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Free AI Tools', path: '/free-tools', badge: 'FREE' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#07090e]/90 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 md:gap-8 h-18">
          {/* Zone 1: Brand wordmark with official logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              aria-label="SS TECHWORKS Home"
            >
              <img
                src="/assets/aistudio/a_clean_high_resolution_futuristic_tech_logo_bra_0b441d93.png"
                alt="SS TECHWORKS Logo"
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-blue-500/30 group-hover:ring-blue-400 transition-all shadow-md shadow-blue-500/10"
              />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                SS TECHWORKS
              </span>
            </Link>
          </div>

          {/* Zone 2: clean nav links with badge support */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 transition-colors hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0 relative py-1 ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-500'
                      : 'text-slate-600 dark:text-slate-300'
                  }`
                }
              >
                {link.badge && <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-linear-to-r from-blue-600 to-indigo-600 text-white tracking-wide uppercase shadow-xs">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <StageStatusModal />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{profile?.full_name ? profile.full_name.split(' ')[0] : 'Dashboard'}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap px-2 py-1"
              >
                Login
              </Link>
            )}

            <a
              href={companyInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              title={`Direct WhatsApp Chat: ${companyInfo.whatsappFormatted}`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-current" />
              <span>WhatsApp</span>
            </a>

            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-blue-500/10"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile right items: ThemeToggle + StageStatusModal + hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <StageStatusModal />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] px-4 pt-3 pb-6 space-y-3 transition-colors">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.badge && <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                    <span>{link.label}</span>
                  </span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <div className="flex gap-2">
                <Link
                  to="/dashboard"
                  onClick={closeMobile}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  Client Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    closeMobile();
                  }}
                  className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                Client Login
              </Link>
            )}
            <a
              href={companyInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              className="w-full text-center px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current" />
              <span>WhatsApp: +91 76979 16086</span>
            </a>
            <Link
              to="/contact"
              onClick={closeMobile}
              className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
