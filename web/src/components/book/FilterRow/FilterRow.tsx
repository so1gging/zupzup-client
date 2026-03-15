import type { BookCategory } from '../../../types/book';
import { CATEGORIES } from '../../../constants/categories';
import FilterChip from '../../ui/FilterChip/FilterChip';
import styles from './FilterRow.module.css';

interface FilterRowProps {
  active: BookCategory;
  onChange: (category: BookCategory) => void;
}

export default function FilterRow({ active, onChange }: FilterRowProps) {
  return (
    <div className={styles.row}>
      {CATEGORIES.map(({ value, label }) => (
        <FilterChip
          key={value}
          label={label}
          active={active === value}
          onClick={() => onChange(value)}
        />
      ))}
    </div>
  );
}
