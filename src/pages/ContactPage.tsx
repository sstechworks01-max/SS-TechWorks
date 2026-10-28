import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, Phone, Send, CheckCircle2, AlertTriangle, Info, Clock, WhatsAppIcon } from '../components/common/IconHelper';
import { companyInfo, budgetOptions, deadlineOptions } from '../data/companyData';
import { servicesList } from '../data/servicesData';
import { EnquiryFormData } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';

  const [formData, setFormData] = useState<EnquiryFormData>({
    fullName: '',
    email: '',
    whatsappNumber: '',
    serviceSlug: preselectedService,
    projectTitle: '',
    projectDescription: '',
    budgetRange: budgetOptions[1],
    desiredDeadline: deadlineOptions[1],
    attachmentFileName: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<'database' | 'validation_only'>('database');
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [validatedDataSummary, setValidatedDataSummary] = useState<EnquiryFormData | null>(null);

  useEffect(() => {
    if (preselectedService && servicesList.some((s) => s.slug === preselectedService)) {
      setFormData((prev) => ({ ...prev, serviceSlug: preselectedService }));
    }
  }, [preselectedService]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EnquiryFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address (e.g. name@domain.com).';
    }

    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required.';
    }

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required.';
    } else if (formData.projectDescription.trim().length < 20) {
      newErrors.projectDescription = 'Please provide at least 20 characters describing your project goals.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, attachmentFileName: 'File exceeds 10MB limit.' }));
        setSelectedFile(null);
      } else {
        setErrors((prev) => ({ ...prev, attachmentFileName: undefined }));
        setSelectedFile(file);
        setFormData((prev) => ({ ...prev, attachmentFileName: file.name }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setDbErrorMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);

    if (!isSupabaseConfigured()) {
      // Graceful fallback when credentials are not configured yet
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionMode('validation_only');
        setValidatedDataSummary({ ...formData });
        setSubmissionCompleted(true);
      }, 500);
      return;
    }

    let uploadedStoragePath: string | null = null;

    try {
      // 1. Upload attachment to private enquiry-attachments bucket if present
      if (selectedFile) {
        const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniquePath = `enquiries/${Date.now()}_${crypto.randomUUID()}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('enquiry-attachments')
          .upload(uniquePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          // If storage bucket doesn't exist or fails, record error
          console.warn('Attachment upload failed:', uploadError.message);
        } else {
          uploadedStoragePath = uniquePath;
        }
      }

      // 2. Fetch service_id from services table if slug provided
      let matchedServiceId: string | null = null;
      if (formData.serviceSlug) {
        const { data: serviceRow } = await supabase
          .from('services')
          .select('id')
          .eq('slug', formData.serviceSlug)
          .maybeSingle();

        if (serviceRow) {
          matchedServiceId = serviceRow.id;
        }
      }

      // 3. Insert enquiry record into Supabase
      const { error: insertError } = await supabase.from('enquiries').insert({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        whatsapp_number: formData.whatsappNumber.trim() || null,
        service_id: matchedServiceId,
        project_title: formData.projectTitle.trim(),
        project_description: formData.projectDescription.trim(),
        budget_range: formData.budgetRange || null,
        deadline: formData.desiredDeadline || null,
        attachment_path: uploadedStoragePath,
        status: 'new',
      });

      if (insertError) {
        // Cleanup orphaned attachment if DB insert failed
        if (uploadedStoragePath) {
          await supabase.storage.from('enquiry-attachments').remove([uploadedStoragePath]);
        }
        throw new Error(insertError.message);
      }

      setSubmissionMode('database');
      setValidatedDataSummary({ ...formData });
      setSubmissionCompleted(true);
    } catch (err: any) {
      setDbErrorMessage(err?.message || 'Database submission failed. Please verify Supabase tables exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      whatsappNumber: '',
      serviceSlug: '',
      projectTitle: '',
      projectDescription: '',
      budgetRange: budgetOptions[1],
      desiredDeadline: deadlineOptions[1],
      attachmentFileName: '',
    });
    setSelectedFile(null);
    setErrors({});
    setSubmissionCompleted(false);
    setValidatedDataSummary(null);
    setDbErrorMessage(null);
  };

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Contact Channels & Disclosures */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Direct Contact</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Start Your Project With SS TECHWORKS
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Have an idea for a web platform, Android app, or custom software? Fill out our structured project enquiry form or reach out directly via verified business email.
            </p>
          </div>

          {/* Verified Contact Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Business Contact</h2>

            <div className="space-y-4">
              {/* WhatsApp direct */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <WhatsAppIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-current shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 block">Direct WhatsApp</span>
                  <a
                    href={companyInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline block"
                  >
                    {companyInfo.whatsappFormatted}
                  </a>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Fastest response for project scoping & instant quotes
                  </span>
                </div>
                <a
                  href={companyInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shrink-0 transition-colors shadow-xs"
                >
                  Chat Now
                </a>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Verified Business Email</span>
                  <a
                    href={`mailto:${companyInfo.email}`}
                    className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors"
                  >
                    {companyInfo.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Direct Telephone</span>
                  <span className="text-sm text-slate-900 dark:text-white font-medium">{companyInfo.phoneStatus}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">
                    Available during business hours (IST)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Truth-in-Engineering Disclosures */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              <Info className="w-4 h-4" />
              <span>Backend & Privacy Architecture</span>
            </div>
            <p className="leading-relaxed">
              Enquiries submit directly to the Supabase <code>enquiries</code> table with Row Level Security:
            </p>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Anonymous and public users can insert enquiries, but cannot read any enquiry records.</li>
              <li>Only authenticated administrators can inspect inbound enquiries.</li>
              <li>Attachments are securely routed to the private <code>enquiry-attachments</code> storage bucket.</li>
              <li>Transactional email notification dispatch will connect via configured SMTP in Stage 3.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Project Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-xl">
            {dbErrorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Submission Error: </strong>
                  <span>{dbErrorMessage}</span>
                </div>
              </div>
            )}

            {submissionCompleted && validatedDataSummary ? (
              /* Success / Result Screen */
              <div className="space-y-6 text-slate-800 dark:text-slate-200">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {submissionMode === 'database'
                      ? 'Enquiry Recorded in Supabase Database'
                      : 'Frontend Validation Succeeded'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {submissionMode === 'database'
                      ? 'Your project enquiry has been inserted into the enquiries table in Supabase. Our team will review the specifications and follow up via email.'
                      : 'All project enquiry fields passed strict client-side validation rules. To enable persistent database insertion, please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
                  </p>
                </div>

                {/* Summary Table */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="text-slate-900 dark:text-white font-semibold pb-1 border-b border-slate-200 dark:border-slate-800">
                    Submission Details
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Name:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white font-medium">{validatedDataSummary.fullName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Email:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white font-medium">{validatedDataSummary.email}</span>
                  </div>
                  {validatedDataSummary.whatsappNumber && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 dark:text-slate-400">WhatsApp:</span>
                      <span className="col-span-2 text-slate-900 dark:text-white">{validatedDataSummary.whatsappNumber}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Service:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white">
                      {servicesList.find((s) => s.slug === validatedDataSummary.serviceSlug)?.title || 'General Enquiry'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Title:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white">{validatedDataSummary.projectTitle}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Budget:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white">{validatedDataSummary.budgetRange}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Deadline:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white">{validatedDataSummary.desiredDeadline}</span>
                  </div>
                  {validatedDataSummary.attachmentFileName && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Attachment:</span>
                      <span className="col-span-2 text-slate-900 dark:text-white">{validatedDataSummary.attachmentFileName}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <span>
                    <strong>Email Notification Note: </strong>
                    Direct email dispatch to your inbox will be configured when a third-party transactional email provider (SMTP/Resend) is connected.
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                  <a
                    href={`mailto:${companyInfo.email}?subject=Project Enquiry: ${encodeURIComponent(validatedDataSummary.projectTitle)}&body=${encodeURIComponent(`Client Name: ${validatedDataSummary.fullName}\nEmail: ${validatedDataSummary.email}\nDescription: ${validatedDataSummary.projectDescription}`)}`}
                    className="px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
                  >
                    Send Directly via Email Client
                  </a>
                </div>
              </div>
            ) : (
              /* The Form */
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Enquiry Form</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Please provide project specifications so we can evaluate technical requirements.
                  </p>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                      }}
                      placeholder="Jane Doe"
                      className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors ${
                        errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                      }`}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="text-xs text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="name@company.com"
                      className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                      }`}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* WhatsApp & Service Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="whatsappNumber" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      WhatsApp Number <span className="text-slate-400 dark:text-slate-500 text-[11px]">(Optional)</span>
                    </label>
                    <input
                      id="whatsappNumber"
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="serviceSlug" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Target Service
                    </label>
                    <select
                      id="serviceSlug"
                      value={formData.serviceSlug}
                      onChange={(e) => setFormData({ ...formData, serviceSlug: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">General Project Scoping</option>
                      {servicesList.map((service) => (
                        <option key={service.slug} value={service.slug}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Project Title */}
                <div className="space-y-1.5">
                  <label htmlFor="projectTitle" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="projectTitle"
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => {
                      setFormData({ ...formData, projectTitle: e.target.value });
                      if (errors.projectTitle) setErrors({ ...errors, projectTitle: undefined });
                    }}
                    placeholder="e.g. Modern E-commerce Platform or Android Logistics App"
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.projectTitle ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                    }`}
                    aria-invalid={!!errors.projectTitle}
                    aria-describedby={errors.projectTitle ? 'title-error' : undefined}
                  />
                  {errors.projectTitle && (
                    <p id="title-error" className="text-xs text-red-500">
                      {errors.projectTitle}
                    </p>
                  )}
                </div>

                {/* Project Description */}
                <div className="space-y-1.5">
                  <label htmlFor="projectDescription" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Project Goals & Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="projectDescription"
                    rows={4}
                    value={formData.projectDescription}
                    onChange={(e) => {
                      setFormData({ ...formData, projectDescription: e.target.value });
                      if (errors.projectDescription) setErrors({ ...errors, projectDescription: undefined });
                    }}
                    placeholder="Describe the primary features, target audience, core operational workflows, or technical challenges..."
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors leading-relaxed ${
                      errors.projectDescription ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                    }`}
                    aria-invalid={!!errors.projectDescription}
                    aria-describedby={errors.projectDescription ? 'desc-error' : undefined}
                  />
                  {errors.projectDescription && (
                    <p id="desc-error" className="text-xs text-red-500">
                      {errors.projectDescription}
                    </p>
                  )}
                </div>

                {/* Budget Range & Desired Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="budgetRange" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Budget Range
                    </label>
                    <select
                      id="budgetRange"
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {budgetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="desiredDeadline" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Target Timeline
                    </label>
                    <select
                      id="desiredDeadline"
                      value={formData.desiredDeadline}
                      onChange={(e) => setFormData({ ...formData, desiredDeadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {deadlineOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Attachment */}
                <div className="space-y-1.5">
                  <label htmlFor="attachment" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Specification Document / Wireframe <span className="text-slate-400 dark:text-slate-500 text-[11px]">(Optional, PDF/ZIP/Images &lt;10MB)</span>
                  </label>
                  <input
                    id="attachment"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
                  />
                  {errors.attachmentFileName && (
                    <p className="text-xs text-red-500">{errors.attachmentFileName}</p>
                  )}
                  {formData.attachmentFileName && !errors.attachmentFileName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Selected file: <span className="text-slate-900 dark:text-white font-mono">{formData.attachmentFileName}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800/60 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md shadow-blue-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting to Database...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Project Enquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    Secured by Supabase Row Level Security · Inbound enquiries strictly accessible by administrators
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
