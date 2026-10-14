import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { gallery } from '../../content/texts';
import { useMedia } from '../../lib/useMedia';
import { SwipeHint } from '../../ui/SwipeHint';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './WorkSphere.module.css';

/**
 * Сфера из мини-экранов (распределение Фибоначчи), CSS 3D без WebGL.
 * Крутится сама, от скролла (pin) и от перетаскивания. Плитки, повёрнутые
 * к зрителю лицом в центр, тают — так в сфере открывается окно под заголовок.
 */
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
// плитки: светлые креативы и сайты вперемешку с карточками в стиле сайта (белые и жёлтые)
type Tile = { img: string; ratio: number } | { card: 'yellow' | 'white'; big?: string; small?: string; pills?: string[]; bars?: number[]; ratio: number };
const SEQ: Tile[] = [
  { img: asset('creatives/c9.webp'), ratio: 0.9 },
  { card: 'yellow', big: '92 заявки', small: '7 договоров за первый месяц', ratio: 1.3 },
  { img: asset('creatives/c12.webp'), ratio: 16 / 10 },
  { img: asset('creatives/c8.webp'), ratio: 1 },
  { card: 'white', big: '1 240', small: 'запросов в месяц в вашем городе', bars: [30, 45, 40, 62, 58, 80, 100], ratio: 1.3 },
  { img: asset('creatives/c2.webp'), ratio: 16 / 9 },
  { img: asset('works/w4.webp'), ratio: 16 / 9 },
  { card: 'white', pills: ['Директ', 'Avito Ads', 'Квиз', 'Бот'], small: 'связка под нишу', ratio: 1 },
  { img: asset('creatives/c11.webp'), ratio: 1.12 },
  { img: asset('creatives/c3.webp'), ratio: 16 / 9 },
  { card: 'yellow', big: '2 дня', small: 'от брифа до первой заявки', ratio: 1 },
  { img: asset('creatives/c10.webp'), ratio: 0.8 },
  { img: asset('works/w2.webp'), ratio: 16 / 9 },
  { card: 'white', big: '9 из 10', small: 'запусков дают заявки в первый день', ratio: 1.3 },
];
const M = SEQ.length;
const RATIO = SEQ.map((t) => t.ratio);

