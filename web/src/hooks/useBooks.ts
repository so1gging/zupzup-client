import { useMemo, useState } from 'react';
import type { Book, BookCategory, BookSource } from '../types/book';
import { MOCK_BOOKS } from '../constants/mockBooks';

interface UseBooksOptions {
  initialSource?: BookSource | 'all';
  initialCategory?: BookCategory;
}

export function useBooks({ initialSource = 'all', initialCategory = 'all' }: UseBooksOptions = {}) {
  const [activeSource, setActiveSource] = useState<BookSource | 'all'>(initialSource);
  const [activeCategory, setActiveCategory] = useState<BookCategory>(initialCategory);

  // 실제 서비스에서는 여기서 API 호출로 교체
  const books: Book[] = MOCK_BOOKS;

  const filtered = useMemo(() => {
    return books.filter((book) => {
      const sourceMatch = activeSource === 'all' || book.source === activeSource;
      const categoryMatch = activeCategory === 'all' || book.category === activeCategory;
      return sourceMatch && categoryMatch;
    });
  }, [books, activeSource, activeCategory]);

  return {
    books: filtered,
    activeSource,
    activeCategory,
    setActiveSource,
    setActiveCategory,
  };
}
