import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  FolderOpen,
  Mail,
  Package,
  Layers,
  Settings,
  Users,
  Lock,
  Info,
  CheckCircle2,
  Menu,
  X,
  Phone,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  AlertCircle,
  Database,
  Code,
  Check,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  FileText,
  UploadCloud,
  Bell,
  FileCheck,
  DollarSign,
  Download,
  Calendar,
  Clock,
} from '../../components/common/IconHelper';
import { companyInfo } from '../../data/companyData';
import { servicesList } from '../../data/servicesData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SqlSetupModal } from '../../components/common/SqlSetupModal';

// Status definitions for the 9-step Enquiry CRM workflow
const ENQUIRY_STATUSES = [
  { value: 'new', label: '1. Enquiry Received', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'discussion', label: '2. Discussion', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'quotation_sent', label: '3. Quotation Sent', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'awaiting_approval', label: '4. Awaiting Approval', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'confirmed', label: '5. Confirmed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'in_progress', label: '6. In Progress', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { value: 'review', label: '7. Review', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { value: 'completed', label: '8. Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'delivered', label: '9. Delivered', color: 'bg-teal-500/10 text-teal-300 border-teal-500/20' },
  { value: 'archived', label: 'Archived', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export const AdminDashboardLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAdmin, profile, role } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [sqlModalTarget, setSqlModalTarget] = useState('Complete Setup');

  // Navigation Items
  const adminNav = [
    { label: 'Overview', path: '/admin', icon: Building2 },
    { label: 'Enquiry CRM', path: '/admin/enquiries', icon: Mail },
    { label: 'Projects & CMS', path: '/admin/projects', icon: FolderOpen },
    { label: 'Quotations', path: '/admin/quotations', icon: FileCheck },
    { label: 'Client Orders', path: '/admin/orders', icon: Package },
    { label: 'Deliverables', path: '/admin/deliverables', icon: Download },
    { label: 'Support Tickets', path: '/admin/support', icon: FileText },
    { label: 'Services Catalog', path: '/admin/services', icon: Layers },
    { label: 'Pricing Plans', path: '/admin/pricing', icon: DollarSign },
    { label: 'Client Directory', path: '/admin/clients', icon: Users },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Website Settings', path: '/admin/settings', icon: Settings },
  ];

  const currentTab = adminNav.find((item) => item.path === currentPath) || adminNav[0];

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT ACROSS ALL MODULES
  // ---------------------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 1. Projects
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    slug: '',
    category: 'Websites',
    short_description: '',
    description: '',
    thumbnail_path: '',
    gallery_paths: '',
    live_demo_url: '',
    repository_url: '',
    is_published: false,
    status: 'in_progress',
    client_id: '',
    enquiry_id: '',
    deadline: '',
  });
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 2. Enquiries
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  // 3. Quotations
  const [quotationsList, setQuotationsList] = useState<any[]>([]);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [quotationForm, setQuotationForm] = useState({
    client_name: '',
    client_email: '',
    title: '',
    scope_description: '',
    price_amount: 0,
    currency: 'USD',
    estimated_delivery: '',
    status: 'draft',
    enquiry_id: '',
  });
  const [isSavingQuotation, setIsSavingQuotation] = useState(false);

  // 4. Orders
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    client_id: '',
    order_title: '',
    order_description: '',
    status: 'pending',
    agreed_amount: 0,
    currency: 'USD',
  });

  // 5. Deliverables
  const [deliverablesList, setDeliverablesList] = useState<any[]>([]);
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [deliverableForm, setDeliverableForm] = useState({
    order_id: '',
    client_id: '',
    project_id: '',
    file_name: '',
    storage_path: '',
    version: '1.0',
    file_size: 0,
  });
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);

  // 6. Support Tickets
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // 7. Clients
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');

  // 8. Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  // 9. Site Settings
  const [siteSettings, setSiteSettings] = useState({
    businessName: companyInfo.businessName,
    tagline: companyInfo.tagline,
    contactEmail: companyInfo.email,
    contactPhone: companyInfo.phoneStatus,
    whatsappNumber: 'Not configured yet',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    announcementEnabled: false,
    announcementText: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // ---------------------------------------------------------------------------
  // FETCHERS
  // ---------------------------------------------------------------------------
  const fetchAllData = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      setLoading(true);
      setGeneralError(null);

      // Projects
      const { data: pData, error: pErr } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (!pErr && pData) setProjectsList(pData);

      // Enquiries
      const { data: eData, error: eErr } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      if (!eErr && eData) {
        setEnquiriesList(eData);
        const notesMap: Record<string, string> = {};
        eData.forEach((item) => {
          notesMap[item.id] = item.internal_notes || '';
        });
        setActiveNotes(notesMap);
      }

      // Quotations
      const { data: qData } = await supabase.from('quotations').select('*').order('created_at', { ascending: false });
      if (qData) setQuotationsList(qData);

      // Orders
      const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (oData) setOrdersList(oData);

      // Deliverables
      const { data: dData } = await supabase.from('deliverables').select('*').order('created_at', { ascending: false });
      if (dData) setDeliverablesList(dData);

      // Support Tickets
      const { data: tData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (tData) setSupportTickets(tData);

      // Clients / Profiles
      const { data: profData } = await supabase.from('profiles').select('*');
      const { data: rolesData } = await supabase.from('user_roles').select('*');
      if (profData) {
        const merged = profData.map((pr) => ({
          ...pr,
          role: rolesData?.find((r) => r.user_id === pr.id)?.role || 'client',
        }));
        setClientsList(merged);
      }

      // Notifications
      const { data: nData } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false });
      if (nData) setNotifications(nData);

      // Settings
      const { data: sData } = await supabase.from('site_settings').select('*');
      if (sData && sData.length > 0) {
        const updated = { ...siteSettings };
        sData.forEach((row) => {
          if (row.setting_key === 'business_name') updated.businessName = row.setting_value;
          if (row.setting_key === 'brand_tagline') updated.tagline = row.setting_value;
          if (row.setting_key === 'contact_email') updated.contactEmail = row.setting_value;
          if (row.setting_key === 'contact_phone') updated.contactPhone = row.setting_value || 'Not configured yet';
          if (row.setting_key === 'whatsapp_number') updated.whatsappNumber = row.setting_value || 'Not configured yet';
          if (row.setting_key === 'social_links' && typeof row.setting_value === 'object') {
            updated.githubUrl = row.setting_value.github || '';
            updated.linkedinUrl = row.setting_value.linkedin || '';
            updated.twitterUrl = row.setting_value.twitter || '';
          }
          if (row.setting_key === 'announcement_banner' && typeof row.setting_value === 'object') {
            updated.announcementEnabled = !!row.setting_value.enabled;
            updated.announcementText = row.setting_value.text || '';
          }
        });
        setSiteSettings(updated);
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to sync with Supabase tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentPath]);

  // ---------------------------------------------------------------------------
  // ENQUIRY CONVERSION & NOTE ACTIONS
  // ---------------------------------------------------------------------------
  const handleConvertEnquiryToProject = (enquiry: any) => {
    setEditingProjectId(null);
    setProjectForm({
      title: enquiry.project_title || '',
      slug: (enquiry.project_title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: 'Websites',
      short_description: `Commissioned from enquiry by ${enquiry.full_name}`,
      description: enquiry.project_description || '',
      thumbnail_path: '',
      gallery_paths: '',
      live_demo_url: '',
      repository_url: '',
      is_published: false,
      status: 'in_progress',
      client_id: '',
      enquiry_id: enquiry.id,
      deadline: enquiry.deadline || '',
    });
    setProjectModalOpen(true);
  };

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setEnquiriesList((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    } catch (err: any) {
      alert(`Error updating status: ${err?.message || err}`);
    }
  };

  const handleSaveInternalNotes = async (id: string) => {
    try {
      setSavingNotesId(id);
      const notes = activeNotes[id] || '';
      const { error } = await supabase
        .from('enquiries')
        .update({ internal_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      alert('Internal note saved to database.');
    } catch (err: any) {
      alert(`Error: ${err?.message || err}`);
    } finally {
      setSavingNotesId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // PROJECT ACTIONS
  // ---------------------------------------------------------------------------
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.slug.trim()) return;

    try {
      setIsSavingProject(true);
      const galleryArr = projectForm.gallery_paths
        ? projectForm.gallery_paths.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: projectForm.title.trim(),
        slug: projectForm.slug.trim(),
        category: projectForm.category,
        short_description: projectForm.short_description.trim(),
        description: projectForm.description.trim(),
        thumbnail_path: projectForm.thumbnail_path.trim() || null,
        gallery_paths: galleryArr,
        live_demo_url: projectForm.live_demo_url.trim() || null,
        repository_url: projectForm.repository_url.trim() || null,
        is_published: projectForm.is_published,
        status: projectForm.status,
        client_id: projectForm.client_id || null,
        enquiry_id: projectForm.enquiry_id || null,
        deadline: projectForm.deadline || null,
        updated_at: new Date().toISOString(),
      };

      let createdId = editingProjectId;

      if (editingProjectId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProjectId);
        if (error) throw error;
      } else {
        const { data: newProj, error } = await supabase
          .from('projects')
          .insert({ ...payload, created_by: user?.id || null })
          .select('id')
          .single();
        if (error) throw error;
        createdId = newProj?.id;
      }

      // If created from an enquiry, link converted_project_id and set enquiry to confirmed
      if (projectForm.enquiry_id && createdId) {
        await supabase
          .from('enquiries')
          .update({
            converted_project_id: createdId,
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectForm.enquiry_id);
      }

      setProjectModalOpen(false);
      await fetchAllData();
    } catch (err: any) {
      alert(`Save error: ${err?.message || err}`);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const { error } = await supabase.from('projects').update({ is_published: !currentPublished }).eq('id', id);
      if (error) throw error;
      setProjectsList((prev) => prev.map((p) => (p.id === id ? { ...p, is_published: !currentPublished } : p)));
    } catch (err: any) {
      alert(`Error toggling publish: ${err?.message || err}`);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete project "${title}"?`)) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjectsList((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Error deleting project: ${err?.message || err}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniquePath = `thumbnails/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage.from('project-assets').upload(uniquePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('project-assets').getPublicUrl(uniquePath);
      setProjectForm((prev) => ({ ...prev, thumbnail_path: data.publicUrl }));
    } catch (err: any) {
      alert(`Upload error: ${err?.message || 'Bucket project-assets not ready'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // ---------------------------------------------------------------------------
  // QUOTATION ACTIONS
  // ---------------------------------------------------------------------------
  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingQuotation(true);
      const payload = {
        client_name: quotationForm.client_name.trim(),
        client_email: quotationForm.client_email.trim(),
        title: quotationForm.title.trim(),
        scope_description: quotationForm.scope_description.trim(),
        price_amount: Number(quotationForm.price_amount) || 0,
        currency: quotationForm.currency,
        estimated_delivery: quotationForm.estimated_delivery.trim(),
        status: quotationForm.status,
        enquiry_id: quotationForm.enquiry_id || null,
        created_by: user?.id || null,
        updated_at: new Date().toISOString(),
      };

      if (editingQuotationId) {
        const { error } = await supabase.from('quotations').update(payload).eq('id', editingQuotationId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('quotations').insert(payload);
        if (error) throw error;
      }

      setQuotationModalOpen(false);
      await fetchAllData();
    } catch (err: any) {
      alert(`Quotation error: ${err?.message || err}`);
    } finally {
      setIsSavingQuotation(false);
    }
  };

  // ---------------------------------------------------------------------------
  // DELIVERABLE ACTIONS (SECURE STORAGE)
  // ---------------------------------------------------------------------------
  const handleDeliverableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!deliverableForm.client_id) {
      alert('Please select a target client first.');
      return;
    }

    try {
      setUploadingDeliverable(true);
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniquePath = `${deliverableForm.client_id}/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage.from('client-deliverables').upload(uniquePath, file);
      if (uploadError) throw uploadError;

      setDeliverableForm((prev) => ({
        ...prev,
        file_name: file.name,
        storage_path: uniquePath,
        file_size: file.size,
      }));
      alert('File uploaded to private client-deliverables bucket. Click Save Deliverable to register.');
    } catch (err: any) {
      alert(`Upload error: ${err?.message || err}`);
    } finally {
      setUploadingDeliverable(false);
    }
  };

  const handleSaveDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableForm.storage_path) {
      alert('Please upload a deliverable file first.');
      return;
    }

    try {
      const { error } = await supabase.from('deliverables').insert({
        order_id: deliverableForm.order_id || null,
        client_id: deliverableForm.client_id,
        project_id: deliverableForm.project_id || null,
        file_name: deliverableForm.file_name,
        storage_path: deliverableForm.storage_path,
        file_size: deliverableForm.file_size,
        version: deliverableForm.version || '1.0',
        is_available: true,
      });
      if (error) throw error;

      setDeliverableModalOpen(false);
      await fetchAllData();
    } catch (err: any) {
      alert(`Save deliverable error: ${err?.message || err}`);
    }
  };

  const handleGetSignedDeliverableUrl = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('client-deliverables').createSignedUrl(path, 3600);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      alert(`Secure link error: ${err?.message || err}`);
    }
  };

  // ---------------------------------------------------------------------------
  // SUPPORT TICKET REPLY
  // ---------------------------------------------------------------------------
  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          admin_reply: ticketReplyText.trim(),
          replied_at: new Date().toISOString(),
          status: 'resolved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);
      if (error) throw error;

      setReplyTicketId(null);
      setTicketReplyText('');
      await fetchAllData();
      alert('Support ticket reply saved and marked as resolved.');
    } catch (err: any) {
      alert(`Reply error: ${err?.message || err}`);
    }
  };

  // ---------------------------------------------------------------------------
  // NOTIFICATIONS ACTION
  // ---------------------------------------------------------------------------
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // Ignored
    }
  };

  // ---------------------------------------------------------------------------
  // SETTINGS ACTION
  // ---------------------------------------------------------------------------
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const rows = [
        { setting_key: 'business_name', setting_value: JSON.stringify(siteSettings.businessName), updated_at: new Date().toISOString() },
        { setting_key: 'brand_tagline', setting_value: JSON.stringify(siteSettings.tagline), updated_at: new Date().toISOString() },
        { setting_key: 'contact_email', setting_value: JSON.stringify(siteSettings.contactEmail), updated_at: new Date().toISOString() },
        { setting_key: 'contact_phone', setting_value: siteSettings.contactPhone ? JSON.stringify(siteSettings.contactPhone) : null, updated_at: new Date().toISOString() },
        { setting_key: 'whatsapp_number', setting_value: siteSettings.whatsappNumber ? JSON.stringify(siteSettings.whatsappNumber) : null, updated_at: new Date().toISOString() },
        {
          setting_key: 'social_links',
          setting_value: { github: siteSettings.githubUrl, linkedin: siteSettings.linkedinUrl, twitter: siteSettings.twitterUrl },
          updated_at: new Date().toISOString(),
        },
        {
          setting_key: 'announcement_banner',
          setting_value: { enabled: siteSettings.announcementEnabled, text: siteSettings.announcementText },
          updated_at: new Date().toISOString(),
        },
      ];

      await supabase.from('site_settings').upsert(rows, { onConflict: 'setting_key' });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3500);
    } catch (err: any) {
      alert(`Settings note: ${err?.message || err}`);
    } finally {
      setSavingSettings(false);
    }
  };

  // ---------------------------------------------------------------------------
  // ADMIN GRANT SQL SNIPPET
  // ---------------------------------------------------------------------------
  const adminGrantSql = `INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'sstechworks01@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';`;

  const [copiedSql, setCopiedSql] = useState(false);
  const handleCopyAdminSql = () => {
    navigator.clipboard.writeText(adminGrantSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col md:flex-row bg-[#06080d]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0e18] border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <currentTab.icon className="w-4 h-4 text-blue-400" />
          <span>Admin: {currentTab.label}</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          aria-label="Toggle Admin Sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#080b12] border-r border-slate-800/80 p-5 shrink-0 flex flex-col justify-between`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/a_clean_high_resolution_futuristic_tech_logo_bra_0b441d93.png"
              alt="SS TECHWORKS"
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-blue-500/30"
            />
            <div className="min-w-0">
              <div className="text-[10px] text-blue-400 font-mono tracking-wider">ADMIN POWER PANEL</div>
              <h2 className="text-sm font-bold text-white truncate">SS TECHWORKS</h2>
            </div>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.path === '/admin/enquiries' && enquiriesList.filter((e) => e.status === 'new').length > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-mono">
                      {enquiriesList.filter((e) => e.status === 'new').length}
                    </span>
                  )}
                  {item.path === '/admin/notifications' && notifications.filter((n) => !n.is_read).length > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold font-mono">
                      {notifications.filter((n) => !n.is_read).length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-850 space-y-3">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">RBAC Status:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isAdmin
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                    : 'bg-amber-950 text-amber-400 border border-amber-900'
                }`}
              >
                {isAdmin ? 'ADMIN' : (role || 'CLIENT')}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'Guest Visitor'}</p>
          </div>

          <button
            onClick={() => {
              setSqlModalTarget('Complete Setup & Schema Repair');
              setSqlModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-300 bg-blue-950/40 hover:bg-blue-950/70 border border-blue-900/50 rounded-lg transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Database SQL Migration</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-center px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
          >
            Return to Public Website
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <section className="flex-1 p-6 md:p-10 max-w-6xl overflow-y-auto">
        {/* Top Header */}
        <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800 mb-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-blue-400 font-mono mb-1">
                <span>SS TECHWORKS · CENTRAL OPERATIONS POWER PANEL</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{currentTab.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage your software and AI development business from one console. All records are queried and mutated in real time directly from your Supabase database.
          </p>
        </div>

        {/* Administrator Role Warning if user is not authorized in user_roles */}
        {!isAdmin && (
          <div className="mb-8 p-5 rounded-xl bg-amber-950/25 border border-amber-800/40 text-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-semibold text-white">Administrator Authorization Setup</h4>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  You are currently authenticated as <strong>{user?.email || 'a visitor'}</strong>. Administrative CRUD privileges are strictly guarded by PostgreSQL Row Level Security (<code className="font-mono text-amber-300">public.is_admin()</code>).
                </p>
                <p className="text-xs text-amber-200/80">
                  To authorize your official business account (<code className="font-mono text-white">sstechworks01@gmail.com</code>), run this command in your Supabase SQL Editor:
                </p>
                <div className="mt-2 relative">
                  <pre className="p-3 rounded-lg bg-black/60 border border-amber-900/50 text-[11px] font-mono text-amber-100 overflow-x-auto">
                    {adminGrantSql}
                  </pre>
                  <button
                    onClick={handleCopyAdminSql}
                    className="absolute right-2 top-2 px-2.5 py-1 text-[11px] font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors flex items-center gap-1"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-800" /> : null}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Error Banner */}
        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Database Sync Note: {generalError}</span>
            </div>
            <button
              onClick={() => {
                setSqlModalTarget('Full Setup');
                setSqlModalOpen(true);
              }}
              className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-white rounded text-xs"
            >
              Check SQL Setup
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 1. OVERVIEW TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin' && (
          <div className="space-y-8">
            {/* Live KPI Statistics Calculated from Supabase Records */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Total Clients</span>
                <div className="text-2xl font-bold text-white font-mono">{clientsList.length}</div>
                <span className="text-[10px] text-blue-400">Registered profiles</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">New Enquiries</span>
                <div className="text-2xl font-bold text-white font-mono">
                  {enquiriesList.filter((e) => e.status === 'new').length}
                </div>
                <span className="text-[10px] text-amber-400">Awaiting first review</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Pending Quotes</span>
                <div className="text-2xl font-bold text-white font-mono">
                  {quotationsList.filter((q) => q.status === 'sent' || q.status === 'draft').length}
                </div>
                <span className="text-[10px] text-purple-400">Formal proposals</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Active Projects</span>
                <div className="text-2xl font-bold text-white font-mono">
                  {projectsList.filter((p) => p.status === 'in_progress' || !p.status).length}
                </div>
                <span className="text-[10px] text-cyan-400">In development</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Completed Projects</span>
                <div className="text-2xl font-bold text-white font-mono">
                  {projectsList.filter((p) => p.status === 'completed').length}
                </div>
                <span className="text-[10px] text-emerald-400">Delivered</span>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/enquiries"
                className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                    Review &rarr;
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">Enquiry CRM Pipeline</h4>
                <p className="text-xs text-slate-400">
                  Advance 9-step progression statuses, add private internal notes, and convert briefs to projects.
                </p>
              </Link>

              <Link
                to="/admin/projects"
                className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <FolderOpen className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">
                    Manage &rarr;
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">Project & Portfolio CMS</h4>
                <p className="text-xs text-slate-400">
                  Publish verified case studies, assign authorized clients, set deadlines, and manage milestones.
                </p>
              </Link>

              <Link
                to="/admin/quotations"
                className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <FileCheck className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                    Proposals &rarr;
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">Quotations & Scopes</h4>
                <p className="text-xs text-slate-400">
                  Generate formal estimates, record client approvals, and transition proposals to confirmed orders.
                </p>
              </Link>
            </div>

            {/* Recent Enquiries & Recent Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Enquiries */}
              <div className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Recent Inbound Enquiries</span>
                  </h4>
                  <Link to="/admin/enquiries" className="text-xs text-blue-400 hover:underline">
                    View all ({enquiriesList.length})
                  </Link>
                </div>
                {enquiriesList.length > 0 ? (
                  <div className="space-y-2">
                    {enquiriesList.slice(0, 4).map((enq) => (
                      <div
                        key={enq.id}
                        className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{enq.project_title}</div>
                          <div className="text-slate-400 text-[11px] truncate">
                            {enq.full_name} · {enq.email}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono shrink-0 bg-blue-950/50 text-blue-300 border border-blue-900/50">
                          {enq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No inbound client enquiries recorded yet.</p>
                )}
              </div>

              {/* Recent Projects */}
              <div className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                    <span>Recent Project Updates</span>
                  </h4>
                  <Link to="/admin/projects" className="text-xs text-cyan-400 hover:underline">
                    View all ({projectsList.length})
                  </Link>
                </div>
                {projectsList.length > 0 ? (
                  <div className="space-y-2">
                    {projectsList.slice(0, 4).map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{proj.title}</div>
                          <div className="text-slate-400 text-[11px] truncate">
                            {proj.category} · /{proj.slug}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 border ${
                            proj.is_published
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/60'
                              : 'bg-amber-950/60 text-amber-400 border-amber-900/60'
                          }`}
                        >
                          {proj.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No projects in database yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 2. ENQUIRY CRM TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/enquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Inbound Enquiry CRM Pipeline</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track prospective projects through the 9-stage lifecycle, annotate private notes, and convert to projects.
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={enquirySearch}
                  onChange={(e) => setEnquirySearch(e.target.value)}
                  placeholder="Search by client name, email, or project..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#0b0f19] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 shrink-0">Stage:</span>
                <select
                  value={enquiryStatusFilter}
                  onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-[#0b0f19] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Stages ({enquiriesList.length})</option>
                  {ENQUIRY_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label} ({enquiriesList.filter((e) => e.status === st.value).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            {enquiriesList.length > 0 ? (
              <div className="space-y-4">
                {enquiriesList
                  .filter((e) => {
                    const matchesStatus = enquiryStatusFilter === 'all' || e.status === enquiryStatusFilter;
                    const matchesSearch =
                      (e.full_name || '').toLowerCase().includes(enquirySearch.toLowerCase()) ||
                      (e.email || '').toLowerCase().includes(enquirySearch.toLowerCase()) ||
                      (e.project_title || '').toLowerCase().includes(enquirySearch.toLowerCase());
                    return matchesStatus && matchesSearch;
                  })
                  .map((enquiry) => {
                    const currentStatusObj =
                      ENQUIRY_STATUSES.find((s) => s.value === enquiry.status) || ENQUIRY_STATUSES[0];
                    return (
                      <div
                        key={enquiry.id}
                        className="p-6 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-4 hover:border-slate-750 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-white">{enquiry.full_name}</span>
                              <span className="text-slate-600">·</span>
                              <a
                                href={`mailto:${enquiry.email}`}
                                className="text-xs text-blue-400 hover:underline font-mono"
                              >
                                {enquiry.email}
                              </a>
                              {enquiry.whatsapp_number && (
                                <>
                                  <span className="text-slate-600">·</span>
                                  <span className="text-xs text-emerald-400 font-mono">
                                    WhatsApp: {enquiry.whatsapp_number}
                                  </span>
                                </>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-white mt-1">{enquiry.project_title}</h3>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={enquiry.status || 'new'}
                              onChange={(e) => handleUpdateEnquiryStatus(enquiry.id, e.target.value)}
                              className={`px-2.5 py-1 text-xs font-medium rounded-lg border focus:outline-none ${currentStatusObj.color} bg-black/40`}
                            >
                              {ENQUIRY_STATUSES.map((st) => (
                                <option key={st.value} value={st.value} className="bg-slate-900 text-white">
                                  {st.label}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleConvertEnquiryToProject(enquiry)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Convert to Project</span>
                            </button>
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-900 text-xs">
                          <div>
                            <span className="text-slate-500 block">Budget:</span>
                            <span className="text-slate-200 font-medium">{enquiry.budget_range || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Target Timeline:</span>
                            <span className="text-slate-200 font-medium">{enquiry.deadline || 'Flexible'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Received Date:</span>
                            <span className="text-slate-400 font-mono">
                              {new Date(enquiry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Client Brief & Scope
                          </span>
                          <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-[#070a11] p-3 rounded-lg border border-slate-850">
                            {enquiry.project_description}
                          </p>
                        </div>

                        {/* Private Internal Notes */}
                        <div className="pt-2 border-t border-slate-850 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Private Administrator Internal Notes</span>
                            </label>
                            <button
                              onClick={() => handleSaveInternalNotes(enquiry.id)}
                              disabled={savingNotesId === enquiry.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50"
                            >
                              {savingNotesId === enquiry.id ? (
                                <span>Saving...</span>
                              ) : (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Save Note</span>
                                </>
                              )}
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={activeNotes[enquiry.id] || ''}
                            onChange={(e) =>
                              setActiveNotes({ ...activeNotes, [enquiry.id]: e.target.value })
                            }
                            placeholder="Record private engineering scoping notes, phone call summaries, or agreed quotation details..."
                            className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 leading-relaxed"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <Mail className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Enquiries Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When potential clients submit the Project Enquiry form on the public Contact page, their submissions will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 3. PROJECTS & CMS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Projects & Portfolio Case Studies CMS</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage active client projects and public portfolio entries with real Supabase synchronization.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProjectId(null);
                  setProjectForm({
                    title: '',
                    slug: '',
                    category: 'Websites',
                    short_description: '',
                    description: '',
                    thumbnail_path: '',
                    gallery_paths: '',
                    live_demo_url: '',
                    repository_url: '',
                    is_published: false,
                    status: 'in_progress',
                    client_id: '',
                    enquiry_id: '',
                    deadline: '',
                  });
                  setProjectModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            </div>

            {projectsList.length > 0 ? (
              <div className="space-y-3">
                {projectsList.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                            p.is_published
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/60'
                              : 'bg-amber-950/60 text-amber-400 border-amber-900/60'
                          }`}
                        >
                          {p.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 font-mono">
                          {p.status || 'in_progress'}
                        </span>
                        <span className="text-xs text-blue-400 font-medium">{p.category}</span>
                        <span className="text-xs text-slate-400 font-mono">/{p.slug}</span>
                      </div>
                      <h4 className="text-base font-semibold text-white truncate">{p.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{p.short_description || p.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <button
                        onClick={() => handleTogglePublish(p.id, p.is_published)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          p.is_published
                            ? 'bg-amber-950/40 text-amber-300 border-amber-900/50 hover:bg-amber-950/70'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50 hover:bg-emerald-950/70'
                        }`}
                      >
                        {p.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{p.is_published ? 'Unpublish' : 'Publish'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingProjectId(p.id);
                          setProjectForm({
                            title: p.title || '',
                            slug: p.slug || '',
                            category: p.category || 'Websites',
                            short_description: p.short_description || '',
                            description: p.description || '',
                            thumbnail_path: p.thumbnail_path || '',
                            gallery_paths: Array.isArray(p.gallery_paths) ? p.gallery_paths.join(', ') : '',
                            live_demo_url: p.live_demo_url || '',
                            repository_url: p.repository_url || '',
                            is_published: !!p.is_published,
                            status: p.status || 'in_progress',
                            client_id: p.client_id || '',
                            enquiry_id: p.enquiry_id || '',
                            deadline: p.deadline || '',
                          });
                          setProjectModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id, p.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-4">
                <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Projects In Database Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Zero fake projects exist in adherence with the Truth-in-Engineering policy. Click below to add the first verified client case study.
                </p>
                <button
                  onClick={() => {
                    setEditingProjectId(null);
                    setProjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Project</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 4. QUOTATIONS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/quotations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Quotations & Formal Scopes</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prepare structured technical estimates, delivery timelines, and client approval records.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingQuotationId(null);
                  setQuotationForm({
                    client_name: '',
                    client_email: '',
                    title: '',
                    scope_description: '',
                    price_amount: 0,
                    currency: 'USD',
                    estimated_delivery: '',
                    status: 'draft',
                    enquiry_id: '',
                  });
                  setQuotationModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quotation</span>
              </button>
            </div>

            {quotationsList.length > 0 ? (
              <div className="space-y-3">
                {quotationsList.map((q) => (
                  <div key={q.id} className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-xs text-slate-400">
                          <span>{q.client_name}</span> · <span className="font-mono">{q.client_email}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">{q.title}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-900/60">
                        {q.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-[#07090e] p-3 rounded-lg border border-slate-850">
                      {q.scope_description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                      <div className="font-mono text-emerald-400 font-semibold">
                        Estimated Fee: ${Number(q.price_amount).toLocaleString()} {q.currency}
                      </div>
                      <div className="text-slate-400">
                        Estimated Delivery: {q.estimated_delivery || 'TBD'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Quotations Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Create formal proposals and quotations to send to prospective clients after requirement discovery.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 5. ORDERS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Client Contracts & Orders</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirmed client agreements linked to deliverables. Financial distinction: Orders indicate agreed contracts, not verified payment transactions.
                </p>
              </div>
            </div>

            {ordersList.length > 0 ? (
              <div className="space-y-3">
                {ordersList.map((ord) => (
                  <div key={ord.id} className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-blue-400">Order #{ord.id.slice(0, 8)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-900 border border-slate-800 text-slate-300">
                        {ord.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{ord.order_title}</h4>
                    <p className="text-xs text-slate-400">{ord.order_description}</p>
                    {ord.agreed_amount && (
                      <div className="text-xs text-emerald-400 font-mono">
                        Agreed Contract Amount: ${Number(ord.agreed_amount).toLocaleString()} {ord.currency}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <Package className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Active Client Orders</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Confirmed client contracts will appear here once approved by clients.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 6. DELIVERABLES TAB (SECURE SUPABASE STORAGE) */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/deliverables' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Secure Client Deliverables</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stored in private Supabase Storage (<code className="text-blue-300 font-mono">client-deliverables</code>) and accessed strictly via time-limited signed URLs.
                </p>
              </div>
              <button
                onClick={() => {
                  setDeliverableForm({
                    order_id: '',
                    client_id: clientsList[0]?.id || '',
                    project_id: '',
                    file_name: '',
                    storage_path: '',
                    version: '1.0',
                    file_size: 0,
                  });
                  setDeliverableModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Final Deliverable</span>
              </button>
            </div>

            {deliverablesList.length > 0 ? (
              <div className="space-y-3">
                {deliverablesList.map((del) => (
                  <div
                    key={del.id}
                    className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-white">{del.file_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                          v{del.version}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        Path: {del.storage_path} · {Math.round(del.file_size / 1024)} KB
                      </div>
                    </div>

                    <button
                      onClick={() => handleGetSignedDeliverableUrl(del.storage_path)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-950/40 hover:bg-blue-950/70 border border-blue-900/50 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download (Signed URL)</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <Download className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Deliverables Uploaded Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When project milestones are ready, upload signed client builds, APKs, source archives, or documentation here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 7. SUPPORT TICKETS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/support' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Client Support Tickets</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review client questions, record official engineering responses, and update resolution states.
                </p>
              </div>
            </div>

            {supportTickets.length > 0 ? (
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{ticket.subject}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#07090e] p-3 rounded-lg border border-slate-850">
                      {ticket.message}
                    </p>

                    {ticket.admin_reply ? (
                      <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40 text-xs text-blue-200 space-y-1">
                        <span className="font-semibold block text-blue-300">Administrator Response:</span>
                        <p>{ticket.admin_reply}</p>
                        {ticket.replied_at && (
                          <span className="text-[10px] text-slate-500 block pt-1 font-mono">
                            Replied: {new Date(ticket.replied_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-slate-850">
                        {replyTicketId === ticket.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={ticketReplyText}
                              onChange={(e) => setTicketReplyText(e.target.value)}
                              placeholder="Write official response to client..."
                              className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReplyTicket(ticket.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                              >
                                Send & Resolve
                              </button>
                              <button
                                onClick={() => setReplyTicketId(null)}
                                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyTicketId(ticket.id);
                              setTicketReplyText('');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-900/50 rounded-lg"
                          >
                            Reply to Ticket
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Support Tickets</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When clients raise questions or technical support requests in their portal, they will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 8. SERVICES CATALOG TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Configured Services Catalog ({servicesList.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Core capabilities delivered by SS TECHWORKS across Web, Mobile, Custom Software, and AI.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicesList.map((service) => (
                <div
                  key={service.slug}
                  className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <span className="text-[11px] font-mono text-blue-400">{service.category}</span>
                  <h4 className="text-sm font-bold text-white">{service.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{service.shortDescription}</p>
                  <div className="pt-2 text-[11px] text-slate-500 font-mono">
                    Slug: /{service.slug}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 9. PRICING PLANS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/pricing' && (
          <div className="p-8 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Pricing Model Configuration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent project scoping plans stored in the <code className="text-blue-300 font-mono">pricing_plans</code> table:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs text-blue-400 font-mono">TIER 1</span>
                <h4 className="text-sm font-bold text-white">MVP & Prototype Scoping</h4>
                <p className="text-xs text-slate-400">Fast validation, core responsive flow, and pre-configured deployment.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs text-cyan-400 font-mono">TIER 2</span>
                <h4 className="text-sm font-bold text-white">Full-Scale Custom System</h4>
                <p className="text-xs text-slate-400">Full-stack database architecture, role-based controls, and automated tests.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs text-purple-400 font-mono">TIER 3</span>
                <h4 className="text-sm font-bold text-white">Enterprise & Media Pipelines</h4>
                <p className="text-xs text-slate-400">Generative AI algorithms, high-throughput queues, and SLA delivery.</p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 10. CLIENTS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/clients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Client Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronized with Supabase Auth users, <code className="text-blue-300 font-mono">profiles</code>, and <code className="text-blue-300 font-mono">user_roles</code>.
                </p>
              </div>
            </div>

            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search clients by name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#0b0f19] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {clientsList.length > 0 ? (
              <div className="space-y-2">
                {clientsList
                  .filter((c) =>
                    (c.full_name || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
                    (c.email || '').toLowerCase().includes(clientSearch.toLowerCase())
                  )
                  .map((client) => (
                    <div
                      key={client.id}
                      className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {client.full_name || 'Anonymous User'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{client.email}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                          client.role === 'admin'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-900/60'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-900/60'
                        }`}
                      >
                        {client.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Registered Clients Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Client profiles are created automatically via Supabase triggers whenever a client creates an account.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 11. NOTIFICATIONS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Admin Operations Notification Center</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Internal audit notifications generated automatically by database triggers.
                </p>
              </div>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                      n.is_read
                        ? 'bg-[#0b0f19] border-slate-850 opacity-70'
                        : 'bg-blue-950/20 border-blue-900/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bell className={`w-4 h-4 ${n.is_read ? 'text-slate-500' : 'text-blue-400'}`} />
                        <span className="text-xs font-semibold text-white">{n.title}</span>
                      </div>
                      <p className="text-xs text-slate-300">{n.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>

                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkNotificationRead(n.id)}
                        className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
                <Bell className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No New Notifications</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You are all caught up! Automated database triggers will record event notices here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 12. WEBSITE SETTINGS TAB */}
        {/* ------------------------------------------------------------------ */}
        {currentPath === '/admin/settings' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Company Brand & Website Settings</h3>
              <p className="text-xs text-slate-400 mt-1">
                Persisted in Supabase <code className="text-blue-300 font-mono">site_settings</code> table. Contact details, social links, and public announcements:
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Brand and contact parameters updated in Supabase site_settings table.</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Business Name</label>
                <input
                  type="text"
                  value={siteSettings.businessName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Official Tagline</label>
                <input
                  type="text"
                  value={siteSettings.tagline}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Primary Contact Email</label>
                <input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Contact Phone Number</label>
                  <input
                    type="text"
                    value={siteSettings.contactPhone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                    placeholder="Not configured yet"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">WhatsApp Business Number</label>
                  <input
                    type="text"
                    value={siteSettings.whatsappNumber}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })}
                    placeholder="Not configured yet"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-2 border-t border-slate-850 space-y-3">
                <span className="text-xs font-semibold text-white block">Official Social Media Profiles</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={siteSettings.githubUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, githubUrl: e.target.value })}
                    placeholder="GitHub URL (e.g. https://github.com/...)"
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={siteSettings.linkedinUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, linkedinUrl: e.target.value })}
                    placeholder="LinkedIn URL (e.g. https://linkedin.com/company/...)"
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={siteSettings.twitterUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, twitterUrl: e.target.value })}
                    placeholder="X / Twitter URL (e.g. https://x.com/...)"
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Homepage Announcement */}
              <div className="pt-2 border-t border-slate-850 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.announcementEnabled}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, announcementEnabled: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-white">Enable Homepage Announcement Banner</span>
                </label>
                {siteSettings.announcementEnabled && (
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, announcementText: e.target.value })
                    }
                    placeholder="e.g. Now taking Q3 enterprise development bookings"
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                >
                  {savingSettings ? 'Saving to Database...' : 'Save Website Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* PROJECT CREATE / EDIT MODAL */}
      {/* -------------------------------------------------------------------- */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingProjectId ? 'Edit Project Record' : 'Create New Project / Case Study'}
              </h3>
              <button
                onClick={() => setProjectModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Project Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      const slugGen = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setProjectForm({
                        ...projectForm,
                        title: val,
                        slug: editingProjectId ? projectForm.slug : slugGen,
                      });
                    }}
                    placeholder="e.g. Enterprise Logistics Platform"
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    URL Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Websites">Websites</option>
                    <option value="Android Apps">Android Apps</option>
                    <option value="Software">Software</option>
                    <option value="AI Tools">AI Tools</option>
                    <option value="Photo and Video">Photo and Video</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Internal Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Public Portfolio</label>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={projectForm.is_published}
                      onChange={(e) => setProjectForm({ ...projectForm, is_published: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="text-xs text-white">Publish Case Study</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Short Description</label>
                <input
                  type="text"
                  value={projectForm.short_description}
                  onChange={(e) => setProjectForm({ ...projectForm, short_description: e.target.value })}
                  placeholder="Summary of business impact"
                  className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Full Scope & Technical Details</label>
                <textarea
                  rows={4}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Comprehensive technical breakdown..."
                  className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Thumbnail & Supabase Storage */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Thumbnail Image (URL or Supabase Storage Upload)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectForm.thumbnail_path}
                    onChange={(e) => setProjectForm({ ...projectForm, thumbnail_path: e.target.value })}
                    placeholder="https://... or upload to storage"
                    className="flex-1 px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <label className="px-3 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0">
                    <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Live Platform Demo URL</label>
                  <input
                    type="url"
                    value={projectForm.live_demo_url}
                    onChange={(e) => setProjectForm({ ...projectForm, live_demo_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Target Deadline</label>
                  <input
                    type="text"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    placeholder="e.g. Nov 30, 2026"
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSavingProject ? 'Saving...' : editingProjectId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* QUOTATION MODAL */}
      {/* -------------------------------------------------------------------- */}
      {quotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create Formal Quotation</h3>
              <button
                onClick={() => setQuotationModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Client Full Name</label>
                  <input
                    type="text"
                    required
                    value={quotationForm.client_name}
                    onChange={(e) => setQuotationForm({ ...quotationForm, client_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Client Email</label>
                  <input
                    type="email"
                    required
                    value={quotationForm.client_email}
                    onChange={(e) => setQuotationForm({ ...quotationForm, client_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={quotationForm.title}
                  onChange={(e) => setQuotationForm({ ...quotationForm, title: e.target.value })}
                  placeholder="e.g. High-Volume E-Commerce Platform"
                  className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Scope & Deliverable Description</label>
                <textarea
                  rows={3}
                  required
                  value={quotationForm.scope_description}
                  onChange={(e) => setQuotationForm({ ...quotationForm, scope_description: e.target.value })}
                  placeholder="Breakdown of deliverable features, testing milestones, and architecture..."
                  className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Quotation Price ($ USD)</label>
                  <input
                    type="number"
                    value={quotationForm.price_amount}
                    onChange={(e) => setQuotationForm({ ...quotationForm, price_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Estimated Timeline</label>
                  <input
                    type="text"
                    value={quotationForm.estimated_delivery}
                    onChange={(e) => setQuotationForm({ ...quotationForm, estimated_delivery: e.target.value })}
                    placeholder="e.g. 4 Weeks"
                    className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuotationModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuotation}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSavingQuotation ? 'Saving...' : 'Record Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* DELIVERABLE MODAL (SECURE STORAGE) */}
      {/* -------------------------------------------------------------------- */}
      {deliverableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Upload Private Client Deliverable</h3>
              <button
                onClick={() => setDeliverableModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeliverable} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">
                  Assign to Client <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={deliverableForm.client_id}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select registered client profile</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || 'Client'} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Version Number</label>
                <input
                  type="text"
                  value={deliverableForm.version}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, version: e.target.value })}
                  placeholder="1.0"
                  className="w-full px-3 py-2 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Deliverable Archive File (ZIP, PDF, APK, etc.)
                </label>
                <input
                  type="file"
                  onChange={handleDeliverableUpload}
                  disabled={uploadingDeliverable}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
                {uploadingDeliverable && (
                  <p className="text-xs text-blue-400 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    <span>Uploading file to private storage bucket...</span>
                  </p>
                )}
                {deliverableForm.file_name && (
                  <p className="text-xs text-emerald-400">
                    Uploaded: <span className="font-mono">{deliverableForm.file_name}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeliverableModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!deliverableForm.storage_path}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  Save Deliverable Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* SQL SETUP / REPAIR MODAL */}
      {/* -------------------------------------------------------------------- */}
      <SqlSetupModal
        isOpen={sqlModalOpen}
        onClose={() => setSqlModalOpen(false)}
        targetTable={sqlModalTarget}
      />
    </div>
  );
};
