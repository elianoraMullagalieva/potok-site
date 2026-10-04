import styles from './Logos.module.css';

/**
 * Логотипы клиентов: у каждого свой знак и свой шрифт вордмарка, как у настоящих брендов.
 * Монохром с одним жёлтым акцентом в знаке, чтобы жить на тёмных стеклянных карточках.
 */
export function CaseLogo({ id, name }: { id: string; name: string }) {
  switch (id) {
    case 'gates': // ТехноВорота — тяжёлый геометрический гротеск, знак: створки ворот с аркой
      return (
        <span className={`${styles.logo} ${styles.gates}`}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden><path d="M6 34V18c0-7.7 6.3-14 14-14s14 6.3 14 14v16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M6 24h28M6 29h28" stroke="var(--yellow)" strokeWidth="3" strokeLinecap="round" /></svg>
          <span>{name.toUpperCase()}</span>
        </span>
      );
    case 'steel': // СтальКаркас — узкий индустриальный, знак: ферма
      return (
        <span className={`${styles.logo} ${styles.steel}`}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden><path d="M4 32 20 8l16 24H4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><path d="M12 32l8-12 8 12" stroke="var(--yellow)" strokeWidth="3" strokeLinejoin="round" /></svg>
          <span>{name.toUpperCase()}</span>
        </span>
      );
    case 'module': // МодульЦех — модульный альтернативный гротеск, знак: три блока
      return (
        <span className={`${styles.logo} ${styles.module}`}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden><rect x="4" y="22" width="14" height="14" rx="3" fill="currentColor" /><rect x="22" y="22" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="3" /><rect x="13" y="4" width="14" height="14" rx="3" fill="var(--yellow)" /></svg>
          <span>{name}</span>
        </span>
      );
    case 'stroydom': // СтройДом-М — антиква курсивом, знак: дом из блоков
      return (
        <span className={`${styles.logo} ${styles.stroydom}`}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden><path d="M6 20 20 7l14 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 18v16h20V18" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><rect x="17" y="24" width="6" height="10" fill="var(--yellow)" /></svg>
          <span>{name}</span>
        </span>
      );
    case 'kvartir': // КвартирМастер — широкий жирный, знак: валик
      return (
        <span className={`${styles.logo} ${styles.kvartir}`}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden><rect x="6" y="6" width="22" height="12" rx="3" stroke="currentColor" strokeWidth="3" /><path d="M28 12h6v8H20v6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><rect x="17" y="26" width="6" height="10" rx="2" fill="var(--yellow)" /></svg>
          <span>{name}</span>
        </span>
      );
    default: // АкваДом — округлый мягкий, знак: капля
      return (
        <span className={`${styles.logo} ${styles.aqua}`}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden><path d="M20 5c6 8 11 13 11 20a11 11 0 1 1-22 0c0-7 5-12 11-20Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><circle cx="24" cy="26" r="3" fill="var(--yellow)" /></svg>
          <span>{name.toLowerCase()}</span>
        </span>
      );
  }
}
