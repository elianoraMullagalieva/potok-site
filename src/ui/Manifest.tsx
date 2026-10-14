import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { SkyStatic, type SkyId } from './Sky';
import { Dot } from './Tag';
import { useReducedMotion } from '../lib/useReducedMotion';
import styles from './Manifest.module.css';

/**
 * Заголовок-манифест: звёздочка и подпись, строка с капсулами неба внутри текста.
 * Слова проявляются по скроллу. `accent` — какой фрагмент чёрный: первый или последний.
 */
export function Manifest({ label, chunks, accent = 'first', skies = ['manifest1', 'manifest2'], className }:
  { label: string; chunks: string[]; accent?: 'first' | 'last'; skies?: SkyId[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.w}`, { opacity: 0.18 }, { opacity: 1, stagger: 0.04, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);
  const texts = chunks.filter((c) => c !== '▬');
  const accentIdx = accent === 'first' ? 0 : texts.length - 1;
  let k = -1, cap = 0;
  return (
    <div ref={root} className={`${styles.root} ${className ?? ''}`}>
      <div className={styles.head}><Dot /><span className="label mute">{label}</span></div>
      <h2 className={`display ${styles.manifest}`}>
        {chunks.map((chunk, i) => {
          if (chunk === '▬') { const id = skies[cap++ % skies.length]; return <span key={i} className={styles.capsule} aria-hidden><SkyStatic id={id} /></span>; }
          k++;
          const mute = k !== accentIdx;
          return chunk.split(' ').map((w, j) => <span key={`${i}-${j}`} className={`${styles.w} ${mute ? styles.wMute : ''}`}>{w}</span>);
        })}
      </h2>
    </div>
  );
}
