import { quotes } from '../content/texts';
import { Face } from './Face';
import styles from './Quote.module.css';

/** Мини-плашка с цитатой клиента: фото, одна фраза, должность. Вместо отдельного блока отзывов */
export function Quote({ i, className, onDark = false }: { i: number; className?: string; onDark?: boolean }) {
  const q = quotes[i % quotes.length];
  return (
    <figure className={`${styles.quote} ${onDark ? styles.onDark : ''} ${className ?? ''}`}>
      <Face src={q.face} name={q.name} size={44} />
      <blockquote className={styles.text}>«{q.text}»</blockquote>
      <figcaption className={styles.who}><b>{q.name}</b><span>{q.role}</span></figcaption>
    </figure>
  );
}
