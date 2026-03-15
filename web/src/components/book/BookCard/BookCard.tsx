import type { Book } from '../../../types/book';
import { SOURCE_LABELS } from '../../../constants/sources';
import Badge from '../../ui/Badge/Badge';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
}

const COVER_GRADIENTS = [
  'linear-gradient(145deg, #667eea, #764ba2)',
  'linear-gradient(145deg, #f093fb, #f5576c)',
  'linear-gradient(145deg, #4facfe, #00f2fe)',
  'linear-gradient(145deg, #43e97b, #38f9d7)',
  'linear-gradient(145deg, #fa709a, #fee140)',
  'linear-gradient(145deg, #a18cd1, #fbc2eb)',
  'linear-gradient(145deg, #ffecd2, #fcb69f)',
  'linear-gradient(145deg, #2af598, #009efd)',
];

function getFallbackGradient(id: number) {
  return COVER_GRADIENTS[id % COVER_GRADIENTS.length];
}

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '.');
}

/** 구매 링크 우선순위: 알라딘 > 교보문고 > YES24 */
function getPurchaseUrl(book: Book): string | null {
  return book.aladinUrl ?? book.kyoboUrl ?? book.yes24Url ?? null;
}

/** 대표 서점 이름 (구매 링크 기준) */
function getPrimarySourceLabel(book: Book): string {
  if (book.aladinUrl) return SOURCE_LABELS['aladin'];
  if (book.kyoboUrl) return SOURCE_LABELS['kyobo'];
  if (book.yes24Url) return SOURCE_LABELS['yes24'];
  return '알 수 없음';
}

export default function BookCard({ book }: BookCardProps) {
  const { id, title, author, imageUrl, publishedAt, isPreorder } = book;
  const purchaseUrl = getPurchaseUrl(book);
  const sourceLabel = getPrimarySourceLabel(book);
  const fallbackGradient = getFallbackGradient(id);

  return (
    <a
      href={purchaseUrl ?? '#'}
      target={purchaseUrl ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={styles.card}
    >
      {/* Cover */}
      <div
        className={styles.cover}
        style={!imageUrl ? { background: fallbackGradient } : undefined}
      >
        {imageUrl && <img src={imageUrl} alt={title} className={styles.coverImg} />}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.source}>
          <span className={styles.sourceDot} />
          {sourceLabel}
          {book.sources.length > 1 && (
            <span className={styles.sourceCount}>+{book.sources.length - 1}</span>
          )}
        </div>
        <p className={styles.title}>{title}</p>
        <p className={styles.author}>{author ?? '저자 미상'}</p>
        <div className={styles.meta}>
          <span className={styles.date}>{publishedAt ? formatDate(publishedAt) : '-'}</span>
          {isPreorder
            ? <Badge variant="neutral">예약판매</Badge>
            : <Badge variant="primary">NEW</Badge>
          }
        </div>
      </div>
    </a>
  );
}
