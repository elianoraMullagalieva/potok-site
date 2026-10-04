import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { hero } from '../../content/texts';
import { Sky } from '../../ui/Sky';
import { Nav } from '../../ui/Nav';
import { Button } from '../../ui/Button';
import { Dot } from '../../ui/Tag';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { LERP } from '../../tokens/motion';
import styles from './Hero.module.css';

/* Веер карточек: угол и глубина от центра, как у референса */
const DECK = [
  { rot: 34, z: -70, y: 22 },
  { rot: 17, z: -24, y: 8 },
  { rot: 0, z: 0, y: 0 },
  { rot: -17, z: -24, y: 8 },
  { rot: -34, z: -70, y: 22 },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from(`.${styles.frame}`, { scale: 0.96, borderRadius: 60, duration: 1.4 }, 0)
        .from(`.${styles.word}`, { yPercent: 110, opacity: 0, filter: 'blur(8px)', duration: 1.1, stagger: 0.05 }, 0.25)
        .from(`.${styles.sub}, .${styles.actions}, .${styles.under}`, { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.7)
        .from(`.${styles.card}`, { y: 120, opacity: 0, rotateX: -12, duration: 1.4, stagger: { each: 0.08, from: 'center' } }, 0.55)
        .from(`.${styles.facts} > *`, { y: 12, opacity: 0, duration: 0.8, stagger: 0.08 }, 1.3)
        .from(`header`, { y: -16, opacity: 0, duration: 1 }, 0.4);
    }, el);

    // параллакс веера за курсором: lerp, без дёрганья
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const tick = () => {
      cx += (tx - cx) * LERP.cursor; cy += (ty - cy) * LERP.cursor;
      if (deck.current) deck.current.style.transform = `rotateY(${cx * 4}deg) rotateX(${-cy * 2.5}deg)`;
      raf = requestAnimationFrame(tick);
    };
    if (!reduced && matchMedia('(pointer:fine)').matches) { el.addEventListener('pointermove', onMove); raf = requestAnimationFrame(tick); }
    return () => { ctx.revert(); el.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, [reduced]);

  const words = hero.title.split(' ');
  const tail = hero.titleTail.split(' ');

  return (
    <section ref={root} className={styles.hero}>
      <div className={styles.frame}>
        <Sky seed={1.7} />
        <div className={styles.shade} />
        <Nav onDark />

        <div className={styles.center}>
          <h1 className={`display ${styles.h1}`}>
            <span className={styles.line}>{words.map((w, i) => <span key={i} className={styles.mask}><span className={styles.word}>{w}</span></span>)}</span>
            <span className={`${styles.line} ${styles.tail}`}>{tail.map((w, i) => <span key={i} className={styles.mask}><span className={styles.word}>{w}</span></span>)}</span>
          </h1>
          <p className={styles.sub}>{hero.sub}</p>
          <div className={styles.actions}>
            <Button variant="glass">{hero.secondary}</Button>
            <Button variant="primary" arrow>{hero.cta}</Button>
          </div>
          <p className={`label ${styles.under}`}>{hero.underCta}</p>
        </div>

        <div className={styles.stage}>
          <div ref={deck} className={styles.deck}>
            {DECK.map((d, i) => (
              <div key={i} className={styles.card} style={{ transform: `translateY(${d.y}px) rotateY(${d.rot}deg) translateZ(${d.z}px)` }}>
                <CardContent i={i} />
              </div>
            ))}
          </div>
        </div>

        <ul className={styles.facts}>
          {hero.facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>
    </section>
  );
}

function CardContent({ i }: { i: number }) {
  switch (i) {
    case 0: // ниши + каналы
      return (
        <div className={`${styles.inner} ${styles.white}`}>
          <span className="label mute">Ниша</span>
          <div className={styles.chips}>{hero.niches.map((n) => <span key={n} className={styles.chip}>{n}</span>)}</div>
          <div className={styles.chipsBottom}>{hero.channels.map((n) => <span key={n} className={`${styles.chip} ${styles.chipDark}`}>{n}</span>)}</div>
        </div>
      );
    case 1: // 9 из 10 + донат
      return (
        <div className={`${styles.inner} ${styles.white}`}>
          <Ring value={0.9} />
          <div>
            <div className={`num ${styles.big}`}>9 из 10</div>
            <p className={styles.caption}>запусков — заявки в 1-й день</p>
          </div>
        </div>
      );
    case 2: // стеклянная карточка заявки
      return (
        <div className={`${styles.inner} ${styles.glass}`}>
          <span className={styles.bell}><Dot /></span>
          <div>
            <div className={styles.cardHead}><span>{hero.card.label}</span><span className={`num ${styles.time}`}>{hero.card.time}</span></div>
            <p className={styles.cardText}>{hero.card.text}</p>
          </div>
        </div>
      );
    case 3: // тёмная с главной мыслью
      return (
        <div className={`${styles.inner} ${styles.dark}`}>
          <p className={styles.idea}>
            <span>{hero.mainIdea[0]}</span> <span className={styles.ideaMute}>{hero.mainIdea[1]}</span> <span>{hero.mainIdea[2]}</span>
          </p>
        </div>
      );
    default: // бюджет + график
      return (
        <div className={`${styles.inner} ${styles.white}`}>
          <div>
            <div className={`num ${styles.big}`}>от 2 000 ₽</div>
            <p className={styles.caption}>в день</p>
          </div>
          <Area />
        </div>
      );
  }
}

function Ring({ value }: { value: number }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg className={styles.ring} width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`} transform="rotate(-90 32 32)" />
    </svg>
  );
}
function Area() {
  const pts = [8, 14, 11, 20, 18, 28, 26, 36, 34, 44];
  const w = 150, h = 56, step = w / (pts.length - 1);
  const line = pts.map((p, i) => `${i * step},${h - p}`).join(' ');
  return (
    <svg className={styles.area} viewBox={`0 0 ${w} ${h + 10}`} aria-hidden>
      <polygon points={`0,${h} ${line} ${w},${h}`} fill="var(--ink)" opacity="0.06" />
      <polyline points={line} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((_, i) => <circle key={i} cx={i * step} cy={h + 6} r="1" fill="var(--mute-2)" />)}
    </svg>
  );
}
