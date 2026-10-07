import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { Sky } from './Sky';
import styles from './Preloader.module.css';

/**
 * Прелоадер: светлая шторка, в ней слово ПОТОК вырезано насквозь — через буквы видно живое небо.
 * Буквы собираются из лёгкого расфокуса, трекинг стягивается, затем вырез раскрывается
 * на весь экран, и небо становится небом героя.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const text = el.querySelector('text') as SVGTextElement;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(text, { opacity: 0, letterSpacing: '0.02em', filter: 'blur(14px)' }, { opacity: 1, letterSpacing: '-0.05em', filter: 'blur(0px)', duration: 1.6 }, 0.1)
      .fromTo(q(`.${styles.meta} > *`), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.5)
      .fromTo(q(`.${styles.line}`), { scaleX: 0 }, { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 0.3)
      // вырез раскрывается: буквы растут, пока не выйдут за экран
      .to(text, { scale: 34, duration: 1.3, ease: 'expo.in', transformOrigin: '50% 50%' }, 1.9)
      .to(q(`.${styles.meta}, .${styles.line}`), { opacity: 0, duration: 0.3 }, 1.9)
      .to(el, { opacity: 0, duration: 0.5, ease: 'power2.inOut', onComplete: onDone }, 2.9);
    return () => { tl.kill(); };
  }, [onDone]);

  return (
    <div ref={root} className={styles.root} aria-hidden>
      <Sky seed={1.7} />
      <div className={styles.shade} />
      <svg className={styles.cover} width="100%" height="100%">
        <defs>
          <mask id="potok-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="#fff" />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#000" className={styles.word}>ПОТОК</text>
          </mask>
        </defs>
        <rect width="100%" height="100%" className={styles.plate} mask="url(#potok-cut)" />
      </svg>
      <i className={styles.line} />
      <div className={styles.meta}><span>potok.studio</span><span>Директ · Avito Ads</span></div>
    </div>
  );
}
