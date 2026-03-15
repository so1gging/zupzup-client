import styles from './Nav.module.css';

const NAV_LINKS = [
  { href: '#', label: '신간 도서' },
  { href: '#', label: '카테고리' },
  { href: '#', label: '서점 비교' },
];

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <div className={styles.logoIcon}>🐭</div>
          <span className={styles.logoText}>줍줍</span>
        </a>

        <ul className={styles.links}>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={label}>
              <a href={href} className={styles.link}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
