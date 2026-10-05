import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { benefits } from '../../content/texts';
import { SkyStatic } from '../../ui/Sky';
import { Wire, type WireKind } from '../../ui/Wire';
import { Tag } from '../../ui/Tag';
import { useReducedMotion } from '../../lib/useReducedMotion';
import b from './Benefits.module.css';
import v from './BenefitsV2.module.css';

/* V2 по референсу «How we manage your network»: тонкая сетка, белые карточки, проволочные объекты */
const OBJ: Record<string, { kind: WireKind; accent?: string }> = {
  'Связки': { kind: 'poly', accent: '#ffe14d' },        // связка: узлы и рёбра, сигнал бежит по сети
  'Скорость': { kind: 'coil', accent: undefined },      // поток: кольца одно за другим
  'Прозрачность': { kind: 'wave' , accent: '#ffe14d' },  // прозрачная сетка, подсвечена целевая ячейка
  'Команда': { kind: 'rings', accent: '#ffe14d' },      // три кольца в одном узле
};

export function BenefitsV2() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${b.w}`, { opacity: 0.18 }, { opacity: 1, stagger: 0.04, ease: 'none',
        scrollTrigger: { trigger: `.${b.manifest}`, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
      gsap.from(`.${v.card}`, { y: 70, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: `.${v.cards}`, start: 'top 80%' } });
      gsap.from(`.${v.vline}`, { scaleY: 0, duration: 1.6, ease: 'expo.out', stagger: 0.06, transformOrigin: 'top',
        scrollTrigger: { trigger: root.current, start: 'top 70%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="benefits" ref={root} className={v.section}>
      <div className={v.grid} aria-hidden>{Array.from({ length: 5 }, (_, i) => <i key={i} className={v.vline} />)}</div>
      <div className={`wrap ${v.inner}`}>
        <div className={b.head}><span className="label mute">{benefits.label}</span></div>
        <h2 className={`display ${b.manifest}`}>
          {benefits.manifest.map((chunk, i) =>
            chunk === '▬'
              ? <span key={i} className={b.capsule} aria-hidden><SkyStatic id={i === 1 ? 'manifest1' : 'manifest2'} /></span>
              : chunk.split(' ').map((w, j) => <span key={`${i}-${j}`} className={`${b.w} ${i >= 2 ? b.wMute : ''}`}>{w}</span>),
          )}
        </h2>

        <div className={v.cards}>
          {benefits.cards.map((c, i) => (
            <article key={c.tag} className={v.card}>
              <div className={v.obj}><Wire kind={OBJ[c.tag].kind} accent={OBJ[c.tag].accent} stroke={1} speed={0.9 + i * 0.1} /></div>
              <div className={v.body}>
                <Tag>{c.tag}</Tag>
                <h3 className={v.title}>{c.title}</h3>
                <p className={v.text}>{c.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className={v.fade} aria-hidden />
    </section>
  );
}
