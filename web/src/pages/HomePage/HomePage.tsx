import { Nav, Footer } from '../../components/layout';
import HeroSection from './sections/HeroSection';
import BooksSection from './sections/BooksSection';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <div className={styles.divider} />
        <BooksSection />
      </main>
      <Footer />
    </>
  );
}
