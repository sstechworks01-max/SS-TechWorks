import { ProjectItem } from '../types';

/**
 * Initial project repository.
 * Per Stage 1 specifications, no fake projects or fabricated customer case studies are included.
 * Projects will be fetched from Supabase in subsequent stages.
 */
export const publishedProjects: ProjectItem[] = [];

export const portfolioCategories = [
  'All',
  'Websites',
  'Android Apps',
  'Software',
  'AI Tools',
  'Photo and Video',
] as const;
