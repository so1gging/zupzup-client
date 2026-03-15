import { supabase } from './supabase';
import { toBook } from '../types/book';
import type { Book, BookSource } from '../types/book';

export const PAGE_SIZE = 8;

export interface FetchBooksParams {
  page: number;
  source: BookSource | 'all';
}

export interface BooksPage {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchBooks({ page, source }: FetchBooksParams): Promise<BooksPage> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('books')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false });

  if (source === 'kyobo') query = query.not('kyobo_url', 'is', null);
  if (source === 'aladin') query = query.not('aladin_url', 'is', null);
  if (source === 'yes24') query = query.not('yes24_url', 'is', null);

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    books: (data ?? []).map(toBook),
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}
