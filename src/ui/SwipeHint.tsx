import styles from './SwipeHint.module.css';
/* Подсказка над горизонтальным рядом: палец без кружка и короткий текст. Везде одинаковая. */
export function SwipeHint({ text = 'Листайте вправо', onDark = false, className }: { text?: string; onDark?: boolean; className?: string }) {
  return (
    <span className={`${styles.hint} ${onDark ? styles.onDark : ''} ${className ?? ''}`} aria-hidden>
      <svg className={styles.hand} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V11" /><path d="M12 10V8.5a1.5 1.5 0 0 1 3 0V11" /><path d="M15 10.5a1.5 1.5 0 0 1 3 0V12" /><path d="M18 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2.5a6 6 0 0 1-4.9-2.5L4 14.6a1.6 1.6 0 0 1 2.6-1.9L9 15.5" />
      </svg>
      <span>{text}</span>
      <svg className={styles.arrow} width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5h11M8 1l4 4-4 4" /></svg>
    </span>
  );
}
