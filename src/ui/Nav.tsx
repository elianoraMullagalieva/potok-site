import { nav } from '../content/texts';
import { Logo } from './Logo';
import { Button } from './Button';
import styles from './Nav.module.css';

export function Nav({ onDark = true }: { onDark?: boolean }) {
  return (
    <header className={`${styles.nav} ${onDark ? styles.onDark : ''}`}>
      <Logo onDark={onDark} />
      <nav className={styles.menu} aria-label="Меню">
        {nav.menu.map((m) => (
          <a key={m.label} href={m.href} className={styles.link}><span>{m.label}</span></a>
        ))}
      </nav>
      <Button variant="primary" className={styles.cta}>{nav.cta}</Button>
    </header>
  );
}
