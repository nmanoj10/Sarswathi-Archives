
export interface Manuscript {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  language: string;
  period: string;
  dateAdded: number;
  transcription?: string;
  translation?: string;
  ocrConfidence?: number;
  uploadedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

export interface FilterState {
  category: string | null;
  language: string | null;
  period: string | null;
  search: string;
}

export const CATEGORIES = ['Philosophy', 'Science', 'Literature', 'History', 'Religion', 'Art'];
export const LANGUAGES = ['Sanskrit', 'Latin', 'Greek', 'Persian', 'Japanese', 'Chinese', 'Arabic', 'English', 'Portuguese'];
export const PERIODS = ['Ancient', 'Medieval', 'Renaissance', 'Early Modern', 'Modern'];

export const TARGET_LANGUAGES = [
  'English', 
  'Kannada', 
  'Hindi', 
  'Tamil', 
  'Telugu', 
  'Malayalam', 
  'Bengali',
  'Marathi',
  'Gujarati',
  'Sanskrit',
  'Spanish', 
  'French', 
  'German', 
  'Japanese', 
  'Chinese', 
  'Arabic'
];

// A reliable SVG data URI to use when images fail to load, ensuring "Image Unavailable" text is never shown
export const FALLBACK_COVER_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f5f5f4'/%3E%3Crect x='30' y='30' width='340' height='540' fill='none' stroke='%23e7e5e4' stroke-width='4'/%3E%3Cpath d='M200 250 L200 350 M150 300 L250 300' stroke='%23d6d3d1' stroke-width='2'/%3E%3Ctext x='50%25' y='65%25' font-family='Georgia, serif' font-size='16' fill='%23a8a29e' text-anchor='middle' letter-spacing='1'%3EARCHIVE RECORD%3C/text%3E%3C/svg%3E";

export const INITIAL_MANUSCRIPTS: Manuscript[] = [];
