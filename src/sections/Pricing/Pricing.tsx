import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { pricing } from '../../content/texts';
import { Button } from '../../ui/Button';
import { SkyStatic } from '../../ui/Sky';
import { Face } from '../../ui/Face';
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
      <Manifest label={pricing.label} chunks={pricing.manifest} skies={['test', 'manifest1']} />

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
      <div className={styles.compare}>
        <div className={styles.cmpHead}>
          <h3 className={`display ${styles.cmpTitle}`}>{c.title}</h3>
          <p className={styles.cmpSub}>{c.honest}</p>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" />
              {c.cols.map((name, i) => (
                <th key={name} scope="col" className={i === 0 ? styles.usHead : ''}>
                  <div className={styles.colHead}>
                    {i === 0
                      ? <span className={styles.faces}>{Object.values(services.people).slice(0, 4).map((p) => <Face key={p.name} src={p.face} name={p.name} size={34} ring="#fff" />)}</span>
                      : <span className={styles.persona}><Persona i={i} /></span>}
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

/* Пиктограммы альтернатив: один человек, здание агентства, бейдж сотрудника */
function Persona({ i }: { i: number }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (i === 1) return <svg viewBox="0 0 24 24" width="18" height="18"><circle {...p} cx="12" cy="8" r="4" /><path {...p} d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
  if (i === 2) return <svg viewBox="0 0 24 24" width="18" height="18"><path {...p} d="M4 21V5l8-2v18M12 9l8 2v10M4 21h16M8 9h1M8 13h1M8 17h1M16 14h1M16 17h1" /></svg>;
  return <svg viewBox="0 0 24 24" width="18" height="18"><rect {...p} x="5" y="4" width="14" height="17" rx="2" /><circle {...p} cx="12" cy="10" r="2.5" /><path {...p} d="M8 18c.6-2 2-3 4-3s3.4 1 4 3" /></svg>;
}
