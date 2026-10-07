import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { Sky } from './Sky';
import { LogoMark } from './Logo';
import styles from './Preloader.module.css';

/**
 * Прелоадер по референсу CropTab, в наших тонах.
 * 1. Светлая шторка, в центре концентрические рамки схлопываются к маленькому квадрату (тоннель).
 * 2. В квадрате уже живёт небо и наш знак, короткая пауза.
 * 3. Квадрат раскрывается окном ровно до рамки героя (отступ 12px, радиус 28), небо занимает экран.
 * 4. Шторка растворяется, под ней герой с тем же небом: переход бесшовный.
 */
// вложенные квадраты-маски с небом внутри: доли от меньшей стороны экрана, снаружи внутрь
const RINGS = [0.56, 0.45, 0.36, 0.285, 0.22, 0.165];

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
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    // тоннель: квадраты всплывают из глубины и мягко схлопываются к центру, внутренние первыми
    RINGS.forEach((f, i) => {
      const from = ins(M * f, Math.max(14, M * f * 0.08));
      gsap.set(rings[i], { clipPath: from, opacity: 0 });
      tl.to(rings[i], { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.05 + i * 0.07)
        .fromTo(rings[i], { clipPath: from }, { clipPath: ins(S, 14), duration: 1.25 + i * 0.1 }, 0.5 + (RINGS.length - 1 - i) * 0.1);
    });
    tl.to(w, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 1.35)
      // ядро дышит, вокруг знака прорисовывается тонкое кольцо
      .fromTo(q(`.${styles.core}`), { scale: 0.9 }, { scale: 1.06, duration: 0.9, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.5)
      .fromTo(q(`.${styles.arc}`), { strokeDashoffset: 132 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 1.5)
      .fromTo(q(`.${styles.mark}`), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, 1.55)
      .fromTo(q(`.${styles.meta} > *`), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, 0.6)
      // окно раскрывается до рамки героя
      .to(q(`.${styles.core}`), { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' }, 3.0)
      .fromTo(w, { clipPath: small }, { clipPath: full, duration: 1.3, ease: 'expo.inOut' }, 3.05)
      .to(q(`.${styles.meta}`), { opacity: 0, duration: 0.3 }, 3.05)
      .to(el, { opacity: 0, duration: 0.45, ease: 'power2.inOut', onComplete: onDone }, 4.2);
    return () => { tl.kill(); };
  }, [onDone]);

  return (
    <div ref={root} className={styles.root} aria-hidden>
      {RINGS.map((_, i) => <div key={i} className={`${styles.ring} ${i % 2 ? styles.ringDeep : ''}`} style={{ backgroundImage: `url(${import.meta.env.BASE_URL}sky/quiz.webp)`, backgroundSize: `${118 + i * 14}% auto` }} />)}
      <div ref={win} className={styles.win}>
        <Sky seed={1.7} />
        <div className={styles.shade} />
        <span className={styles.core}>
          <svg className={styles.ringSvg} width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="21" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" /><circle className={styles.arc} cx="28" cy="28" r="21" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="132" strokeDashoffset="132" transform="rotate(-90 28 28)" /></svg>
          <span className={styles.mark}><LogoMark size={22} /></span>
        </span>
      </div>
      <div className={styles.meta}><span>Поток</span><span>potok.studio</span></div>
    </div>
  );
}
