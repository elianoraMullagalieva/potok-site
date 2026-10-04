import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { gallery } from '../../content/texts';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './WorkSphere.module.css';

/**
 * Сфера из мини-экранов (распределение Фибоначчи), CSS 3D без WebGL.
 * Крутится сама, от скролла (pin) и от перетаскивания. Плитки, повёрнутые
 * к зрителю лицом в центр, тают — так в сфере открывается окно под заголовок.
 */
const IMAGES = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].map((n) => `${import.meta.env.BASE_URL}creatives/${n}.webp`);
const PORTRAIT = new Set([6]); // седьмой креатив вертикальный

export function WorkSphere() {
  const root = useRef<HTMLElement>(null);
  const globe = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLElement | null)[]>([]);
  const small = useMedia('(max-width: 768px)');
  const reduced = useReducedMotion();
  const N = small ? 28 : 56;
  // шар во весь экран: радиус от высоты окна, спереди плитки крупнее за счёт перспективы
  const R = small ? 230 : 470;
  const TILE = small ? 104 : 168;
  const PERSP = small ? 1400 : 2600;

  // позиции на сфере
  const pos = Array.from({ length: N }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / N; // -1..1
    const phi = Math.asin(y); // широта
    const theta = Math.PI * (1 + Math.sqrt(5)) * i; // долгота
    return { lat: (phi * 180) / Math.PI, lon: ((theta * 180) / Math.PI) % 360 };
  });

  useEffect(() => {
    const g = globe.current!; const el = root.current!;
    const st = { rot: 0, vel: 0, drag: false, x: 0, scroll: 0, tilt: -12 };
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
        // окно под текст: эллипс в центре экрана, внутри него плитки растворяются полностью
        const d = Math.hypot(sx / 430, sy / 230);
        const win = Math.max(0, Math.min(1, (1.15 - d) / 0.35));
        const edge = Math.max(0, Math.min(1, z / 0.25)); // края сферы мягко уходят
        const o = (1 - win) * (0.25 + 0.75 * edge);
        t.style.opacity = o.toFixed(3);
        t.style.filter = win > 0.05 ? `blur(${(win * 12).toFixed(1)}px)` : 'none';
        void y;
      }
    };
    paint();
    const ctx = gsap.context(() => {
      if (reduced) return;
      ScrollTrigger.create({ trigger: el, start: 'top top', end: '+=140%', pin: true, scrub: 0.8,
        onUpdate: (self) => { st.scroll = self.progress * 160; } });
      gsap.from(`.${styles.head} > *`, { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 70%' } });
    }, el);
    let raf = 0, last = 0, running = true;
    const tick = (now: number) => {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now;
      if (!st.drag) { if (Math.abs(st.vel) > 0.5) { st.rot += st.vel * dt; st.vel *= 0.94; } else st.rot += 4 * dt; }
      paint(); raf = requestAnimationFrame(tick);
    };
    if (!reduced) raf = requestAnimationFrame(tick);
    const down = (e: PointerEvent) => { st.drag = true; st.x = e.clientX; st.vel = 0; el.setPointerCapture?.(e.pointerId); };
    const move = (e: PointerEvent) => { if (!st.drag) return; const d = (e.clientX - st.x) * 0.25; st.x = e.clientX; st.rot += d; st.vel = d * 60; };
    const up = () => { st.drag = false; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    ScrollTrigger.refresh();
    return () => { running = false; cancelAnimationFrame(raf); ctx.revert(); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, [N, R, PERSP, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="gallery" ref={root} className={styles.section}>
      <div className={styles.stage} style={{ perspective: PERSP }}>
        <div ref={globe} className={styles.globe}>
          {pos.map((p, i) => (
            <div key={i} ref={(n) => { tiles.current[i] = n; }} className={styles.tile}
              style={{ width: TILE, height: PORTRAIT.has(i % 7) ? TILE * 0.9 : TILE * 0.5625, marginLeft: -TILE / 2, marginTop: PORTRAIT.has(i % 7) ? -TILE * 0.45 : -TILE * 0.28,
                transform: `rotateY(${p.lon}deg) rotateX(${-p.lat}deg) translateZ(${R}px)` }}>
              <img className={styles.img} src={IMAGES[i % 7]} alt={gallery.captions[i % gallery.captions.length]} loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.head}>
        <h2 className={`display ${styles.h2}`}>{gallery.title}<br /><span className={styles.tail}>{gallery.titleTail}</span></h2>
      </div>
    </section>
  );
}
