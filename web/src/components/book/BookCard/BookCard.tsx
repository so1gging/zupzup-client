import type { Book } from '../../../types/book';
import { SOURCE_LABELS } from '../../../constants/sources';
import Badge from '../../ui/Badge/Badge';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
}

function formatDate(iso: string) {
  return iso.replace(/-/g, '.');
}

export default function BookCard({ book }: BookCardProps) {
  const { title, author, source, publishedAt, coverUrl, coverGradient, isNew, purchaseUrl } = book;

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
        style={!coverUrl ? { background: coverGradient } : undefined}
      >
        {coverUrl ? (
          <img src={coverUrl} alt={title} className={styles.coverImg} />
        ) : null}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.source}>
          <span className={styles.sourceDot} />
          {SOURCE_LABELS[source]}
        </div>
        <p className={styles.title}>{title}</p>
        <p className={styles.author}>{author}</p>
        <div className={styles.meta}>
          <span className={styles.date}>{formatDate(publishedAt)}</span>
          {isNew && <Badge variant="primary">NEW</Badge>}
        </div>
      </div>
    </a>
  );
}
