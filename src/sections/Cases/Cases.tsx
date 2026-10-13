import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/lenis';
import { cases } from '../../content/texts';
import { Button } from '../../ui/Button';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Cases.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
type Case = (typeof cases.items)[number];

/**
 * Кейсы: светлый блок. Огромный размытый заголовок, поверх веер из трёх карточек.
 * На скролле веер раскладывается в ряд, заголовок проявляется и уходит вверх (первая версия).
 * Ниже дозированно приходят ещё три кейса и крупная кнопка «Смотреть больше кейсов».
 */
export function Cases() {
  const root = useRef<HTMLElement>(null);
  const small = useMedia('(max-width: 900px)');
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.row1} .${styles.card}`);
      if (reduced || small) {
        gsap.set(cards, { x: 0, rotate: 0, y: 0 });
        gsap.set(`.${styles.big}`, { filter: 'blur(0px)', opacity: 1 });
        return;
      }
      const n = cards.length;
      const tl = gsap.timeline({ scrollTrigger: { trigger: `.${styles.pin}`, start: 'top top', end: '+=160%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true } });
      cards.forEach((c, i) => {
        const k = i - (n - 1) / 2;
        const start = () => -k * (c.offsetWidth + 24) + k * 48;
        gsap.set(c, { zIndex: 10 - Math.abs(k) });
        tl.fromTo(c, { x: start, rotate: k * 7, y: Math.abs(k) * 18 }, { x: 0, rotate: 0, y: 0, ease: 'power2.inOut', duration: 1, immediateRender: true }, 0);
      });
      tl.fromTo(`.${styles.big}`, { filter: 'blur(18px)', opacity: 0.18, scale: 1.04 }, { filter: 'blur(0px)', opacity: 1, scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .to(`.${styles.big}`, { yPercent: -92, ease: 'power2.inOut', duration: 0.8 }, 0.35)
        .to(`.${styles.stage}`, { y: 90, ease: 'power2.inOut', duration: 0.8 }, 0.35);
      // второй ряд: приходит дозированно, когда дошли до него
      gsap.from(`.${styles.row2} .${styles.card}`, { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: `.${styles.row2}`, start: 'top 85%' } });
      gsap.from(`.${styles.more}`, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.more}`, start: 'top 92%' } });
    }, el);
    return () => ctx.revert();
  }, [reduced, small]);

  return (
    <section id="cases" ref={root} className={styles.section}>
      <div className={styles.pin}>
        <h2 className={`display ${styles.big}`} aria-label={cases.title}>{cases.title}</h2>
        <div className={styles.stage}>
          <div className={styles.row1}>{cases.items.slice(0, 3).map((c) => <Card key={c.id} c={c} />)}</div>
        </div>
      </div>
      <div className={`wrap ${styles.rest}`}>
        <div className={styles.row2}>{cases.items.slice(3).map((c) => <Card key={c.id} c={c} />)}</div>
        <div className={styles.more}>
          <Button variant="dark" arrow className={styles.moreBtn} href="#lead">{cases.more}</Button>
          <span className={styles.moreSub}>{cases.moreSub}</span>
        </div>
      </div>
    </section>
  );
}

/* Карточка: две цифры заголовком, логотип клиента на подложке, ниша, что сделали, две пилюли и кнопка */
function Card({ c }: { c: Case }) {
  const [open, setOpen] = useState(false);
  const [a, b] = c.head.split(' → ');
  return (
    <article className={`${styles.card} ${open ? styles.open : ''}`}>
      <p className={`num ${styles.head}`}>
        <span>{a}</span>
        {b && <><span className={styles.arrow} aria-hidden><svg width="26" height="12" viewBox="0 0 28 12" fill="none"><path d="M0 6h26m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span>{b}</span></>}
      </p>
      <div className={styles.logoBox}><img className={`${styles.logo} ${styles[c.id] ?? ''}`} src={asset(`logos/${c.id}.png`)} alt={c.client} loading="lazy" draggable={false} /></div>
      <div className={styles.body}>
        <h3 className={styles.niche}>{c.niche}</h3>
        <p className={styles.did}>{c.did}</p>
        <ul className={styles.facts}>{c.facts.slice(0, 2).map((f) => <li key={f}>{f}</li>)}</ul>
        <div className={styles.moreText} aria-hidden={!open}>
          <div>
            <blockquote className={styles.quote}>«{c.quote}»<footer>{c.who}</footer></blockquote>
          </div>
        </div>
      </div>
      <Button variant="ghost" arrow className={styles.cta} onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Свернуть' : cases.cta}</Button>
    </article>
  );
}
