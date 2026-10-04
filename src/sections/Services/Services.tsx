import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { services } from '../../content/texts';
import { SkyStatic } from '../../ui/Sky';
import { Tag } from '../../ui/Tag';
import { Button } from '../../ui/Button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Services.module.css';

export function Services() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(1);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.h2} .${styles.line}`, { yPercent: 100, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: `.${styles.h2}`, start: 'top 80%' } });
      gsap.from(`.${styles.item}`, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: `.${styles.row}`, start: 'top 85%' } });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced]);

  const leads = Array.from(new Set(services.items.map((s) => s.lead)));

  return (
    <section id="services" ref={root} className={`wrap ${styles.section}`}>
      <div className={styles.mark} aria-hidden>
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none"><path d="M4 25V9c0-2.2 1.8-4 4-4h3v20" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"/><path d="M11 5h8c2.2 0 4 1.8 4 4v3.5c0 2.8-2.3 5-5 5h-4" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"/><path d="M17.5 17.5c3.5 0 6.5 1.6 8.5 7.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"/></svg>
      </div>
      <h2 className={`display ${styles.h2}`}>
        <span className={styles.mask}><span className={styles.line}>{services.title}</span></span>
        <span className={styles.mask}><span className={`${styles.line} ${styles.tail}`}>{services.titleTail}</span></span>
      </h2>
      <div className={styles.notes}>
        <p className={styles.note}>{services.sub}</p>
        <p className={`${styles.note} ${styles.noteRight}`}><span className="label mute">{services.leadLabel}</span><br />{leads.join(' · ')}</p>
      </div>

      <div className={styles.row} role="tablist" aria-label={services.label}>
        {services.items.map((s, i) => {
          const on = i === active;
          return (
            <div
              key={s.n} role="tab" aria-selected={on} tabIndex={0}
              className={`${styles.item} ${on ? styles.on : ''}`}
              onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}
            >
              {on && <SkyStatic seed={6 + i} zoom={0.7} pan={[0.2 * i, 0.3]} />}
              <div className={styles.shade} />
              <div className={styles.top}>
                <Tag onDark={on}>{s.lead}</Tag>
                <span className={`num ${styles.key}`}>{s.n}</span>
              </div>
              <div className={styles.bottom}>
                <h3 className={styles.title}>{s.title}</h3>
                <div className={styles.more}>
                  <p className={styles.lineText}>{s.line}</p>
                  <p className={styles.fit}><span className="label">{services.fitLabel}</span><br />{s.fit}</p>
                  <Button variant="primary" arrow className={styles.cta} tabIndex={on ? 0 : -1}>{services.cta}</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
