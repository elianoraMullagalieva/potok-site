import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { process } from '../../content/texts';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Process.module.css';

/**
 * Как работаем: pinned-полоса, пять шагов едут горизонтально.
 * Сверху линия-прогресс с подписями «когда», номер шага контуром заливается жёлтым по мере прохождения.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const small = useMedia('(max-width: 900px)');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || small) return;
    const el = root.current!, tr = track.current!;
    const ctx = gsap.context(() => {
      const dist = () => tr.scrollWidth - window.innerWidth;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist() + 400}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      tl.to(tr, { x: () => -dist(), ease: 'none', duration: 1 }, 0)
        .to(`.${styles.bar}`, { scaleX: 1, ease: 'none', duration: 1 }, 0);
      gsap.utils.toArray<HTMLElement>(`.${styles.fill}`).forEach((f, i) => {
        tl.fromTo(f, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', duration: 0.18 }, i * 0.2);
      });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced, small]);

  return (
    <section id="process" ref={root} className={styles.section}>
      <div className={`wrap ${styles.head}`}>
        <h2 className={`display ${styles.h2}`}>{process.title}</h2>
        <p className={styles.sub}>{process.sub}</p>
      </div>
      <div className={`wrap ${styles.progress}`} aria-hidden>
        <div className={styles.line}><i className={styles.bar} /></div>
        <ul className={styles.whens}>{process.steps.map((s) => <li key={s.n}>{s.when}</li>)}</ul>
      </div>
      <div ref={track} className={styles.track}>
        {process.steps.map((s) => (
          <article key={s.n} className={styles.step}>
            <div className={`num ${styles.big}`} aria-hidden>
              <span className={styles.outline}>{s.n}</span>
              <span className={styles.fill}>{s.n}</span>
            </div>
            <div className={styles.body}>
              <span className="label mute">{s.when}</span>
              <h3 className={styles.title}>{s.title}</h3>
              <p className={styles.result}><i aria-hidden />{s.result}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
