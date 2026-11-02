import { quotes } from '../content/texts';
import { Notice } from './Notice';
import styles from './Quote.module.css';

const TIMES = ['10:42', '14:20', '18:05'];

/** Цитата клиента как уведомление из мессенджера на iPhone: кто пишет — над фразой, время справа */
export function Quote({ i, className }: { i: number; className?: string; onDark?: boolean }) {
  const q = quotes[i % quotes.length];
  const [role, company] = q.role.split(', ');
  return (
    <figure className={`${styles.quote} ${className ?? ''}`}>
      <Notice from={{ name: q.name, role: company ? `${company} · ${role}` : role, face: q.face }} text={q.text} time={TIMES[i % TIMES.length]} />
    </figure>
  );
}
