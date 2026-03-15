import type { BookCategory } from '../types/book';

export const CATEGORIES: { value: BookCategory; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'programming', label: '프로그래밍' },
  { value: 'ai', label: 'AI · 머신러닝' },
  { value: 'database', label: '데이터베이스' },
  { value: 'cloud', label: '클라우드' },
  { value: 'security', label: '보안' },
  { value: 'methodology', label: '개발 방법론' },
];
