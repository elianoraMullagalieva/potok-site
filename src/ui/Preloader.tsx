import { useEffect, useRef } from 'react';
import { gsap } from '../lib/lenis';
import { Wire } from './Wire';
import styles from './Preloader.module.css';

/* ПОТОК собирается пятью приёмами из кинетической типографики, потом улетает в логотип */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    // 1. П — кейкап падает и кувыркается
    tl.fromTo(q('[data-k="p"]'), { y: -260, rotateX: -80, rotateZ: -14, opacity: 0 }, { y: 0, rotateX: 0, rotateZ: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0.1)
      // 2. О — кольцо вращается, потом схлопывается в букву
      .fromTo(q('[data-k="o1-wire"]'), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 }, 0.45)
      .to(q('[data-k="o1-wire"]'), { scale: 0.7, opacity: 0, duration: 0.4, ease: 'power3.in' }, 1.05)
      .fromTo(q('[data-k="o1"]'), { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 }, 1.15)
      // 3. Т — курсор мигает, буква печатается, выделение проезжает
      .fromTo(q('[data-k="caret"]'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.8)
      .to(q('[data-k="caret"]'), { opacity: 0, duration: 0.05, repeat: 3, yoyo: true, repeatDelay: 0.14 }, 0.85)
      .fromTo(q('[data-k="t"]'), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 1.45)
      .fromTo(q('[data-k="sel"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 1.5)
      .fromTo(q('[data-k="h1"], [data-k="h2"]'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, 1.6)
      .to(q('[data-k="sel"], [data-k="h1"], [data-k="h2"], [data-k="caret"]'), { opacity: 0, duration: 0.3 }, 2.3)
      // 4. О — жетон вкатывается и растворяется
      .fromTo(q('[data-k="o2-token"]'), { x: 140, rotate: 180, opacity: 0 }, { x: 0, rotate: 0, opacity: 1, duration: 0.8 }, 1.3)
      .to(q('[data-k="o2-token"]'), { backgroundColor: 'rgba(18,19,22,0)', color: '#121316', boxShadow: '0 0 0 0 rgba(0,0,0,0)', duration: 0.5 }, 2.1)
      // 5. К — из разлёта в строку
      .fromTo(q('[data-k="k"]'), { x: 90, y: -120, rotate: 38, opacity: 0 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 0.9 }, 1.7)
      // счётчик
      .fromTo(q('[data-k="meta"]'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.3);

    // слово становится чистым вордмарком: кейкап и жетон растворяются, кегль выравнивается
    tl.to(q('[data-k="p"]'), { backgroundColor: 'rgba(255,255,255,0)', boxShadow: '0 0 0 0 rgba(0,0,0,0)', fontSize: '1em', width: '0.78em', margin: 0, duration: 0.5, ease: 'power3.inOut' }, 2.45)
      .to(q('[data-k="o2-token"]'), { fontSize: '1em', duration: 0.5, ease: 'power3.inOut' }, 2.45);
    // финал: слово уезжает в позицию логотипа, панель уходит
    tl.add(() => {
      const word = q('[data-k="word"]')[0] as HTMLElement;
      const target = document.querySelector('[data-logo-word]') as HTMLElement | null;
      const r = word.getBoundingClientRect();
      const tr = target?.getBoundingClientRect();
      const sx = tr ? tr.height / r.height : 0.16;
      const dx = tr ? tr.left - r.left - (r.width * (1 - sx)) / 2 : -r.left + 60;
      const dy = tr ? tr.top - r.top - (r.height * (1 - sx)) / 2 : -r.top + 40;
      gsap.to(word, { x: dx, y: dy, scale: sx, duration: 1.1, ease: 'expo.inOut' });
      gsap.to(q('[data-k="meta"]'), { opacity: 0, duration: 0.3 });
      gsap.to(el, { opacity: 0, duration: 0.6, delay: 0.75, ease: 'power2.inOut', onComplete: onDone });
    }, 2.75);

    return () => { tl.kill(); };
  }, [onDone]);

  return (
    <div ref={root} className={styles.root} aria-hidden>
      <div className={styles.word} data-k="word">
        <span className={`${styles.slot} ${styles.key}`} data-k="p">П</span>
        <span className={styles.slot}>
          <span className={styles.wire} data-k="o1-wire"><Wire kind="rings" stroke={1.4} /></span>
          <span className={styles.letter} data-k="o1">О</span>
        </span>
        <span className={styles.slot}>
          <i className={styles.caret} data-k="caret" />
          <span className={styles.sel} data-k="sel" />
          <i className={`${styles.handle} ${styles.hl}`} data-k="h1" /><i className={`${styles.handle} ${styles.hr}`} data-k="h2" />
          <span className={styles.letter} data-k="t">Т</span>
        </span>
        <span className={styles.slot}><span className={`${styles.letter} ${styles.token}`} data-k="o2-token">О</span></span>
        <span className={`${styles.slot} ${styles.letter}`} data-k="k">К</span>
      </div>
      <div className={`label ${styles.meta}`} data-k="meta"><span>potok.studio</span><span>Директ · Avito Ads</span></div>
    </div>
  );
}
