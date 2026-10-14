import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { cases, caseDetail } from '../../content/texts';
import { Dot } from '../../ui/Tag';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Chats.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/**
 * Что клиенты пишут в мессенджеры: шесть переписок, по одной на кейс.
 * Сообщения приходят по очереди, когда карточка попадает в экран. Главное выделено маркером.
 */
export function Chats() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.h2}, .${styles.sub}`, { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: root.current, start: 'top 78%' } });
      gsap.utils.toArray<HTMLElement>(`.${styles.chat}`).forEach((c) => {
        gsap.from(c.querySelectorAll(`.${styles.msg}`), { y: 14, opacity: 0, scale: 0.98, duration: 0.6, ease: 'expo.out', stagger: 0.18, scrollTrigger: { trigger: c, start: 'top 85%' } });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const list = cases.items.map((c) => ({ c, ch: caseDetail.items[c.id].chats[0] }));
  return (
    <section id="chats" ref={root} className={`wrap ${styles.section}`}>
      <div className={styles.head}>
        <div className={styles.label}><Dot /><span className="label mute">{caseDetail.chatsLabel}</span></div>
        <h2 className={`display ${styles.h2}`}>{caseDetail.chatsTitle}</h2>
        <p className={styles.sub}>{caseDetail.chatsSub}</p>
      </div>
      <div className={styles.grid}>
        {list.map(({ c, ch }, k) => (
          <article key={c.id} className={styles.chat} style={{ '--k': k } as React.CSSProperties}>
            <header className={styles.top}>
              <i>{ch.who.slice(0, 1)}</i>
              <span><b>{ch.who}</b><small>{ch.role} · {c.client}</small></span>
              <img src={asset(`logos/${c.id}.png`)} alt="" className={styles.logo} loading="lazy" draggable={false} />
            </header>
            {ch.msgs.map((m) => <p key={m} className={styles.msg}>{mark(m)}</p>)}
            <p className={`${styles.msg} ${styles.ours}`}>{ch.reply}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ==главное== в сообщении выделяется маркером */
function mark(s: string) {
  return s.split(/==/).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}
