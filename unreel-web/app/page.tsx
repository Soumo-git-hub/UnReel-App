import AuroraBackground from '@/components/AuroraBackground';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import styles from './page.module.css';

export default function Home() {
  return (
    <AuroraBackground>
      <main className={styles.main}>
        <Hero />
      </main>
    </AuroraBackground>
  );
}
