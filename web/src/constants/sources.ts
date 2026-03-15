import type { BookSource } from '../types/book';

export const SOURCES: { value: BookSource | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'kyobo', label: '교보문고' },
  { value: 'aladin', label: '알라딘' },
  { value: 'yes24', label: 'YES24' },
];

export const SOURCE_LABELS: Record<BookSource, string> = {
  kyobo: '교보문고',
  aladin: '알라딘',
  yes24: 'YES24',
};
