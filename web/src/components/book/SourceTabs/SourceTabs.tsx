import type { BookSource } from '../../../types/book';
import { SOURCES } from '../../../constants/sources';
import styles from './SourceTabs.module.css';

interface SourceTabsProps {
  active: BookSource | 'all';
  onChange: (source: BookSource | 'all') => void;
}

export default function SourceTabs({ active, onChange }: SourceTabsProps) {
  return (
    <div className={styles.tabs}>
      {SOURCES.map(({ value, label }) => (
        <button
          key={value}
          className={[styles.tab, active === value ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
