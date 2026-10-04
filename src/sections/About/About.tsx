import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { about, services } from '../../content/texts';
import { Face } from '../../ui/Face';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './About.module.css';

/**
 * О компании: «Нас трое. И это плюс.» Три портрета во всю высоту, ч/б → цвет на hover.
 * Цифры с диаграммами, три обещания, цитата основателя с его портретом.
 */
export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.person}`, { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: `.${styles.team}`, start: 'top 80%' } });
      gsap.utils.toArray<HTMLElement>(`.${styles.val}`).forEach((n, i) => {
        const to = Number(n.dataset.v), dec = Number(n.dataset.d || 0); const o = { v: 0 };
        gsap.to(o, { v: to, duration: 1.6, delay: i * 0.25, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.stats}`, start: 'top 80%' },
          onUpdate: () => { n.textContent = o.v.toFixed(dec).replace('.', ','); } });
      });
      gsap.from(`.${styles.stat}`, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: `.${styles.stats}`, start: 'top 82%' } });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced]);

  const andrey = services.people['Андрей'];

  return (
    <section id="about" ref={root} className={`wrap ${styles.section}`}>
      <div className={styles.head}>
        <span className="label mute">{about.label}</span>
        <h2 className={`display ${styles.h2}`}>{about.title} <span className={styles.tail}>{about.titleTail}</span></h2>
        <p className={styles.sub}>{about.sub}</p>
      </div>

      <div className={styles.team}>
        {about.team.map((t) => {
          const p = services.people[t.key];
          return (
            <article key={t.key} className={styles.person}>
              <img className={styles.portrait} src={`${import.meta.env.BASE_URL}${p.photo}`} alt={p.name} loading="lazy" draggable={false} />
              <div className={styles.personBody}>
                <div className={styles.pName}>{p.name}</div>
                <div className={styles.pRole}>{p.role}</div>
                <p className={styles.pLine}>{t.line}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.stats}>
        {about.stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <Diagram kind={s.kind} />
            <div className={`num ${styles.big}`}><span className={styles.val} data-v={s.value} data-d={s.decimals ?? 0}>{String(s.value).replace('.', ',')}</span>{s.suffix}</div>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <div className={styles.promises}>
          <span className="label mute">{about.promisesLabel}</span>
          <ol>
            {about.promises.map((p, i) => (
              <li key={p.t}><span className={`num ${styles.pn}`}>0{i + 1}</span><div><b>{p.t}</b><span>{p.s}</span></div></li>
            ))}
          </ol>
        </div>
        <figure className={styles.quote}>
          <blockquote>{about.quote}</blockquote>
          <figcaption><Face src={andrey.face} name={andrey.name} size={44} /><span>{about.quoteBy}<small>{andrey.role}</small></span></figcaption>
          <ul className={styles.partners}>{about.partners.map((x) => <li key={x}>{x}</li>)}</ul>
        </figure>
      </div>
    </section>
  );
}

/* Диаграммы под цифры: бары, точки, таймлайн, кольцо */
function Diagram({ kind }: { kind: string }) {
  if (kind === 'bars') return <div className={styles.bars} aria-hidden>{[30, 46, 58, 52, 70, 84, 100].map((h, i) => <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />)}</div>;
  if (kind === 'dots') return <div className={styles.dots} aria-hidden>{Array.from({ length: 30 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.03}s` }} />)}</div>;
  if (kind === 'timeline') return <div className={styles.tl} aria-hidden><i /><i /><i /><b style={{ left: '70%' }} /></div>;
  const r = 20, c = 2 * Math.PI * r;
  return (
    <svg className={styles.ring} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--yellow)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c * 0.55} ${c}`} transform="rotate(-90 24 24)" />
    </svg>
  );
}
