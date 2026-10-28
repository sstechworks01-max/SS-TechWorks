import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SupabaseStatusBanner } from '../common/SupabaseStatusBanner';
import { GeminiChatWidget } from '../chat/GeminiChatWidget';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#07090e] dark:text-slate-100 relative transition-colors duration-200">
      <ScrollToTop />
      <SupabaseStatusBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <GeminiChatWidget />
    </div>
  );
};

