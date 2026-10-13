import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/lenis';
import { pricing } from '../../content/texts';
import { Button } from '../../ui/Button';
import { SkyStatic } from '../../ui/Sky';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Pricing.module.css';

/* Тарифы: четыре колонки, «Тест 14 дней» выделен небом и жёлтой кнопкой, списки в отдельных панелях. Ниже сравнение с переключателем, ячейки меняются вертикальным flip */
export function Pricing() {
  const root = useRef<HTMLElement>(null);
  const [col, setCol] = useState(1);
  const [flip, setFlip] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.plan}`, { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: `.${styles.grid}`, start: 'top 80%' } });
      gsap.from(`.${styles.compare}`, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.compare}`, start: 'top 85%' } });
      gsap.from(`.${styles.table} tr`, { opacity: 0, x: -12, duration: 0.8, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: `.${styles.table}`, start: 'top 85%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const timer = useRef(0);
  const pick = (i: number) => { if (i === col) return; clearTimeout(timer.current); setFlip(true); timer.current = window.setTimeout(() => { setCol(i); setFlip(false); }, 220); };
  useEffect(() => () => clearTimeout(timer.current), []);
  const c = pricing.compare;

  return (
    <section id="pricing" ref={root} className={`wrap ${styles.section}`}>
      <div className={styles.head}>
        <h2 className={`display ${styles.h2}`}>{pricing.title}</h2>
        <p className={styles.sub}>{pricing.sub}</p>
      </div>

      <div className={styles.grid}>
        {pricing.plans.map((p) => (
          <article key={p.id} className={`${styles.plan} ${p.featured ? styles.featured : ''}`}>
            {p.featured && <div className={styles.bg} aria-hidden><SkyStatic id="test" /><div className={styles.shade} /></div>}
            <div className={styles.planTop}>
              <div>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.who}>{p.who}</p>
              </div>
              {p.badge && <span className={styles.badge}>{p.badge}</span>}
            </div>
            <div className={styles.priceRow}><span className={`num ${styles.price}`}>{p.price}</span><span className={styles.per}>{p.per}</span></div>
            <Button variant={p.featured ? 'primary' : 'ghost'} arrow className={styles.cta} href={p.featured ? '#quiz' : '#lead'}>{p.cta}</Button>
            <div className={styles.panel}>
              <span className={styles.incLabel}>{p.includesLabel}</span>
              <ul className={styles.inc}>{p.includes.map((x) => <li key={x}><i aria-hidden /><span>{x}</span></li>)}</ul>
              {p.note && <p className={styles.note}>{p.note}</p>}
            </div>
          </article>
        ))}
        <p className={styles.budget}>{pricing.budget}</p>
      </div>

      <div className={styles.compare}>
        <div className={styles.compareHead}>
          <span className={styles.usLabel}>{c.cols[0]}</span>
          <div className={styles.tabs} role="tablist">
            {c.cols.slice(1).map((name, i) => (
              <button key={name} role="tab" aria-selected={i + 1 === col} className={`${styles.tab} ${i + 1 === col ? styles.tabOn : ''}`} onClick={() => pick(i + 1)}>{name}</button>
            ))}
          </div>
        </div>
        <table className={styles.table}>
          <tbody>
            {c.rows.map((r) => (
              <tr key={r[0]}>
                <th scope="row">{r[0]}</th>
                <td className={styles.us}>{r[1]}</td>
                <td className={`${styles.them} ${flip ? styles.flipping : ''}`}><span>{r[1 + col]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.honest}>{c.honest}</p>
      </div>
    </section>
  );
}
