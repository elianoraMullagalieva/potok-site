import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/lenis';
import { services } from '../../content/texts';
import { Tag } from '../../ui/Tag';
import { LogoMark } from '../../ui/Logo';
import { SwipeHint } from '../../ui/SwipeHint';
import { Button } from '../../ui/Button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Services.module.css';

const photo = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export function Services() {
  const root = useRef<HTMLElement>(null);
  const detail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.h2} .${styles.line}`, { yPercent: 100, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: `.${styles.h2}`, start: 'top 80%' } });
      gsap.from(`.${styles.item}`, { opacity: 0, scale: 0.96, duration: 1.0, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: `.${styles.row}`, start: 'top 85%' } });
      gsap.from(`.${styles.detail}`, { opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.detail}`, start: 'top 90%' } });
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
      <div className={styles.mark} aria-hidden><LogoMark size={26} /></div>
      <h2 className={`display ${styles.h2}`}>
        <span className={styles.mask}><span className={styles.line}>{services.title}</span></span>
        <span className={styles.mask}><span className={`${styles.line} ${styles.tail}`}>{services.titleTail}</span></span>
      </h2>

      {/* превью: пять клавиш */}
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
              <img className={styles.photo} src={photo(services.people[it.lead].photo)} alt={services.people[it.lead].name} loading="lazy" draggable={false} />
              <div className={styles.shade} aria-hidden />
              <h3 className={styles.title}>{it.title}</h3>
            </div>
          );
        })}
      </div>

      {/* раскрытая карточка: всегда открыта, по умолчанию первая */}
      <div ref={detail} className={styles.detail}>
        <div className={styles.dLeft}>
          <span className={`label mute ${styles.swap}`}>{s.n} · {services.label}</span>
          <h3 className={`${styles.dTitle} ${styles.swap}`}>{s.title}</h3>
          <p className={`${styles.dLine} ${styles.swap}`}>{s.line}</p>
          <figure className={`${styles.dQuote} ${styles.swap}`}>
            <blockquote>«{s.quote}»</blockquote>
            <figcaption><img src={photo(person.face)} alt="" /><span>{person.name}</span></figcaption>
          </figure>
          <Button variant="primary" arrow className={styles.dCta} href="#quiz">{services.cta}</Button>
        </div>
        <div className={styles.dVisual}>
          <img key={person.photo} className={`${styles.dPhoto} ${styles.swap}`} src={photo(person.photo)} alt={person.name} />
        </div>
        <div className={styles.dRight}>
          <div className={styles.swap}>
            <span className="label mute">{services.fitLabel}</span>
            <p className={styles.dFit}>{s.fit}</p>
          </div>
          <div className={`${styles.dLead} ${styles.swap}`}>
            <span className="label mute">{services.leadLabel}</span>
            <div className={styles.person}>
              <img className={styles.ava} src={photo(person.face)} alt="" />
              <div>
                <div className={styles.pName}>{person.name}</div>
                <div className={styles.pRole}>{person.role}</div>
              </div>
            </div>
            <p className={styles.pExp}>{person.exp}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
