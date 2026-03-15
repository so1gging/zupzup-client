import { useBooks } from '../../../hooks/useBooks';
import { BookGrid, SourceTabs } from '../../../components/book';
import { BookGridSkeleton, Pagination } from '../../../components/ui';
import { PAGE_SIZE } from '../../../lib/books.api';
import styles from './BooksSection.module.css';

export default function BooksSection() {
  const {
    books,
    total,
    totalPages,
    page,
    isLoading,
    isFetching,
    error,
    activeSource,
    setPage,
    setActiveSource,
  } = useBooks();

  function handlePageChange(next: number) {
    setPage(next);
    // 페이지 변경 시 섹션 상단으로 스크롤
    document.getElementById('books')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className={styles.section} id="books">
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>이번 주 IT 신간</h2>
          <p className={styles.subtitle}>
            {total > 0 ? `총 ${total}권 · 3개 서점 기준` : '3개 서점 기준'}
          </p>
        </div>
        <a href="#" className={styles.seeAll}>전체 보기 →</a>
      </div>

      <SourceTabs active={activeSource} onChange={setActiveSource} />

      {error && <p className={styles.stateError}>오류가 발생했습니다: {error}</p>}

      {isLoading ? (
        <BookGridSkeleton count={PAGE_SIZE} />
      ) : (
        <>
          <BookGrid books={books} />
          <Pagination
            page={page}
            totalPages={totalPages}
            isFetching={isFetching}
            onChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}
