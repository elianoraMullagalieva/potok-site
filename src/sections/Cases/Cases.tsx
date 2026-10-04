import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { cases } from '../../content/texts';
import { Button } from '../../ui/Button';
import { CaseLogo } from './Logos';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Cases.module.css';

/**
 * Кейсы: огромный размытый заголовок, поверх веер из трёх стеклянных карточек.
 * На скролле веер раскладывается в ряд, заголовок проявляется и уходит вверх,
 * затем снизу поднимаются ещё три кейса. Клик раскрывает карточку.
 */
export function Cases() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const small = useMedia('(max-width: 900px)');
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const first = gsap.utils.toArray<HTMLElement>(`.${styles.row1} .${styles.card}`);
      const second = gsap.utils.toArray<HTMLElement>(`.${styles.row2}`);
      if (reduced || small) {
        gsap.set(first, { x: 0, rotate: 0, y: 0 });
        gsap.set(`.${styles.big}`, { filter: 'blur(0px)', opacity: 1, yPercent: -50 });
        gsap.set(second, { opacity: 1, y: 0 });
        return;
      }
      const n = first.length;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=220%', pin: true, scrub: 1.2, anticipatePin: 1 } });
      first.forEach((c, i) => {
        const k = i - (n - 1) / 2;
        gsap.set(c, { x: k * 48, rotate: k * 7, y: Math.abs(k) * 18, zIndex: 10 - Math.abs(k) });
        tl.to(c, { x: k * 420, rotate: 0, y: 0, ease: 'power2.inOut', duration: 1 }, 0);
      });
      tl.fromTo(`.${styles.big}`, { filter: 'blur(18px)', opacity: 0.22, scale: 1.04, yPercent: -50 }, { filter: 'blur(0px)', opacity: 1, scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        // заголовок уходит вверх и уменьшается, ряд карточек поднимается
        .to(`.${styles.big}`, { yPercent: -240, scale: 0.46, ease: 'power2.inOut', duration: 0.9 }, 0.5)
        .to(`.${styles.row1}`, { y: -150, ease: 'power2.inOut', duration: 0.9 }, 0.5)
        // второй ряд поднимается снизу
        .fromTo(second, { y: 420, opacity: 0 }, { y: 150, opacity: 1, ease: 'power2.out', duration: 0.9 }, 0.9)
        .fromTo(`.${styles.foot}`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 1.4);
      gsap.utils.toArray<HTMLElement>(`.${styles.to}`).forEach((nEl) => {
        const to = Number(nEl.dataset.to); const o = { v: Number(nEl.dataset.from) };
        gsap.to(o, { v: to, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 60%' }, onUpdate: () => { nEl.textContent = String(Math.round(o.v)); } });
      });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced, small]);

  const Card = ({ c }: { c: (typeof cases.items)[number] }) => {
    const isOpen = open === c.id;
    return (
      <article className={`${styles.card} ${isOpen ? styles.open : ''}`} onClick={() => setOpen(isOpen ? null : c.id)}>
        <header className={styles.cardHead}>
          <CaseLogo id={c.id} name={c.client} />
          <span className={styles.period}>{c.period}</span>
        </header>
        <p className={styles.meta}>{c.niche} · {c.city}</p>
        <div className={styles.numbers}>
          {c.from > 0 && <><span className={`num ${styles.from}`}>{c.from}</span><span className={styles.arrow} aria-hidden><svg width="28" height="12" viewBox="0 0 28 12" fill="none"><path d="M0 6h26m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span></>}
          {c.from === 0 && <span className={styles.plus}>+</span>}
          <span className={`num ${styles.to}`} data-from={c.from} data-to={c.to}>{reduced || small ? c.to : c.from}</span>
        </div>
        <p className={styles.unit}>{c.unit}</p>
        <ul className={styles.facts}>{c.facts.map((f) => <li key={f}>{f}</li>)}</ul>
        <div className={styles.more}>
          <div>
            <p className={styles.did}>{c.did}</p>
            <blockquote className={styles.quote}>«{c.quote}»<footer>{c.who}</footer></blockquote>
            <Button variant="primary" arrow className={styles.cta} onClick={(e) => e.stopPropagation()}>{cases.cta}</Button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section id="cases" ref={root} className={styles.section}>
      <h2 className={`display ${styles.big}`} aria-label={cases.title}>{cases.title}</h2>
      <div className={styles.stage}>
        <div className={styles.row1}>{cases.items.slice(0, 3).map((c) => <Card key={c.id} c={c} />)}</div>
        <div className={styles.row2}>{cases.items.slice(3).map((c) => <Card key={c.id} c={c} />)}</div>
      </div>
      <p className={styles.foot}>{cases.sub}</p>
    </section>
  );
}
