import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, FolderOpen, ExternalLink } from '../components/common/IconHelper';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!isSupabaseConfigured() || !slug) {
        setProject(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (error || !data) {
          setProject(null);
        } else {
          setProject(data);
        }
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading case study details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 max-w-2xl mx-auto px-4 text-center space-y-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Case Study Not Found</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The requested project record does not exist or has not been published yet. Only verified, published deliverables appear here.
        </p>
        <div className="pt-2">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
          >
            <span>Return to Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/portfolio" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Portfolio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-medium">{project.title}</span>
      </nav>

      <div className="space-y-4">
        <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
          <span>{project.category}</span>
          <span className="mx-2">·</span>
          <span>Verified Case Study</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">{project.short_description}</p>
      </div>

      {project.thumbnail_path && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0b0f19] shadow-sm">
          <img
            src={project.thumbnail_path}
            alt={project.title}
            className="w-full h-auto max-h-[460px] object-cover"
          />
        </div>
      )}

      <div className="p-8 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Scope & Engineering Overview</h3>
        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {project.description}
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center">
          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              <span>View Live Platform</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
            >
              <span>Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
