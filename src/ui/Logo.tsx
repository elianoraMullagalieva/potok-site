import styles from './Logo.module.css';

/* Знак «Поток»: буква П из двух русел, которые сливаются в одно. Углы твёрдые, как у шрифта сайта */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" aria-hidden>
      <path d="M4 26V6h8v20" stroke="currentColor" strokeWidth="3.6" strokeLinejoin="miter" />
      <path d="M12 6h9a3 3 0 0 1 3 3v3.5c0 2.5-2 4.5-4.5 4.5H16" stroke="currentColor" strokeWidth="3.6" strokeLinejoin="miter" />
      <path d="M16 17h3.2c3.6 0 6.4 2 7.3 9" stroke="currentColor" strokeWidth="3.6" strokeLinejoin="miter" />
    </svg>
  );
}

export function Logo({ onDark = false, word = 'Поток' }: { onDark?: boolean; word?: string }) {
  return (
    <a href="#" className={`${styles.logo} ${onDark ? styles.onDark : ''}`} aria-label={word}>
      <LogoMark />
      <span className={styles.word} data-logo-word>{word}</span>
    </a>
  );
}
