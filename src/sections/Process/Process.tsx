import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { process, hero } from '../../content/texts';
import { Sky } from '../../ui/Sky';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Process.module.css';

/**
 * Как работаем: рамка с небом (рифма с героем). Сверху линия дней, по скроллу она заполняется,
 * и каждый шаг приходит уведомлением на телефон, стопкой как в iOS. Слева крупно текущий день и шаг.
 */
const APPS = ['Поток', 'Поток', hero.card.app, 'Поток', 'Поток'];

export function Process() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const small = useMedia('(max-width: 900px)');
  const reduced = useReducedMotion();
  const n = process.steps.length;

  useEffect(() => {
    if (reduced || small) { setActive(n - 1); return; }
    const el = root.current!;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el, start: 'top top', end: '+=220%', pin: true, anticipatePin: 1,
        onUpdate: (self) => { const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999)); setActive((p) => (p === i ? p : i)); },
      });
      gsap.to(`.${styles.bar}`, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: '+=220%', scrub: 1 } });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced, small, n]);

  const s = process.steps[active];

  return (
    <section id="process" ref={root} className={styles.section}>
      <div className={styles.frame}>
        <Sky seed={11.2} zoom={1.05} pan={[0.5, 0.15]} />
        <div className={styles.shade} />

        <div className={styles.top}>
          <h2 className={`display ${styles.h2}`}>{process.title}</h2>
          <p className={styles.sub}>{process.sub}</p>
        </div>

        <div className={styles.timeline} aria-hidden>
          <div className={styles.line}><i className={styles.bar} /></div>
          <ul className={styles.whens}>
            {process.steps.map((st, i) => <li key={st.n} className={i <= active ? styles.whenOn : ''}><b /><span>{st.when}</span></li>)}
          </ul>
        </div>

        <div className={styles.body}>
          <div className={styles.left} key={active}>
            <span className={styles.when}>{s.when}</span>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.result}>{s.result}</p>
          </div>

          {/* стопка уведомлений: активное сверху, предыдущие уходят назад */}
          <div className={styles.phone}>
            <div className={styles.stack}>
              {process.steps.map((st, i) => {
                const d = active - i; // 0 — текущее, 1 — предыдущее…
                const shown = d >= 0 && d < 3;
                return (
                  <div key={st.n} className={`${styles.notif} ${shown ? styles.shown : ''} ${d < 0 ? styles.pending : ''}`}
                    style={{ '--d': Math.max(0, d) } as React.CSSProperties}>
                    <span className={`${styles.icon} ${APPS[i] === hero.card.app ? styles.iconCrm : ''}`} aria-hidden>{APPS[i] === hero.card.app ? 'a' : 'П'}</span>
                    <div className={styles.nBody}>
                      <div className={styles.nHead}><span>{APPS[i]}</span><span className="num">{['09:00', '10:42', '12:15', '12:16', 'пн, 09:00'][i]}</span></div>
                      <div className={styles.nTitle}>{st.title}</div>
                      <div className={styles.nText}>{st.result}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
