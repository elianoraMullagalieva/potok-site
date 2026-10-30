import styles from './Notice.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export type NoticeFrom = { name: string; role: string; face?: string };

/* Плашка-уведомление как на iPhone: аватар со значком мессенджера, кто пишет — над цитатой, время справа */
export function Notice({ from, text, time, className = '', style }: { from: NoticeFrom; text: string; time: string; className?: string; style?: React.CSSProperties }) {
  const initials = from.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <div className={`${styles.notice} ${className}`} style={style}>
      <span className={styles.ava}>
        {from.face ? <img src={asset(from.face)} alt="" loading="lazy" /> : <span className={styles.ini}>{initials}</span>}
        <i className={styles.badge} aria-hidden>
          <svg viewBox="0 0 24 24" width="10" height="10"><path fill="#fff" d="M21.4 4.3 2.9 11.4c-1 .4-1 1.6.1 1.9l4.6 1.4 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7l3-14.6c.2-1-.8-1.8-1.7-1.4Zm-3.7 3.4-8.4 7.6-.3 3.2-1.4-4.4 9.6-6.1c.4-.3.8.1.5.4Z" /></svg>
        </i>
      </span>
      <span className={styles.body}>
        <span className={styles.top}><b>{from.name}</b><time>{time}</time></span>
        <span className={styles.role}>{from.role}</span>
        <span className={styles.text}>{text}</span>
      </span>
    </div>
  );
}
