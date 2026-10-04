import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { benefits } from '../../content/texts';
import { SkyStatic } from '../../ui/Sky';
import { Tag, Dot } from '../../ui/Tag';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Benefits.module.css';

export function Benefits() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      // слова манифеста проявляются по скроллу: серый → чёрный
      gsap.fromTo(`.${styles.w}`, { opacity: 0.18 }, {
        opacity: 1, stagger: 0.04, ease: 'none',
        scrollTrigger: { trigger: `.${styles.manifest}`, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
      });
      gsap.from(`.${styles.card}`, {
        y: 90, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: `.${styles.cards}`, start: 'top 82%' },
      });
      // лёгкий параллакс: карточки с разным смещением едут с разной скоростью
      gsap.utils.toArray<HTMLElement>(`.${styles.card}`).forEach((c, i) => {
        gsap.to(c, { y: (i % 2 ? -30 : 30), ease: 'none', scrollTrigger: { trigger: `.${styles.cards}`, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="about" ref={root} className={`wrap ${styles.section}`}>
      <div className={styles.head}>
        <Dot /><span className="label mute">{benefits.label}</span>
      </div>

      <h2 className={`display ${styles.manifest}`}>
        {benefits.manifest.map((chunk, i) =>
          chunk === '▬' ? (
            <span key={i} className={styles.capsule} aria-hidden><SkyStatic seed={2.3 + i} zoom={0.6} pan={[0.4 * i, 0.2]} /></span>
          ) : (
            chunk.split(' ').map((w, j) => <span key={`${i}-${j}`} className={`${styles.w} ${i >= 2 ? styles.wMute : ''}`}>{w}</span>)
          ),
        )}
      </h2>

      <div className={styles.cards}>
        {benefits.cards.map((c, i) => (
          <article key={c.tag} className={`${styles.card} ${styles[c.kind]}`} style={{ '--i': i } as React.CSSProperties}>
            {c.kind === 'photo' && <SkyStatic seed={4.1} zoom={0.8} pan={[0.3, 0.1]} />}
            {c.kind === 'photo' && <div className={styles.photoShade} />}
            <div className={styles.cardTop}>
              <Tag onDark={c.kind !== 'light' && c.kind !== 'grey'}>{c.tag}</Tag>
            </div>
            {c.kind === 'dark' && <Chain />}
            {c.kind === 'photo' && <Timeline />}
            {c.kind === 'light' && <CrmRows />}
            {c.kind === 'grey' && <Team />}
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}><Dot className={styles.cardDot} />{c.title}</h3>
              <p className={styles.cardText}>{c.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* Связка: объявление → квиз → бот → заявка. Слова из подписи карточки */
function Chain() {
  const steps = ['Объявления', 'Квиз', 'Бот'];
  return (
    <div className={styles.chain} aria-hidden>
      {steps.map((st, i) => (
        <div key={st} className={styles.chainRow}>
          <span className={styles.chainNode}><i /></span>
          <span className={styles.chainPill}>{st}</span>
          {i < steps.length - 1 && <span className={styles.chainLine} />}
        </div>
      ))}
      <div className={styles.chainRow}>
        <span className={`${styles.chainNode} ${styles.chainNodeOn}`}><i /></span>
        <span className={`${styles.chainPill} ${styles.chainPillOn}`}>Заявки</span>
      </div>
    </div>
  );
}
/* Таймлайн запуска: бюджет зачислен → день 1 → день 2 */
function Timeline() {
  return (
    <div className={styles.tl} aria-hidden>
      <div className={styles.tlTrack}><i style={{ width: '66%' }} /></div>
      <ul className={styles.tlMarks}>
        <li><b /><span>Бюджет зачислен</span></li>
        <li><b /><span>День 1</span></li>
        <li><b /><span>День 2</span></li>
      </ul>
    </div>
  );
}
function CrmRows() {
  const widths = [78, 46, 30, 62];
  return (
    <ul className={styles.crm} aria-hidden>
      <li className={styles.crmHead}><span className="label">CRM</span><span className={styles.live} /></li>
      {benefits.crmRows.map((r, i) => (
        <li key={r}><span>{r}</span><i className={i === 1 ? styles.barOn : ''} style={{ width: `${widths[i]}%` }} /></li>
      ))}
    </ul>
  );
}
function Team() {
  return (
    <div className={styles.team} aria-hidden>
      {benefits.team.map((t) => <span key={t.initials} className={styles.ava} title={t.name}>{t.initials}</span>)}
      <span className={`${styles.ava} ${styles.avaEmpty}`} />
    </div>
  );
}
