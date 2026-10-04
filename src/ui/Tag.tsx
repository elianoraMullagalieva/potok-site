import styles from './Tag.module.css';
export function Tag({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return <span className={`${styles.tag} ${onDark ? styles.onDark : ''}`}>{children}</span>;
}
export function Dot({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M6 0l1.4 3.2L11 2.6 8.9 5.4 11 8.3 7.6 7.8 6 11 4.4 7.8 1 8.3l2.1-2.9L1 2.6l3.6.6z" fill="var(--blue)" />
    </svg>
  );
}
