import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/lenis';
import { services } from '../../content/texts';
import { Tag } from '../../ui/Tag';
import { Manifest } from '../../ui/Manifest';
import { SwipeHint } from '../../ui/SwipeHint';
import { Button } from '../../ui/Button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Services.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/* Услуги: четыре зоны ответственности, у каждой свой человек.
   Сверху — четыре клавиши с фото, снизу — раскрытая карточка, где исполнитель говорит от первого лица. */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const detail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.item}`, { opacity: 0, scale: 0.96, duration: 1.0, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: `.${styles.row}`, start: 'top 85%' } });
      gsap.from(`.${styles.detail}`, { opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.detail}`, start: 'top 90%' } });
      // реплики клиентов всплывают по очереди, как сообщения
      gsap.from(`.${styles.says} li`, { y: 14, opacity: 0, scale: 0.97, duration: 0.7, ease: 'expo.out', stagger: 0.35, scrollTrigger: { trigger: `.${styles.says}`, start: 'top 85%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // смена услуги: содержимое карточки мягко перетекает
  const busy = useRef(false);
  const pick = (i: number) => {
    if (i === active || busy.current) return;
    if (reduced || !detail.current) { setActive(i); return; }
    busy.current = true;
    gsap.to(`.${styles.swap}`, { y: -10, opacity: 0, duration: 0.2, ease: 'power2.in', overwrite: true, onComplete: () => {
      setActive(i);
      requestAnimationFrame(() => gsap.fromTo(`.${styles.swap}`, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, overwrite: true, onComplete: () => { busy.current = false; } }));
    } });
  };

  const s = services.items[active];
  const person = services.people[s.lead];

  return (
    <section id="services" ref={root} className={`wrap ${styles.section}`}>
      <Manifest label={services.label} chunks={services.manifest} accent="last" />

      {/* превью: четыре клавиши */}
      <SwipeHint className={styles.hint} />
      <div className={styles.row} role="tablist" aria-label={services.label}>
        {services.items.map((it, i) => {
          const on = i === active;
          return (
            <div key={it.n} role="tab" aria-selected={on} tabIndex={0} className={`${styles.item} ${on ? styles.on : ''}`}
              onClick={() => pick(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } }}>
              <div className={styles.top}>
                <Tag onDark>{it.lead}</Tag>
                <span className={`num ${styles.key}`}>{it.n}</span>
              </div>
              <img className={styles.photo} src={asset(services.people[it.lead].photo)} alt={services.people[it.lead].name} loading="lazy" draggable={false} />
              <div className={styles.shade} aria-hidden />
              <h3 className={styles.title}>{it.title}</h3>
            </div>
          );
        })}
      </div>

      {/* раскрытая карточка: человек говорит от первого лица */}
      <div ref={detail} className={styles.detail}>
        <div className={styles.dLeft}>
          <span className={`label mute ${styles.swap}`}>{s.n} · {s.zone}</span>
          <h3 className={`${styles.dTitle} ${styles.swap}`}>{s.hello}</h3>
          <div className={`${styles.will} ${styles.swap}`}>
            <span className="label mute">{services.willLabel}</span>
            <ol className="steplist">
              {s.will.map((w, k) => <li key={w}><i className="num">{k + 1}</i><span>{w}</span></li>)}
            </ol>
          </div>
          <p className={`${styles.stat} ${styles.swap}`}><b className="num">{s.stat.big}</b><span>{s.stat.text}</span></p>
          <Button variant="primary" arrow className={styles.dCta} href="#quiz">{services.cta}</Button>
        </div>

        <div className={`${styles.dVisual} ${styles.swap}`}>
          <img key={person.photo} className={styles.dPhoto} src={asset(person.photo)} alt={person.name} />
          <div className={styles.who}>
            <div className={styles.pName}>{person.name}</div>
            <div className={styles.pRole}>{person.role} · {person.exp.split('.')[0]}</div>
          </div>
        </div>

        <div className={styles.dRight}>
          <div className={`${styles.shots} ${styles.swap}`} aria-hidden>
            {s.shots.map((sh, k) => (
              <span key={sh} className={`${styles.shot} ${k === 1 ? styles.shotBack : ''}`}>
                <img src={asset(`gifts/v3/${sh}.jpg`)} alt="" loading="lazy" draggable={false} />
              </span>
            ))}
          </div>
          <div className={`${styles.says} ${styles.swap}`}>
            <span className="label mute">{services.saysLabel}</span>
            <ul>
              {s.says.map((q, k) => <li key={q} data-time={['10:42', '16:05'][k]}>{q}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
