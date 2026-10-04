import styles from './Logo.module.css';
/* Логомарк «Поток»: буква П из двух русел, которые сливаются в одно */
export function Logo({ onDark = false, word = 'Поток' }: { onDark?: boolean; word?: string }) {
  return (
    <a href="#" className={`${styles.logo} ${onDark ? styles.onDark : ''}`} aria-label={word}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
        <path d="M4 25V9c0-2.2 1.8-4 4-4h3v20" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M11 5h8c2.2 0 4 1.8 4 4v3.5c0 2.8-2.3 5-5 5h-4" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M17.5 17.5c3.5 0 6.5 1.6 8.5 7.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      <span className={styles.word} data-logo-word>{word}</span>
    </a>
  );
}
