export type BookSource = 'kyobo' | 'aladin' | 'yes24';

export type BookCategory =
  | 'all'
  | 'programming'
  | 'ai'
  | 'database'
  | 'cloud'
  | 'security'
  | 'methodology';

export interface Book {
  id: string;
  title: string;
  author: string;
  source: BookSource;
  category: BookCategory;
  publishedAt: string; // ISO date string
  coverGradient?: string; // fallback gradient when no image
  coverUrl?: string;
  purchaseUrl?: string;
  isNew?: boolean;
}
