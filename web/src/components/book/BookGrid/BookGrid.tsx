import type { Book } from '../../../types/book';
import BookCard from '../BookCard/BookCard';
import styles from './BookGrid.module.css';

interface BookGridProps {
  books: Book[];
  emptyMessage?: string;
}

export default function BookGrid({ books, emptyMessage = '표시할 도서가 없습니다.' }: BookGridProps) {
  if (books.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.grid}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
