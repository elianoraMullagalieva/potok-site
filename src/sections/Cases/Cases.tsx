import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { cases } from '../../content/texts';
import { Button } from '../../ui/Button';
import { CaseMark } from './Logos';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Cases.module.css';

/**
 * Кейсы по svz: огромный размытый заголовок во всю ширину, поверх веер стеклянных
 * карточек. На скролле (pin) веер раскладывается в ряд, заголовок проявляется и уходит вверх.
 */
export function Cases() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const small = useMedia('(max-width: 900px)');
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`);
      const n = cards.length;
      if (reduced || small) {
        gsap.set(cards, { x: 0, rotate: 0 });
        gsap.set(`.${styles.big}`, { filter: 'blur(0px)', opacity: 1 });
        return;
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=160%', pin: true, scrub: 1.2, anticipatePin: 1 } });
      cards.forEach((c, i) => {
        const k = i - (n - 1) / 2;
        gsap.set(c, { x: k * 48, rotate: k * 7, y: Math.abs(k) * 18, zIndex: 10 - Math.abs(k) });
        tl.to(c, { x: k * 400, rotate: 0, y: 0, ease: 'power2.inOut', duration: 1 }, 0);
      });
      tl.fromTo(`.${styles.big}`, { filter: 'blur(18px)', opacity: 0.22, scale: 1.04, yPercent: -50 }, { filter: 'blur(0px)', opacity: 1, scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .to(`.${styles.big}`, { yPercent: -142, ease: 'power2.inOut', duration: 0.8 }, 0.35)
        .to(`.${styles.stage}`, { y: 90, ease: 'power2.inOut', duration: 0.8 }, 0.35)
        .fromTo(`.${styles.foot}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0.6);
      // счётчики «12 → 92»
      gsap.utils.toArray<HTMLElement>(`.${styles.to}`).forEach((n) => {
        const to = Number(n.dataset.to); const o = { v: Number(n.dataset.from) };
        gsap.to(o, { v: to, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 60%' }, onUpdate: () => { n.textContent = String(Math.round(o.v)); } });
      });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced, small]);

  return (
    <section id="cases" ref={root} className={styles.section}>
      <h2 className={`display ${styles.big}`} aria-label={cases.title}>{cases.title}</h2>
      <div className={styles.stage}>
        {cases.items.map((c) => {
          const isOpen = open === c.id;
          return (
            <article key={c.id} className={`${styles.card} ${isOpen ? styles.open : ''}`} onClick={() => setOpen(isOpen ? null : c.id)}>
              <header className={styles.cardHead}>
                <span className={styles.mark}><CaseMark id={c.id} size={30} /></span>
                <span className={styles.client}>{c.client}</span>
                <span className={styles.meta}>{c.niche} · {c.city}</span>
              </header>
              <div className={styles.numbers}>
                <span className={`num ${styles.from}`}>{c.from}</span>
                <span className={styles.arrow} aria-hidden><svg width="28" height="12" viewBox="0 0 28 12" fill="none"><path d="M0 6h26m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                <span className={`num ${styles.to}`} data-from={c.from} data-to={c.to}>{reduced || small ? c.to : c.from}</span>
              </div>
              <p className={styles.unit}>{c.unit}</p>
              <div className={styles.more}>
                <div>
                  <ul className={styles.facts}>{c.facts.map((f) => <li key={f}>{f}</li>)}</ul>
                  <blockquote className={styles.quote}>«{c.quote}»<footer>{c.who}</footer></blockquote>
                  <Button variant="primary" arrow className={styles.cta} onClick={(e) => e.stopPropagation()}>{cases.cta}</Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className={styles.foot}>
        <p className={styles.sub}>{cases.sub}</p>
        <ul className={styles.tags}>
          <li className={styles.tagsLabel}>{cases.more}</li>
          {cases.tags.map((t) => <li key={t} className={styles.tag}>{t}</li>)}
        </ul>
      </div>
    </section>
  );
}
