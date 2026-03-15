import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchBooks } from '../lib/books.api';
import type { BookSource } from '../types/book';

interface UseBooksOptions {
  initialSource?: BookSource | 'all';
}

export function useBooks({ initialSource = 'all' }: UseBooksOptions = {}) {
  const [page, setPage] = useState(1);
  const [activeSource, setActiveSource] = useState<BookSource | 'all'>(initialSource);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['books', { page, source: activeSource }],
    queryFn: () => fetchBooks({ page, source: activeSource }),
    placeholderData: keepPreviousData,
  });

  function handleSourceChange(source: BookSource | 'all') {
    setActiveSource(source);
    setPage(1);
  }

  return {
    books: data?.books ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    page,
    isLoading,
    isFetching,
    error: error ? (error as Error).message : null,
    activeSource,
    setPage,
    setActiveSource: handleSourceChange,
  };
}
