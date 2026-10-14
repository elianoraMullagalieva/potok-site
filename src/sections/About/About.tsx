import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { about, services } from '../../content/texts';
import { Manifest } from '../../ui/Manifest';
import { Face } from '../../ui/Face';
import { Wire, type WireKind } from '../../ui/Wire';
const WIRE: Record<string, WireKind> = { bars: 'poly', dots: 'dots', timeline: 'wave', ring: 'rings' };
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './About.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/**
 * О нас: заголовок-манифест и бенто из живых карточек.
 * Фото команды, договор с тремя обещаниями и печатью, цитата Андрея, четыре цифры с проволочной графикой.
 */
export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const andrey = services.people['Андрей'];

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.grid} > *`, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: `.${styles.grid}`, start: 'top 82%' } });
      gsap.utils.toArray<HTMLElement>(`.${styles.val}`).forEach((n) => {
        const to = Number(n.dataset.v), d = Number(n.dataset.d ?? 0); const o = { v: 0 };
        gsap.to(o, { v: to, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 85%' }, onUpdate: () => { n.textContent = o.v.toFixed(d).replace('.', ','); } });
      });
      gsap.from(`.${styles.stamp}`, { scale: 1.6, opacity: 0, rotate: -20, duration: 0.7, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.contract}`, start: 'top 70%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="about" ref={root} className={`wrap ${styles.section}`}>
      <Manifest label={about.label} chunks={about.manifest} skies={['speed', 'manifest2']} />

      <div className={styles.grid}>
        {/* фото команды: пока коллаж из четырёх портретов, заменится общим снимком */}
        <figure className={`${styles.card} ${styles.team}`}>
          <div className={styles.collage}>
            {about.team.map((t) => { const p = services.people[t.key]; return <img key={t.key} src={asset(p.photo)} alt={p.name} loading="lazy" draggable={false} />; })}
          </div>
          <figcaption className={styles.teamCap}>
            <span>{about.teamCaption}</span>
            <ul>{about.team.map((t) => { const p = services.people[t.key]; return <li key={t.key}><Face src={p.face} name={p.name} size={28} />{p.name.split(' ')[0]}<small>{p.role}</small></li>; })}</ul>
          </figcaption>
        </figure>

        {/* договор: бумага, три обещания, печать */}
        <div className={`${styles.card} ${styles.contract}`}>
          <div className={styles.paper}>
            <span className={styles.paperHead}>{about.promisesLabel}</span>
            <ol>{about.promises.map((p, i) => <li key={p.t}><i className="num">{i + 1}.</i><span><b>{p.t}</b> {p.s}</span></li>)}</ol>
            <div className={styles.sign}><span className={styles.signLine} /><small>{about.quoteBy}</small></div>
            <span className={styles.stamp} aria-hidden><span>{about.stamp}</span></span>
          </div>
          <p className={styles.contractNote}>{about.contractNote}</p>
        </div>

        {/* цитата */}
        <figure className={`${styles.card} ${styles.quote}`}>
          <blockquote>{about.quote}</blockquote>
          <figcaption><Face src={andrey.face} name={andrey.name} size={44} ring="rgba(255,255,255,.35)" /><span>{about.quoteBy}<small>{andrey.role}</small></span></figcaption>
        </figure>

        {/* цифры */}
        {about.stats.map((s) => (
          <div key={s.label} className={`${styles.card} ${styles.stat}`}>
            <div className={styles.statWire}><Wire kind={WIRE[s.kind] ?? 'dots'} color="#1f2026" faded={0.35} speed={0.6} /></div>
            <div className={styles.statNum}><span className={`num ${styles.val}`} data-v={s.value} data-d={s.decimals ?? 0}>{String(s.value).replace('.', ',')}</span>{s.suffix}</div>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      <ul className={styles.partners}>{about.partners.map((p) => <li key={p}>{p}</li>)}</ul>
    </section>
  );
}