export function WorkSphere() {
  const root = useRef<HTMLElement>(null);
  const globe = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLElement | null)[]>([]);
  const small = useMedia('(max-width: 768px)');
  const narrow = useMedia('(max-width: 900px)'); // на планшете и телефоне секция не пинится
  const reduced = useReducedMotion();
  // три размера шара: телефон (влезает целиком в 375px), планшет и десктоп
  const N = small ? 40 : narrow ? 44 : 56;
  const R = small ? 165 : narrow ? 300 : 470;
  const TILE = small ? 92 : narrow ? 120 : 168;
  const PERSP = small ? 1200 : narrow ? 1800 : 2600;

  // позиции на сфере
  const pos = Array.from({ length: N }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / N; // -1..1
    const phi = Math.asin(y); // широта
    const theta = Math.PI * (1 + Math.sqrt(5)) * i; // долгота
    return { lat: (phi * 180) / Math.PI, lon: ((theta * 180) / Math.PI) % 360 };
  });

  useEffect(() => {
    const g = globe.current!; const el = root.current!;
    const st = { rot: 0, vel: 0, drag: false, x: 0, scroll: 0, scrollTarget: 0, tilt: -12 };
    const hoverFine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prevF: string[] = new Array(N).fill(''), prevO: string[] = new Array(N).fill('');
    // прямоугольник заголовка: размываем только то, что его задевает
    let hw = 300, hh = 60;
    const measure = () => { const r = headRef.current?.getBoundingClientRect(); if (r) { hw = r.width / 2 + 24; hh = r.height / 2 + 20; } };
    measure();
    const ro = new ResizeObserver(measure); if (headRef.current) ro.observe(headRef.current);
    const paint = () => {
      const rot = st.rot + st.scroll;
      g.style.transform = `rotateX(${st.tilt}deg) rotateY(${rot}deg)`;
      const tr = (rot * Math.PI) / 180, tx = (st.tilt * Math.PI) / 180;
      for (let i = 0; i < N; i++) {
        const t = tiles.current[i]; if (!t) continue;
        const lat = (pos[i].lat * Math.PI) / 180, lon = (pos[i].lon * Math.PI) / 180;
        // нормаль плитки после поворотов сферы
        let x = Math.cos(lat) * Math.sin(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon);
        const x1 = x * Math.cos(tr) + z * Math.sin(tr), z1 = -x * Math.sin(tr) + z * Math.cos(tr); x = x1; z = z1;
        const y1 = y * Math.cos(tx) - z * Math.sin(tx), z2 = y * Math.sin(tx) + z * Math.cos(tx); y = y1; z = z2;
        if (z < -0.05) { t.style.visibility = 'hidden'; continue; }
        t.style.visibility = 'visible';
        // экранная позиция плитки с учётом перспективы
        const k = PERSP / (PERSP - z * R);
        const sx = x * R * k, sy = y * R * k;
        // пересечение плитки с прямоугольником заголовка (с мягким полем 48px)
        const tw = (TILE * k * (RATIO[i % M] < 1 ? 0.78 : 1)) / 2, th = tw / RATIO[i % M];
        const dx = Math.max(0, Math.abs(sx) - (hw + tw)), dy = Math.max(0, Math.abs(sy) - (hh + th));
        const gap = Math.max(dx, dy);
        const win = Math.max(0, Math.min(1, 1 - gap / 48));
        const edge = Math.max(0, Math.min(1, z / 0.25)); // края сферы мягко уходят
        const o = (1 - win) * (0.25 + 0.75 * edge);
        const os = o.toFixed(2); if (os !== prevO[i]) { t.style.opacity = os; prevO[i] = os; }
        const f = hoverFine && !small && win > 0.05 ? `blur(${Math.round(win * 6) * 2}px)` : 'none'; // шаг 2px: меньше перерисовок
        if (f !== prevF[i]) { t.style.filter = f; prevF[i] = f; }
        void y;
      }
    };
    paint();
    const ctx = gsap.context(() => {
      if (reduced) return;
      if (!narrow) ScrollTrigger.create({ trigger: el, start: 'top top', end: '+=110%', pin: true, anticipatePin: 1,
        onUpdate: (self) => { st.scrollTarget = self.progress * 70; } });
      gsap.from(`.${styles.head} > *`, { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 70%' } });
    }, el);
    let raf = 0, last = 0, running = true;
    const tick = (now: number) => {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now;
      if (!st.drag) { if (Math.abs(st.vel) > 0.5) { st.rot += st.vel * dt; st.vel *= 0.94; } else st.rot += 4 * dt; }
      st.scroll += (st.scrollTarget - st.scroll) * Math.min(1, dt * 4); // мягкий догон за скроллом
      paint(); raf = requestAnimationFrame(tick);
    };
    if (!reduced) raf = requestAnimationFrame(tick);
    const down = (e: PointerEvent) => { st.drag = true; st.x = e.clientX; st.vel = 0; el.setPointerCapture?.(e.pointerId); };
    const move = (e: PointerEvent) => { if (!st.drag) return; const d = (e.clientX - st.x) * 0.25; st.x = e.clientX; st.rot += d; st.vel = d * 60; };
    const up = () => { st.drag = false; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); ctx.revert(); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, [N, R, PERSP, reduced, small, narrow]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="gallery" ref={root} className={styles.section} aria-label={gallery.sub}>
      <div className={styles.frame}>
      <div className={styles.stage} style={{ perspective: PERSP }}>
        <div ref={globe} className={styles.globe}>
          {pos.map((p, i) => (
            <div key={i} ref={(n) => { tiles.current[i] = n; }} className={styles.tile}
              style={{ width: TILE * (RATIO[i % M] < 1 ? 0.78 : 1), height: (TILE * (RATIO[i % M] < 1 ? 0.78 : 1)) / RATIO[i % M], marginLeft: -(TILE * (RATIO[i % M] < 1 ? 0.78 : 1)) / 2, marginTop: -((TILE * (RATIO[i % M] < 1 ? 0.78 : 1)) / RATIO[i % M]) / 2,
                transform: `rotateY(${p.lon}deg) rotateX(${-p.lat}deg) translateZ(${R}px)` }}>
              {(() => { const t = SEQ[i % M]; if ('img' in t) return <img className={styles.img} src={t.img} alt="" loading="lazy" draggable={false} />;
                return (
                  <div className={`${styles.cardTile} ${t.card === 'yellow' ? styles.cardYellow : ''}`} style={{ fontSize: TILE * 0.075 }}>
                    {t.pills && <div className={styles.pills}>{t.pills.map((x) => <span key={x}>{x}</span>)}</div>}
                    {t.big && <b className={styles.big}>{t.big}</b>}
                    {t.bars && <div className={styles.bars}>{t.bars.map((h, k) => <i key={k} style={{ height: `${h}%` }} />)}</div>}
                    {t.small && <span className={styles.small}>{t.small}</span>}
                  </div>
                ); })()}
            </div>
          ))}
        </div>
      </div>
      <div ref={headRef} className={styles.head}>
        <SwipeHint onDark text="Потяните, чтобы покрутить" className={styles.hint} />
        <h2 className={`display ${styles.h2}`}>{gallery.title}<br /><span className={styles.tail}>{gallery.titleTail}</span></h2>
      </div>
      </div>
    </section>
  );
}
