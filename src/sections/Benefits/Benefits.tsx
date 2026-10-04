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

function CrmRows() {
  const widths = [78, 46, 30, 62];
  return (
    <ul className={styles.crm} aria-hidden>
      {benefits.crmRows.map((r, i) => (
        <li key={r}><span>{r}</span><i style={{ width: `${widths[i]}%` }} /></li>
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
