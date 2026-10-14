import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { about } from '../../content/texts';
import { Manifest } from '../../ui/Manifest';
import { SkyStatic } from '../../ui/Sky';
import { Face } from '../../ui/Face';
import { services } from '../../content/texts';
import { Button } from '../../ui/Button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './About.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/**
 * О студии: «Поток работает открыто». Бенто по макету: проекты и ниши, штат, запуски,
 * партнёры, срок с клиентом, фото команды, договор и реквизиты. Ниже — что фиксируем в договоре.
 */
export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const c = about.cards;

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.h2}`, { y: 24, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 78%' } });
      gsap.from(`.${styles.grid} > *`, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: `.${styles.grid}`, start: 'top 82%' } });
      gsap.from(`.${styles.stamp}`, { scale: 1.6, opacity: 0, rotate: -20, duration: 0.7, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.contract}`, start: 'top 75%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="about" ref={root} className={`wrap ${styles.section}`}>
      <Manifest label={about.label} chunks={about.manifest} skies={['speed']} />

      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.projects}`}>
          <div className={styles.ring} aria-hidden>
            <svg viewBox="0 0 64 64" width="64" height="64">
              <defs><mask id="ringMask"><circle className={styles.ringMask} cx="32" cy="32" r="27" fill="none" stroke="#fff" strokeWidth="8" strokeDasharray="170" strokeDashoffset="170" transform="rotate(-90 32 32)" /></mask></defs>
              <circle cx="32" cy="32" r="27" fill="none" stroke="var(--bg-2)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 5.6" />
              <circle className={styles.ringDots} cx="32" cy="32" r="27" fill="none" stroke="var(--accent-dot)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 5.6" mask="url(#ringMask)" />
            </svg>
            <span className="num">140</span>
          </div>
          <b className={`num ${styles.big}`}>{c.projects.big}</b>
          <p>{c.projects.text}</p>
          <ul className={styles.chips}>{c.projects.chips.map((x, i) => <li key={x} style={{ '--i': i } as React.CSSProperties}>{x}</li>)}</ul>
        </div>
        <div className={`${styles.card} ${styles.staff}`}>
          <div className={styles.faces} aria-hidden>{Object.values(services.people).map((p, i) => <span key={p.name} style={{ '--i': i } as React.CSSProperties}><Face src={p.face} name={p.name} size={44} ring="#fff" /></span>)}</div>
          <span className={styles.pre}>{c.staff.pre}</span>
          <b className={`num ${styles.big}`}>{c.staff.big}</b>
          <p>{c.staff.text}</p>
        </div>
        <div className={`${styles.card} ${styles.launches}`}>
          <SkyStatic id="speed" className={styles.cardSky} /><div className={styles.cardShade} />
          <div className={styles.pips} aria-hidden>{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < 9 ? styles.pipOn : ''} style={{ '--i': i } as React.CSSProperties} />)}</div>
          <b className={`num ${styles.big}`}>{c.launches.big}</b>
          <span className={styles.pre}>{c.launches.sub}</span>
          <p>{c.launches.text}</p>
        </div>
        <div className={`${styles.card} ${styles.partners}`}>
          <span className={styles.cardTitle}>{c.partners.title}</span>
          <ul>{c.partners.items.map(([n, r]) => <li key={n}><b>{n}</b><small>{r}</small></li>)}</ul>
        </div>
        <div className={`${styles.card} ${styles.years}`}>
          <SkyStatic id="manifest2" className={styles.cardSky} /><div className={styles.cardShade} />
          <div className={styles.line} aria-hidden><i /><span className={styles.lineDot} /><em>0</em><em>1 год</em><em>2 года</em></div>
          <b className={`num ${styles.big}`}>{c.years.big}</b>
          <p>{c.years.text}</p>
        </div>
        <figure className={`${styles.card} ${styles.photo}`}>
          <img src={asset(about.photo)} alt="Команда Потока за работой" loading="lazy" draggable={false} />
        </figure>
        <div className={`${styles.card} ${styles.contract}`}>
          <div className={styles.contractText}>
            <span className={styles.cardTitle}>{c.contract.title}</span>
            <p>{c.contract.text} · <a href="#">{c.contract.link}</a></p>
            <Button variant="dark" arrow href="#lead" className={styles.contractBtn}>{c.contract.cta}</Button>
          </div>
          <Paper compact />
        </div>
      </div>

    </section>
  );
}

/* Бумага договора: шапка, строки предмета, подпись и печать. Своя вёрстка, без фото */
function Paper({ compact = false }: { compact?: boolean }) {
  const p = about.paper;
  return (
    <div className={`${styles.paper} ${compact ? styles.paperCompact : ''}`}>
      <span className={styles.demo}>{p.demo}</span>
      <b className={styles.paperTitle}>{p.title}</b>
      <small className={styles.paperSub}>{p.sub}</small>
      <ol>{p.rows.map((r) => <li key={r}>{r}</li>)}</ol>
      {!compact && <div className={styles.sign}><span className={styles.signLine} /><small>{about.quoteBy}</small></div>}
      <span className={styles.stamp} aria-hidden><span>{p.stamp}</span></span>
    </div>
  );
}
