import type { BookRow } from '../lib/database.types';

export type BookSource = 'kyobo' | 'aladin' | 'yes24';

export type BookCategory =
  | 'all'
  | 'programming'
  | 'ai'
  | 'database'
  | 'cloud'
  | 'security'
  | 'methodology';

/** Supabase BookRow를 UI에서 쓰기 편한 형태로 변환한 타입 */
export interface Book {
  id: number;
  title: string;
  author: string | null;
  price: number | null;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  isPreorder: boolean;
  kyoboUrl: string | null;
  aladinUrl: string | null;
  yes24Url: string | null;
  /** 어느 서점에서 수집됐는지 (URL 보유 여부 기준) */
  sources: BookSource[];
}

/** Supabase row → Book 변환 */
export function toBook(row: BookRow): Book {
  const sources: BookSource[] = [];
  if (row.kyobo_url) sources.push('kyobo');
  if (row.aladin_url) sources.push('aladin');
  if (row.yes24_url) sources.push('yes24');

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    isPreorder: row.is_preorder,
    kyoboUrl: row.kyobo_url,
    aladinUrl: row.aladin_url,
    yes24Url: row.yes24_url,
    sources,
  };
}
