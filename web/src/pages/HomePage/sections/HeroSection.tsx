import Button from '../../../components/ui/Button/Button';
import styles from './HeroSection.module.css';

const STATS = [
  { num: '3개', label: '연동 서점' },
  { num: '매주', label: '자동 업데이트' },
  { num: '무료', label: '완전 무료' },
];

const HERO_BOOKS = [
  { gradient: 'linear-gradient(145deg, #667eea, #764ba2)', title: '모던 리액트 Deep Dive', author: '김용찬', source: '알라딘 신간', rotate: '-6deg', top: '30px', left: '20px' },
  { gradient: 'linear-gradient(145deg, #f093fb, #f5576c)', title: '클린 아키텍처', author: '로버트 C. 마틴', source: '교보문고 신간', rotate: '-2deg', top: '10px', left: '80px' },
  { gradient: 'linear-gradient(145deg, #4facfe, #00f2fe)', title: '데이터베이스 개론', author: '이기준', source: 'YES24 신간', rotate: '4deg', top: '50px', right: '10px' },
  { gradient: 'linear-gradient(145deg, #43e97b, #38f9d7)', title: '쏙쏙 들어오는 함수형 코딩', author: '에릭 노먼드', source: '이번 주 추천', rotate: '1deg', top: '70px', left: '50px', featured: true },
];

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Text */}
      <div className={styles.content}>
        <div className={styles.badge}>매주 새로운 IT 신간</div>
        <h1 className={styles.title}>
          IT 신간 도서<br />
          내가 <em className={styles.accent}>모두</em> 모아줄게
        </h1>
        <p className={styles.desc}>
          교보문고, 알라딘, YES24의 최신 IT 도서를<br />
          한눈에 비교하고 바로 구매하세요.
        </p>

        <div className={styles.actions}>
          <Button as="a" href="#books" variant="primary">
            신간 보러가기 →
          </Button>
        </div>

        <div className={styles.stats}>
          {STATS.map(({ num, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statNum}>{num}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual */}
      <div className={styles.visual}>
        <div className={styles.bookStack}>
          {HERO_BOOKS.map((book) => (
            <div
              key={book.title}
              className={[styles.bookCard, book.featured ? styles.featured : ''].filter(Boolean).join(' ')}
              style={{
                background: book.gradient,
                transform: `rotate(${book.rotate})`,
                top: book.top,
                left: book.left,
                right: book.right,
              }}
            >
              <div className={styles.bookCardInner}>
                <span className={styles.bookLabel}>{book.source}</span>
                <span className={styles.bookTitle}>{book.title}</span>
                <span className={styles.bookAuthor}>{book.author} 저</span>
              </div>
            </div>
          ))}
          <div className={[styles.floatingTag, styles.tag1].join(' ')}>
            📚 이번 주 23권 업데이트
          </div>
          <div className={[styles.floatingTag, styles.tag2].join(' ')}>
            🔥 신간 알림
          </div>
        </div>
      </div>
    </section>
  );
}
