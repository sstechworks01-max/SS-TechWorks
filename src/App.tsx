/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { FreeToolsPage } from './pages/FreeToolsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ClientDashboardLayout } from './pages/dashboard/ClientDashboardLayout';
import { AdminDashboardLayout } from './pages/admin/AdminDashboardLayout';
import { ArrowRight, AlertTriangle } from './components/common/IconHelper';

function NotFoundPage() {
  return (
    <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-6">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">404 · Page Not Found</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        The requested URL is not part of the current application structure. Please return to the homepage or browse our services catalog.
      </p>
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main public website wrapped with Header & Footer */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:slug" element={<ServiceDetailPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="portfolio/:slug" element={<ProjectDetailPage />} />
              <Route path="free-tools" element={<FreeToolsPage />} />
              <Route path="ai-tools" element={<FreeToolsPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="contact" element={<ContactPage />} />

              {/* Authentication Routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />

              {/* Client Portal Routes (Protected) */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <ClientDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard/orders"
                element={
                  <ProtectedRoute>
                    <ClientDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard/downloads"
                element={
                  <ProtectedRoute>
                    <ClientDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard/support"
                element={
                  <ProtectedRoute>
                    <ClientDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard/profile"
                element={
                  <ProtectedRoute>
                    <ClientDashboardLayout />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Foundation Routes */}
              <Route path="admin" element={<AdminDashboardLayout />} />
              <Route path="admin/projects" element={<AdminDashboardLayout />} />
              <Route path="admin/enquiries" element={<AdminDashboardLayout />} />
              <Route path="admin/quotations" element={<AdminDashboardLayout />} />
              <Route path="admin/orders" element={<AdminDashboardLayout />} />
              <Route path="admin/deliverables" element={<AdminDashboardLayout />} />
              <Route path="admin/support" element={<AdminDashboardLayout />} />
              <Route path="admin/services" element={<AdminDashboardLayout />} />
              <Route path="admin/pricing" element={<AdminDashboardLayout />} />
              <Route path="admin/clients" element={<AdminDashboardLayout />} />
              <Route path="admin/notifications" element={<AdminDashboardLayout />} />
              <Route path="admin/settings" element={<AdminDashboardLayout />} />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
