import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileDown,
  Headphones,
  User,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Layers,
  ChevronRight,
  Menu,
  X,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Send,
  ExternalLink,
} from '../../components/common/IconHelper';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const ClientDashboardLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, profile, role, signOut, updateProfile } = useAuth();

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Profile edit form
  const [fullNameInput, setFullNameInput] = useState(profile?.full_name || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Signed URL download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders & Projects', path: '/dashboard/orders', icon: Package },
    { label: 'Deliverables & Downloads', path: '/dashboard/downloads', icon: FileDown },
    { label: 'Support & Tickets', path: '/dashboard/support', icon: Headphones },
    { label: 'Client Profile', path: '/dashboard/profile', icon: User },
  ];

  const currentTab = menuItems.find((item) => item.path === currentPath) || menuItems[0];

  useEffect(() => {
    if (profile?.full_name) {
      setFullNameInput(profile.full_name);
    }
  }, [profile]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || !isSupabaseConfigured()) {
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      try {
        // 1. Fetch Orders for current client
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
        if (ordersData) setOrders(ordersData);

        // 2. Fetch Deliverables for current client
        const { data: delivData } = await supabase
          .from('deliverables')
          .select('*')
          .eq('client_id', user.id)
          .eq('is_available', true)
          .order('created_at', { ascending: false });
        if (delivData) setDeliverables(delivData);

        // 3. Fetch Support Tickets for current client
        const { data: ticketsData } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
        if (ticketsData) setTickets(ticketsData);
      } catch (err) {
        console.error('Error fetching client data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchClientData();
  }, [user]);

  // Support ticket submission
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim() || !user) return;

    setTicketSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          client_id: user.id,
          subject: ticketSubject.trim(),
          message: ticketMessage.trim(),
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      setTickets((prev) => [data, ...prev]);
      setTicketSubject('');
      setTicketMessage('');
      setTicketSuccess(true);
      setTimeout(() => setTicketSuccess(false), 4000);
    } catch (err: any) {
      alert(`Error submitting ticket: ${err.message}`);
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Secure Deliverable Download via short-lived signed URL
  const handleDownload = async (deliverable: any) => {
    setDownloadingId(deliverable.id);
    try {
      const { data, error } = await supabase.storage
        .from('client-deliverables')
        .createSignedUrl(deliverable.storage_path, 60); // 60 seconds TTL

      if (error || !data?.signedUrl) {
        alert(`Failed to generate signed download link: ${error?.message || 'Unauthorized'}`);
      } else {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      alert(`Download error: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Profile Save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    const { error } = await updateProfile({ full_name: fullNameInput.trim() });
    setProfileSaving(false);

    if (error) {
      setProfileMessage(`Error: ${error.message}`);
    } else {
      setProfileMessage('Profile updated successfully.');
      setTimeout(() => setProfileMessage(null), 3500);
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrlData.publicUrl });
      setProfileMessage('Avatar photo updated.');
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err: any) {
      setProfileMessage(`Avatar upload error: ${err.message}`);
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col md:flex-row bg-[#07090e]">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0b0f19] border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <currentTab.icon className="w-4 h-4 text-blue-400" />
          <span>{currentTab.label}</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          aria-label="Toggle Portal Sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#0a0e18] border-r border-slate-800/80 p-5 shrink-0 flex flex-col justify-between`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/a_clean_high_resolution_futuristic_tech_logo_bra_0b441d93.png"
              alt="SS TECHWORKS"
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-blue-500/30"
            />
            <div className="min-w-0">
              <div className="text-[10px] text-blue-400 font-mono tracking-wider">CLIENT WORKSPACE</div>
              <h2 className="text-sm font-bold text-white truncate">
                {profile?.full_name ? profile.full_name : 'SS TECHWORKS Portal'}
              </h2>
              {user?.email && (
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              )}
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
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
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-850 space-y-3">
          {user ? (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/20 border border-slate-800 rounded-lg transition-colors"
            >
              <span>Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
            >
              <span>Sign In to Account</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <section className="flex-1 p-6 md:p-10 max-w-5xl">
        {/* If user is not authenticated */}
        {!user ? (
          <div className="p-8 rounded-2xl bg-[#0b0f19] border border-blue-900/40 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authentication Required</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Sign In to Access Your Client Workspace
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                  In adherence to our data privacy standards, private client contracts, deliverables, and tickets are strictly protected via Supabase Row Level Security. Sign in with your registered client credentials to access your data.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-md"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="space-y-8">
            {/* Top Bar Header */}
            <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-blue-400 font-mono mb-1">AUTHENTICATED CLIENT SESSION</div>
                <h1 className="text-2xl font-bold text-white">{currentTab.label}</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Connected to Supabase with client-specific Row Level Security
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  Role: <strong className="text-emerald-400 uppercase">{role || 'client'}</strong>
                </span>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {currentPath === '/dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Active Orders</span>
                    <div className="text-2xl font-bold text-white font-mono">{orders.length}</div>
                    <span className="text-[11px] text-slate-400">Scoped production contracts</span>
                  </div>
                  <div className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Available Deliverables</span>
                    <div className="text-2xl font-bold text-white font-mono">{deliverables.length}</div>
                    <span className="text-[11px] text-slate-400">Tokenized secure downloads</span>
                  </div>
                  <div className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Support Tickets</span>
                    <div className="text-2xl font-bold text-white font-mono">{tickets.length}</div>
                    <span className="text-[11px] text-slate-400">Resolved & active tickets</span>
                  </div>
                </div>

                {orders.length === 0 && (
                  <div className="p-8 rounded-xl bg-[#0b0f19] border border-slate-800 text-center space-y-3">
                    <Package className="w-8 h-8 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-semibold text-white">No Contracts or Orders Active</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Ready to start a new web, mobile, or custom software project? Submit an enquiry or request a scoping call.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                      >
                        <span>Submit Project Enquiry</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ORDERS */}
            {currentPath === '/dashboard/orders' && (
              <div className="space-y-4">
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white">{order.order_title}</h4>
                          <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-950/50 text-blue-300 border border-blue-900/40 uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{order.order_description}</p>
                        {order.agreed_amount && (
                          <div className="text-xs font-mono text-slate-300 pt-1">
                            Amount: {order.currency} ${order.agreed_amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[#0b0f19] border border-slate-800 text-center space-y-3">
                    <Package className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-base font-semibold text-white">No Orders on Record</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      All contracted projects and production orders linked to your account will be displayed here.
                    </p>
                    <div className="pt-2">
                      <Link to="/contact" className="text-xs text-blue-400 hover:text-blue-300">
                        Request a quote &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: DOWNLOADS */}
            {currentPath === '/dashboard/downloads' && (
              <div className="space-y-4">
                {deliverables.length > 0 ? (
                  <div className="space-y-3">
                    {deliverables.map((item) => (
                      <div key={item.id} className="p-5 rounded-xl bg-[#0b0f19] border border-slate-800 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{item.file_name}</h4>
                          <div className="text-xs text-slate-400">
                            Size: {(item.file_size / (1024 * 1024)).toFixed(2)} MB · Type: {item.content_type}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>{downloadingId === item.id ? 'Authorizing...' : 'Download'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[#0b0f19] border border-slate-800 text-center space-y-3">
                    <FileDown className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-base font-semibold text-white">No Deliverables Available</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Deliverables such as verified builds, production archives, and design packages are securely uploaded by SS TECHWORKS administrators and signed on-demand.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SUPPORT */}
            {currentPath === '/dashboard/support' && (
              <div className="space-y-8">
                {/* Create Support Ticket Form */}
                <div className="p-6 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Submit Technical Support Ticket</h3>

                  {ticketSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Support ticket submitted directly to Supabase. Our team will review it promptly.</span>
                    </div>
                  )}

                  <form onSubmit={handleTicketSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 block">Ticket Subject</label>
                      <input
                        type="text"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="e.g. Question regarding API integration or staging deploy"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 block">Message Details</label>
                      <textarea
                        rows={3}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Provide relevant details or steps..."
                        className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={ticketSubmitting}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{ticketSubmitting ? 'Submitting...' : 'Open Support Ticket'}</span>
                    </button>
                  </form>
                </div>

                {/* Ticket History */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Ticket History</h3>
                  {tickets.length > 0 ? (
                    <div className="space-y-3">
                      {tickets.map((t) => (
                        <div key={t.id} className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-white">{t.subject}</h4>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                              {t.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{t.message}</p>
                          <span className="text-[10px] text-slate-500 block pt-1">
                            Logged: {new Date(t.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No support tickets opened yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {currentPath === '/dashboard/profile' && (
              <div className="p-6 sm:p-8 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-6 max-w-xl">
                <div>
                  <h3 className="text-base font-bold text-white">Client Profile Settings</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your display name and avatar (stored in Supabase profiles)
                  </p>
                </div>

                {profileMessage && (
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200">
                    {profileMessage}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer">
                      <span>{avatarUploading ? 'Uploading...' : 'Upload New Avatar'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleAvatarUpload}
                        disabled={avatarUploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">JPEG, PNG, or WebP &lt; 5MB</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Email Address (Immutable)</label>
                    <input
                      type="text"
                      disabled
                      value={user.email || ''}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-850 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Full Name</label>
                    <input
                      type="text"
                      value={fullNameInput}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#07090e] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
