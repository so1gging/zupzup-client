import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={[styles.skeleton, className].filter(Boolean).join(' ')} />;
}

export function BookCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.cover} />
      <div className={styles.info}>
        <Skeleton className={styles.source} />
        <Skeleton className={styles.title} />
        <Skeleton className={styles.titleShort} />
        <Skeleton className={styles.author} />
        <div className={styles.meta}>
          <Skeleton className={styles.date} />
          <Skeleton className={styles.badge} />
        </div>
      </div>
    </div>
  );
}

interface BookGridSkeletonProps {
  count?: number;
}

export function BookGridSkeleton({ count = 8 }: BookGridSkeletonProps) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
