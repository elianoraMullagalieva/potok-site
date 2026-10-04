import { useEffect, useRef, type ReactNode } from 'react';
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

export function Hero({ renderCard, delay = 0 }: { renderCard?: (i: number) => ReactNode; delay?: number } = {}) {
  const root = useRef<HTMLElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay });
      tl.from(`.${styles.frame}`, { scale: 0.96, borderRadius: 60, duration: 1.4 }, 0)
        .from(`.${styles.word}`, { yPercent: 110, opacity: 0, filter: 'blur(8px)', duration: 1.1, stagger: 0.05 }, 0.25)
        .from(`.${styles.sub}, .${styles.actions}, .${styles.under}`, { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.7)
        .from(`.${styles.card}`, { y: 160, opacity: 0, rotateX: -55, rotateZ: () => gsap.utils.random(-10, 10), duration: 1.5, ease: 'back.out(1.2)', stagger: { each: 0.09, from: 'center' } }, 0.55)
        // выделение слова «первого», как текст на телефоне
        .fromTo(`.${styles.selBg}`, { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 1.5)
        .fromTo(`.${styles.selHandle}`, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, 1.7)
        .to(`.${styles.selBg}, .${styles.selHandle}`, { opacity: 0, duration: 0.5 }, 3.1)
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
  }, [reduced, delay]);

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
            <span className={styles.line}>{words.map((w, i) => (
              <span key={i} className={styles.mask}>
                <span className={`${styles.word} ${w === 'первого' ? styles.sel : ''}`}>
                  {w === 'первого' && <><i className={styles.selBg} /><i className={`${styles.selHandle} ${styles.selL}`} /><i className={`${styles.selHandle} ${styles.selR}`} /></>}
                  {w}
                </span>
              </span>
            ))}</span>
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
                {renderCard ? renderCard(i) : <CardContent i={i} />}
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

function Head({ label, trend = false }: { label: string; trend?: boolean }) {
  return (
    <div className={styles.head}>
      <span className="label">{label}</span>
      {trend && (
        <span className={styles.trend} aria-hidden>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9 9 1M3 1h6v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      )}
    </div>
  );
}

function CardContent({ i }: { i: number }) {
  switch (i) {
    case 0: // ниши + каналы
      return (
        <div className={`${styles.inner} ${styles.white}`}>
          <Head label="Ниша" />
          <div className={styles.chips}>
            {hero.niches.map((n, k) => <span key={n} className={`${styles.chip} ${k === 0 ? styles.chipOn : ''}`}>{n}</span>)}
          </div>
          <div className={styles.chipsBottom}>
            {hero.channels.map((n) => <span key={n} className={`${styles.chip} ${styles.chipDark}`}><i className={styles.chipDot} />{n}</span>)}
          </div>
        </div>
      );
    case 1: // 9 из 10
      return (
        <div className={`${styles.inner} ${styles.white}`}>
          <Head label="Запуски" trend />
          <div>
            <div className={`num ${styles.big}`}>9 <span className={styles.bigMute}>из 10</span></div>
            <Segments total={10} filled={9} />
            <p className={styles.caption}>запусков — заявки в 1-й день</p>
          </div>
        </div>
      );
    case 2: // стеклянная карточка заявки
      return (
        <div className={`${styles.inner} ${styles.glass}`}>
          <span className={styles.bell}><Dot /></span>
          <div>
            <div className={styles.cardHead}><span className="label">{hero.card.label}</span><span className={`label num ${styles.time}`}>{hero.card.time}</span></div>
            <p className={styles.cardText}>{hero.card.text}</p>
          </div>
        </div>
      );
    case 3: // тёмная с главной мыслью
      return (
        <div className={`${styles.inner} ${styles.dark}`}>
          <Head label="Поток" />
          <p className={styles.idea}>
            <span>{hero.mainIdea[0]}</span> <i className={styles.spark} aria-hidden /> <span className={styles.ideaMute}>{hero.mainIdea[1]}</span> <span>{hero.mainIdea[2]}</span>
          </p>
        </div>
      );
    default: // бюджет + график
      return (
        <div className={`${styles.inner} ${styles.white}`}>
          <Head label="Бюджет на рекламу" trend />
          <div>
            <div className={`num ${styles.big}`}>от 2 000 ₽</div>
            <p className={styles.caption}>в день</p>
          </div>
          <Area />
        </div>
      );
  }
}

/* 10 сегментов: 9 заполнены — читается мгновенно */
function Segments({ total, filled }: { total: number; filled: number }) {
  return (
    <div className={styles.segs} aria-hidden>
      {Array.from({ length: total }, (_, k) => <i key={k} className={k < filled ? styles.segOn : styles.segOff} />)}
    </div>
  );
}

/* Плавная кривая с жёлтой заливкой, точечная сетка, маркер на конце */
function Area() {
  const pts = [10, 13, 12, 18, 17, 24, 23, 30, 29, 38, 37, 46];
  const w = 160, h = 60, step = w / (pts.length - 1);
  const P = pts.map((p, i) => [i * step, h - p] as const);
  let d = `M${P[0][0]},${P[0][1]}`;
  for (let k = 1; k < P.length; k++) {
    const [x0, y0] = P[k - 1], [x1, y1] = P[k], cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  const [ex, ey] = P[P.length - 1];
  return (
    <svg className={styles.area} viewBox={`-2 -6 ${w + 8} ${h + 14}`} aria-hidden>
      <defs>
        <linearGradient id="af" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--yellow)" stopOpacity=".9" /><stop offset="1" stopColor="var(--yellow)" stopOpacity="0" /></linearGradient>
        <pattern id="dots" width="16" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="var(--mute-2)" /></pattern>
      </defs>
      <rect x="0" y="0" width={w} height={h} fill="url(#dots)" />
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#af)" />
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="4.5" fill="var(--ink)" /><circle cx={ex} cy={ey} r="2" fill="var(--yellow)" />
    </svg>
  );
}
