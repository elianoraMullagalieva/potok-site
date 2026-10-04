import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from '../../lib/lenis';
import { hero } from '../../content/texts';
import { Sky } from '../../ui/Sky';
import { Nav } from '../../ui/Nav';
import { Button } from '../../ui/Button';
import { benefits } from '../../content/texts';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { SkyRing } from '../../ui/SkyRing';
import { useMedia } from '../../lib/useMedia';
import styles from './Hero.module.css';


export function Hero({ renderCard, delay = 0 }: { renderCard?: (i: number) => ReactNode; delay?: number } = {}) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const small = useMedia('(max-width: 768px)');

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay });
      tl.from(`.${styles.frame}`, { scale: 0.96, borderRadius: 60, duration: 1.4 }, 0)
        .from(`.${styles.word}`, { yPercent: 110, opacity: 0, filter: 'blur(8px)', duration: 1.1, stagger: 0.05 }, 0.25)
        .from(`.${styles.sub}, .${styles.actions}, .${styles.under}`, { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.7)
        .from(`.${styles.stage}`, { y: 140, opacity: 0, scale: 0.92, duration: 1.8 }, 0.55)
        // выделение слова «первого», как текст на телефоне
        .fromTo(`.${styles.selBg}`, { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 1.5)
        .fromTo(`.${styles.selHandle}`, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, 1.7)
        .to(`.${styles.selBg}, .${styles.selHandle}`, { opacity: 0, duration: 0.5 }, 3.1)
        .from(`.${styles.facts} > *`, { y: 12, opacity: 0, duration: 0.8, stagger: 0.08 }, 1.3)
        .from(`header`, { y: -16, opacity: 0, duration: 1 }, 0.4);
    }, el);

    return () => { ctx.revert(); };
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
          {/* 5 карточек × 3 = кольцо из 15: спереди читаются пять, края тают в небе */}
          <SkyRing
            count={15}
            cardWidth={small ? 160 : 228} cardHeight={small ? 204 : 268} gap={small ? 14 : 30}
            speed={2.2} clearArc={46} haze={12}
            cardClassName={styles.card}
            render={(i) => (renderCard ? renderCard(i % 5) : <CardContent i={i % 5} />)}
          />
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
            {hero.niches.map((n, k) => <span key={n} className={`${styles.chip} ${styles.pop} ${k === 0 ? styles.chipOn : ''}`} style={{ animationDelay: `${0.3 + k * 0.12}s` }}>{n}</span>)}
          </div>
          <div className={styles.chipsBottom}>
            {hero.channels.map((n, k) => <span key={n} className={`${styles.chip} ${styles.chipDark} ${styles.pop}`} style={{ animationDelay: `${1.0 + k * 0.12}s` }}><i className={styles.chipDot} />{n}</span>)}
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
    case 2: // уведомление как на iPhone
      return (
        <div className={`${styles.inner} ${styles.glass} ${styles.notifWrap}`}>
          <Notif />
          <p className={styles.notifUnder}>{hero.card.under}</p>
        </div>
      );
    case 3: // тёмная: трое + главная мысль
      return (
        <div className={`${styles.inner} ${styles.dark}`}>
          <Head label="Поток" />
          <Avatars />
          <p className={styles.idea}>
            <span>{hero.mainIdea[0]}</span> <span className={styles.ideaMute}>{hero.mainIdea[1]}</span>
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

/* Уведомление iPhone: иконка приложения, имя, время, заголовок, текст. Прилетает сверху и повторяется */
export function Notif() {
  return (
    <div className={styles.notif}>
      <span className={styles.appIcon} aria-hidden><b>a</b></span>
      <div className={styles.notifBody}>
        <div className={styles.notifHead}><span className={styles.appName}>{hero.card.app}</span><span className={`num ${styles.notifTime}`}>{hero.card.time}</span></div>
        <div className={styles.notifTitle}>{hero.card.label}</div>
        <div className={styles.notifText}>{hero.card.text}</div>
      </div>
    </div>
  );
}

/* Трое: три кружка под будущие фото, пока инициалы */
export function Avatars({ className }: { className?: string }) {
  return (
    <div className={`${styles.avatars} ${className ?? ''}`} aria-hidden>
      {benefits.team.map((t, k) => <span key={t.initials} className={styles.avatar} style={{ animationDelay: `${0.4 + k * 0.15}s` }}>{t.initials}</span>)}
    </div>
  );
}

/* 10 сегментов: 9 заполнены — читается мгновенно */
export function Segments({ total, filled }: { total: number; filled: number }) {
  return (
    <div className={styles.segs} aria-hidden>
      {Array.from({ length: total }, (_, k) => <i key={k} className={k < filled ? styles.segOn : styles.segOff} style={{ animationDelay: `${k * 0.14}s` }} />)}
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
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink)" strokeWidth="0.7" strokeOpacity=".16" /></pattern>
        <pattern id="dots" width="16" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="var(--mute-2)" /></pattern>
        <linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id="hm"><rect x="0" y="0" width={w} height={h} fill="url(#hf)" /></mask>
      </defs>
      <rect x="0" y="0" width={w} height={h} fill="url(#dots)" />
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#hatch)" mask="url(#hm)" />
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" className={styles.areaLine} />
      <circle cx={ex} cy={ey} r="9" fill="var(--yellow)" opacity=".35" className={styles.pulse} />
      <circle cx={ex} cy={ey} r="4" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}
