import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { Sky } from './Sky';
import styles from './Preloader.module.css';

/**
 * Прелоадер по референсу CropTab, в наших тонах.
 * 1. Светлая шторка, в центре концентрические рамки схлопываются к маленькому квадрату (тоннель).
 * 2. В квадрате уже живёт небо и наш знак, короткая пауза.
 * 3. Квадрат раскрывается окном ровно до рамки героя (отступ 12px, радиус 28), небо занимает экран.
 * 4. Шторка растворяется, под ней герой с тем же небом: переход бесшовный.
 */
// вложенные квадраты-маски с небом внутри: доли от меньшей стороны экрана, снаружи внутрь
const RINGS = [1.0, 0.78, 0.6, 0.45, 0.33, 0.23];

export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!, w = win.current!;
    const q = gsap.utils.selector(el);
    const W = window.innerWidth, H = window.innerHeight, S = 76; // стартовый квадрат
    // чуть разные значения, чтобы браузер не схлопнул запись до двух чисел и GSAP интерполировал все четыре стороны
    const small = `inset(${(H - S) / 2}px ${(W - S) / 2 + 0.01}px ${(H - S) / 2 + 0.02}px ${(W - S) / 2 + 0.03}px round 14px)`;
    const full = `inset(12px 12.01px 12.02px 12.03px round 28px)`;
    gsap.set(w, { clipPath: small, opacity: 0 });

    const M = Math.min(W, H);
    const ins = (size: number, r: number) => `inset(${(H - size) / 2}px ${(W - size) / 2 + 0.01}px ${(H - size) / 2 + 0.02}px ${(W - size) / 2 + 0.03}px round ${r}px)`;
    const rings = q(`.${styles.ring}`);
    const tl = gsap.timeline({ defaults: { ease: 'power3.in' } });
    // тоннель: квадраты схлопываются к центру, внутренние первыми
    RINGS.forEach((f, i) => {
      const from = ins(M * f, Math.max(14, M * f * 0.06));
      gsap.set(rings[i], { clipPath: from });
      tl.fromTo(rings[i], { clipPath: from }, { clipPath: ins(S, 14), duration: 1.0 + i * 0.08 }, 0.15 + (RINGS.length - 1 - i) * 0.09);
    });
    tl.to(w, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 1.0)
      .fromTo(q(`.${styles.mark}`), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, 1.15)
      .fromTo(q(`.${styles.meta} > *`), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, 0.6)
      // окно раскрывается до рамки героя
      .to(q(`.${styles.mark}`), { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' }, 1.95)
      .fromTo(w, { clipPath: small }, { clipPath: full, duration: 1.2, ease: 'expo.inOut' }, 2.0)
      .to(q(`.${styles.meta}`), { opacity: 0, duration: 0.3 }, 2.0)
      .to(el, { opacity: 0, duration: 0.45, ease: 'power2.inOut', onComplete: onDone }, 3.1);
    return () => { tl.kill(); };
  }, [onDone]);

  return (
    <div ref={root} className={styles.root} aria-hidden>
      {RINGS.map((_, i) => <div key={i} className={`${styles.ring} ${i % 2 ? styles.ringDeep : ''}`} style={{ backgroundImage: `url(${import.meta.env.BASE_URL}sky/quiz.webp)` }} />)}
      <div ref={win} className={styles.win}>
        <Sky seed={1.7} />
        <div className={styles.shade} />
        <span className={styles.mark}>
          <svg width="34" height="34" viewBox="0 0 30 30" fill="none"><path d="M4 25V9c0-2.2 1.8-4 4-4h3v20" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /><path d="M11 5h8c2.2 0 4 1.8 4 4v3.5c0 2.8-2.3 5-5 5h-4" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /><path d="M17.5 17.5c3.5 0 6.5 1.6 8.5 7.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /></svg>
        </span>
      </div>
      <div className={styles.meta}><span>Поток</span><span>potok.studio</span></div>
    </div>
  );
}
