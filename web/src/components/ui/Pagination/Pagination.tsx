import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  isFetching?: boolean;
  onChange: (page: number) => void;
}

/** 현재 페이지 주변 페이지 번호 배열 생성 */
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}

export default function Pagination({ page, totalPages, isFetching = false, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className={styles.wrap}>
      {isFetching && <span className={styles.fetching}>불러오는 중...</span>}

      <div className={styles.pagination}>
        <button
          className={styles.arrow}
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="이전 페이지"
        >
          ←
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>···</span>
          ) : (
            <button
              key={p}
              className={[styles.page, page === p ? styles.active : ''].filter(Boolean).join(' ')}
              onClick={() => onChange(p)}
              aria-current={page === p ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className={styles.arrow}
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="다음 페이지"
        >
          →
        </button>
      </div>
    </div>
  );
}
