export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: 'Web & Mobile' | 'Software & AI' | 'Media & Creative';
  overview: string;
  benefits: string[];
  capabilities: string[];
  workflow: {
    step: string;
    title: string;
    description: string;
  }[];
  iconName: string;
  stageNote?: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: 'Websites' | 'Android Apps' | 'Software' | 'AI Tools' | 'Photo and Video';
  description: string;
  technologies: string[];
  status: 'Published' | 'In Progress' | 'Archived';
  completionDate?: string;
}

export interface EnquiryFormData {
  fullName: string;
  email: string;
  whatsappNumber: string;
  serviceSlug: string;
  projectTitle: string;
  projectDescription: string;
  budgetRange: string;
  desiredDeadline: string;
  attachmentFileName?: string;
}

export interface CompanyContactInfo {
  businessName: string;
  tagline: string;
  logoUrl: string;
  email: string;
  phoneStatus: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  whatsappUrl: string;
  businessType: string;
}

