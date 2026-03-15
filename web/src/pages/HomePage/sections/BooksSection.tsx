import { useBooks } from '../../../hooks/useBooks';
import { BookGrid, SourceTabs, FilterRow } from '../../../components/book';
import styles from './BooksSection.module.css';

export default function BooksSection() {
  const { books, activeSource, activeCategory, setActiveSource, setActiveCategory } = useBooks();

  return (
    <section className={styles.section} id="books">
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>이번 주 IT 신간</h2>
          <p className={styles.subtitle}>2025년 3월 둘째 주 · 3개 서점 기준</p>
        </div>
        <a href="#" className={styles.seeAll}>전체 보기 →</a>
      </div>

      <SourceTabs active={activeSource} onChange={setActiveSource} />
      <FilterRow active={activeCategory} onChange={setActiveCategory} />
      <BookGrid books={books} />
    </section>
  );
}
