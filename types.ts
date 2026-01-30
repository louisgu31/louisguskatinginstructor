export type Language = 'en' | 'cn';

export interface TextContent {
  en: string;
  cn: string;
}

export interface TimelineItem {
  year: string;
  title: TextContent;
  description: TextContent;
}

export interface ServiceItem {
  icon: string;
  title: TextContent;
  description: TextContent;
}

export interface VideoItem {
  url: string;
}

export interface AppContent {
  heroImage: string;
  galleryImages: string[];
  hero: {
    title: TextContent;
    subtitle: TextContent;
    cta: TextContent;
  };
  about: {
    title: TextContent;
    intro: TextContent;
    timeline: TimelineItem[];
  };
  services: {
    title: TextContent;
    items: ServiceItem[];
  };
  awards: {
    title: TextContent;
    items: TextContent[];
  };
  testimonials: {
    title: TextContent;
    items: VideoItem[];
  };
  contact: {
    title: TextContent;
    desc: TextContent;
    email: string;
    phone: string;
    location: TextContent;
  };
}