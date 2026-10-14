import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { cases } from '../../content/texts';
import { Button } from '../../ui/Button';
import { SkyStatic } from '../../ui/Sky';
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
  // «Изучить кейс»: открываем вкладку в блоке «Кейс подробно» и едем к нему
  const study = (id: string) => {
    window.dispatchEvent(new CustomEvent('case:open', { detail: id }));
    document.getElementById('case')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.row1} .${styles.card}`);
      if (reduced || small) {
        gsap.set(cards, { x: 0, rotate: 0, y: 0 });
        gsap.set(`.${styles.big}`, { filter: 'blur(0px)', opacity: 1 });
        gsap.set(`.${styles.row2} .${styles.card}, .${styles.more}`, { opacity: 1, y: 0 });
        return;
      }
      const n = cards.length;
      const big = el.querySelector<HTMLElement>(`.${styles.big}`)!;
      const row1 = el.querySelector<HTMLElement>(`.${styles.row1}`)!;
      const tl = gsap.timeline({ scrollTrigger: { trigger: `.${styles.pin}`, start: 'top top', end: '+=170%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true } });
      cards.forEach((c, i) => {
        const k = i - (n - 1) / 2;
        const start = () => -k * (c.offsetWidth + 24) + k * 48;
        gsap.set(c, { zIndex: 10 - Math.abs(k) });
        tl.fromTo(c, { x: start, rotate: k * 7, y: Math.abs(k) * 18 }, { x: 0, rotate: 0, y: 0, ease: 'power2.inOut', duration: 1, immediateRender: true }, 0);
      });
      // заголовок проявляется, затем поднимается так, чтобы его низ встал над первым рядом
      const lift = () => -((row1.getBoundingClientRect().top - big.getBoundingClientRect().top) - big.offsetHeight - 24) - (gsap.getProperty(big, 'y') as number);
      tl.fromTo(big, { filter: 'blur(18px)', opacity: 0.18, scale: 1.04 }, { filter: 'blur(0px)', opacity: 1, scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .to(big, { y: () => { const cur = gsap.getProperty(big, 'y') as number; gsap.set(big, { y: 0 }); const v = (row1.getBoundingClientRect().top - big.getBoundingClientRect().top) - big.offsetHeight - 56; gsap.set(big, { y: cur }); return Math.min(0, v); }, ease: 'power2.inOut', duration: 0.8 }, 0.4)
        // второй ряд приходит, как только карточки встали и заголовок ушёл вверх
        .fromTo(`.${styles.row2} .${styles.card}`, { y: 90, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.6, stagger: 0.08 }, 1.0)
        .fromTo(`.${styles.more}`, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.25);
      void lift;
    }, el);
    return () => ctx.revert();
  }, [reduced, small]);

  return (
    <section id="cases" ref={root} className={styles.section}>
      <div className={styles.pin}>
        <h2 className={`display ${styles.big}`} aria-label={cases.title}>
          {cases.titleChunks.map((ch, i) => ch === '▬'
            ? <span key={i} className={styles.capsule} aria-hidden><SkyStatic id={i === 1 ? 'manifest1' : 'manifest2'} /></span>
            : <span key={i}>{ch}</span>)}
        </h2>
        <div className={styles.stage}>
          <div className={styles.row1}>{cases.items.slice(0, 3).map((c) => <Card key={c.id} c={c} onStudy={study} />)}</div>
          <div className={styles.row2}>{cases.items.slice(3).map((c) => <Card key={c.id} c={c} onStudy={study} />)}</div>
          <div className={styles.more}>
            <Button variant="dark" arrow className={styles.moreBtn} href="#lead">{cases.more}</Button>
            <span className={styles.moreSub}>{cases.moreSub}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Карточка: две цифры заголовком, логотип клиента на подложке, ниша, что сделали, две пилюли и кнопка */
function Card({ c, onStudy }: { c: Case; onStudy: (id: string) => void }) {
  const [a, b] = c.head.split(' → ');
  return (
    <article className={styles.card}>
      <p className={`num ${styles.head}`}>
        <span>{a}</span>
        {b && <><span className={styles.arrow} aria-hidden><svg width="26" height="12" viewBox="0 0 28 12" fill="none"><path d="M0 6h26m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span>{b}</span></>}
      </p>
      <div className={styles.logoBox}><img className={`${styles.logo} ${styles[c.id] ?? ''}`} src={asset(`logos/${c.id}.png`)} alt={c.client} loading="lazy" draggable={false} /></div>
      <div className={styles.body}>
        <h3 className={styles.niche}>{c.niche}</h3>
        <p className={styles.did}>{c.did}</p>
        <ul className={styles.facts}>{c.facts.slice(0, 2).map((f) => <li key={f}>{f}</li>)}</ul>
      </div>
      <Button variant="ghost" arrow className={styles.cta} onClick={() => onStudy(c.id)}>{cases.cta}</Button>
    </article>
  );
}
