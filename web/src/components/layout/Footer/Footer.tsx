import styles from './Footer.module.css';

const FOOTER_LINKS = [
  { href: '#', label: '소개' },
  { href: '#', label: '이용약관' },
  { href: '#', label: '개인정보처리방침' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <div className={styles.logoIcon}>🐭</div>
          <span className={styles.logoText}>줍줍</span>
        </a>

        <span className={styles.copy}>© 2025 줍줍 · IT 신간 도서 모음</span>

        <ul className={styles.links}>
          {FOOTER_LINKS.map(({ href, label }) => (
            <li key={label}>
              <a href={href} className={styles.link}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
