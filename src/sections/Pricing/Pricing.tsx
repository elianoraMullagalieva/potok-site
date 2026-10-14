import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { pricing } from '../../content/texts';
import { Button } from '../../ui/Button';
import { SkyStatic } from '../../ui/Sky';
import { Face } from '../../ui/Face';
import { SwipeHint } from '../../ui/SwipeHint';
import { services } from '../../content/texts';
import { Manifest } from '../../ui/Manifest';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Pricing.module.css';

/* Тарифы: четыре колонки, «Тест 14 дней» выделен небом и жёлтой кнопкой, списки в отдельных панелях. Ниже сравнение с переключателем, ячейки меняются вертикальным flip */
export function Pricing() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.plan}`, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.1, immediateRender: false, scrollTrigger: { trigger: `.${styles.grid}`, start: 'top 88%', once: true } });
      gsap.fromTo(`.${styles.compare}`, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', immediateRender: false, scrollTrigger: { trigger: `.${styles.compare}`, start: 'top 88%', once: true } });
      gsap.fromTo(`.${styles.table} tr`, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, immediateRender: false, scrollTrigger: { trigger: `.${styles.table}`, start: 'top 88%', once: true } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const c = pricing.compare;

  return (
    <section id="pricing" ref={root} className={`wrap ${styles.section}`}>
      <Manifest label="" chunks={pricing.manifest} skies={['test', 'manifest1']} />

      <div className={styles.grid}>
        {pricing.plans.map((p) => (
          <article key={p.id} className={`${styles.plan} ${p.featured ? styles.featured : ''}`}>
            {p.featured && <div className={styles.bg} aria-hidden><SkyStatic id="test" /><div className={styles.shade} /></div>}
            <div className={styles.planTop}>
              <div>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.tag}>{p.tag}</p>
              </div>
              {p.badge && <span className={styles.badge}>{p.badge}</span>}
            </div>
            <p className={styles.who}>{p.who}</p>
            <div className={styles.priceRow}><span className={`num ${styles.price}`}>{p.price}</span><span className={styles.per}>{p.per}</span></div>
            <Button variant={p.featured ? 'primary' : 'ghost'} arrow className={styles.cta} href={p.featured ? '#quiz' : '#lead'}>{p.cta}</Button>
            <div className={styles.panel}>
              <span className={styles.incLabel}>{p.includesLabel}</span>
              <ul className={styles.inc}>{p.includes.map((x) => <li key={x}><i aria-hidden /><span>{x}</span></li>)}</ul>
            </div>
          </article>
        ))}
      </div>
      <p className={styles.budget}>{pricing.budget}</p>

      {/* сравнение: все четыре варианта открыты сразу, у каждого свой «аватар» */}
      <div className={styles.cmpHead}>
        <h3 className={`display ${styles.cmpTitle}`}>{c.title}</h3>
        <p className={styles.cmpSub}>{c.honest}</p>
      </div>
      <div className={styles.compare}>
        <SwipeHint text="Листайте вправо" className={styles.cmpHint} />
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" />
              {c.cols.map((name, i) => (
                <th key={name} scope="col" className={i === 0 ? styles.usHead : ''}>
                  <div className={styles.colHead}>
                    {i === 0
                      ? <span className={styles.faces}>{Object.values(services.people).slice(0, 4).map((p) => <Face key={p.name} src={p.face} name={p.name} size={34} ring="#fff" />)}</span>
                      : <Face src={COMPARE[i - 1]} name={name} size={34} ring="#fff" />}
                    <b>{name}</b><small>{c.colSub[i]}</small>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.rows.map((r) => (
              <tr key={r[0]}>
                <th scope="row">{r[0]}</th>
                {r.slice(1).map((v, i) => <td key={i} className={i === 0 ? styles.us : styles.them}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* Альтернативы: фрилансер помоложе, менеджер агентства и штатный сотрудник постарше */
const COMPARE = ['compare/free.webp', 'compare/agency.webp', 'compare/staff.webp'];
