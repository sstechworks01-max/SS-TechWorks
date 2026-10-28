import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FolderOpen, ArrowRight, Info, AlertCircle, Database, RefreshCw, Code } from '../components/common/IconHelper';
import { portfolioCategories } from '../data/portfolioData';
import { ProjectItem } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SqlSetupModal } from '../components/common/SqlSetupModal';

export const PortfolioPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSchemaCacheError, setIsSchemaCacheError] = useState<boolean>(false);
  const [sqlModalOpen, setSqlModalOpen] = useState<boolean>(false);

  const fetchProjects = async () => {
    if (!isSupabaseConfigured()) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSchemaCacheError(false);

      // Select published projects
      const { data, error: dbError } = await supabase
        .from('projects')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (dbError) {
        const errMsg = dbError.message || 'Database error occurred';
        setError(errMsg);
        if (
          errMsg.toLowerCase().includes('schema cache') ||
          errMsg.toLowerCase().includes('could not find the table') ||
          dbError.code === 'PGRST204' ||
          dbError.code === '42P01'
        ) {
          setIsSchemaCacheError(true);
        }
        setProjects([]);
      } else if (data) {
        const mapped: ProjectItem[] = data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          category: d.category as any,
          description: d.short_description || d.description,
          technologies: Array.isArray(d.gallery_paths) ? d.gallery_paths : [],
          status: 'Published',
          completionDate: d.created_at,
        }));
        setProjects(mapped);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch projects';
      setError(msg);
      if (msg.toLowerCase().includes('schema cache') || msg.toLowerCase().includes('projects')) {
        setIsSchemaCacheError(true);
      }
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filtering on actual available projects
  const filteredProjects = projects.filter((project: ProjectItem) => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Our Work</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Portfolio & Case Studies
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Explore technical deliverables and client applications engineered by SS TECHWORKS. We adhere strictly to verified customer case studies with no fabricated statistics or mock client accounts.
        </p>
      </div>

      {/* Schema Cache or Missing Table Troubleshooting Banner */}
      {isSchemaCacheError && (
        <div className="mt-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Supabase Schema Setup Notice: Table <code className="text-amber-700 dark:text-amber-300 font-mono">public.projects</code>
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                PostgREST reported: <em className="text-amber-950 dark:text-amber-100 font-mono">{error}</em>. This occurs when the database table has not yet been executed in your Supabase SQL Editor or when PostgREST requires a schema cache flush.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setSqlModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Code className="w-4 h-4" />
              <span>View SQL Setup Script</span>
            </button>
            <button
              onClick={fetchProjects}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-200 hover:text-black dark:hover:text-white bg-amber-200/60 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Query</span>
            </button>
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-amber-800 dark:text-amber-300/80 hover:text-amber-950 dark:hover:text-amber-200 underline underline-offset-2 ml-auto"
            >
              <span>Manage in Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* General Non-Schema Database Error */}
      {error && !isSchemaCacheError && (
        <div className="mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>Database query note: {error}</span>
          </div>
          <button
            onClick={fetchProjects}
            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Controls: Search & Category Filter */}
      <div className="mt-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg">
          {portfolioCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading portfolio deliverables...</p>
        </div>
      )}

      {/* Grid or Honest Empty State */}
      {!loading && (
        <div className="mt-8">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group p-6 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span>{project.category}</span>
                      <span className="mx-2">·</span>
                      <span>{project.status}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.technologies.map((t, idx) => (
                        <span key={idx} className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/portfolio/${project.slug}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>View Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            /* Search / Filter Returned No Results */
            <div className="p-10 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto space-y-3 shadow-sm">
              <Search className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Matching Projects</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No published projects matched "{searchQuery}" in category "{selectedCategory}".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/50"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            /* Premium Empty State (Zero Fake Projects Policy) */
            <div className="p-10 md:p-16 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FolderOpen className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Projects Published Yet</h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                We strictly adhere to truth-in-engineering standards and do not generate fabricated case studies or mock client logos. Real verified client deliverables will appear here directly from the Supabase <code>projects</code> table once published by administrators.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                >
                  <span>Be Our Next Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/admin/projects"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
                >
                  <span>Admin: Publish First Case Study</span>
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Connected to Supabase projects table with published-only RLS filter.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SQL Setup Modal */}
      <SqlSetupModal
        isOpen={sqlModalOpen}
        onClose={() => setSqlModalOpen(false)}
        targetTable="public.projects"
      />
    </div>
  );
};
