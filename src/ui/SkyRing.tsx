import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';

/**
 * Кольцо карточек в небе. Карточки стоят по окружности лицом к центру,
 * кольцо еле заметно плывёт; к краям дуги карточки теряют плотность и резкость,
 * растворяясь в фоне, а не обрываясь линией. Задняя половина не рисуется.
 * Радиус считается через синус: gap — настоящие пиксели между соседями.
 */
type Props = {
  count: number;
  render: (i: number) => ReactNode;
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  speed?: number;      // градусов в секунду
  breath?: number;     // дыхание скорости 0…0.3
  clearArc?: number;   // до этого угла карточка чёткая
  haze?: number;       // максимальное размытие на краю, px
  tilt?: number;
  perspective?: number;
  draggable?: boolean;
  cardClassName?: string;
  className?: string;
  style?: CSSProperties;
};

export function SkyRing({
  count, render, cardWidth = 200, cardHeight = 260, gap = 26, speed = 2.6, breath = 0.2,
  clearArc = 30, haze = 10, tilt = -4, perspective = 2200, draggable = true, cardClassName, className, style,
}: Props) {
  const arcRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const rot = useRef(0), vel = useRef(0), last = useRef(0), raf = useRef(0);
  const grab = useRef({ on: false, x: 0 });
  const reduced = useReducedMotion();

  const step = 360 / Math.max(count, 1);
  const R = Math.round((cardWidth + gap) / (2 * Math.sin(Math.PI / Math.max(count, 2))));

  useEffect(() => {
    const arc = arcRef.current; if (!arc) return;
    const paint = () => {
      arc.style.transform = `translateZ(${-R}px) rotateY(${rot.current}deg)`;
      for (let i = 0; i < count; i++) {
        const el = cards.current[i]; if (!el) continue;
        let facing = (rot.current + i * step) % 360; if (facing < 0) facing += 360;
        const turn = facing > 180 ? 360 - facing : facing;
        if (turn > 92) { el.style.visibility = 'hidden'; continue; }
        el.style.visibility = 'visible';
        const fade = Math.min(1, Math.max(0, (turn - clearArc) / (92 - clearArc)));
        const soft = fade * fade * (3 - 2 * fade);
        const sink = soft * soft;
        el.style.opacity = String(1 - sink * 0.98);
        el.style.filter = soft > 0.02 ? `blur(${(soft * haze).toFixed(1)}px)` : 'none';
        // анимации внутри карточки идут только в резкой зоне; при входе они стартуют заново
        const live = soft < 0.02;
        if (live !== el.hasAttribute('data-live')) el.toggleAttribute('data-live', live);
        el.style.transform = `rotateY(${i * step}deg) translateZ(${R - soft * 50}px)`;
      }
    };
    paint();
    if (reduced) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) last.current = 0; });
    io.observe(arc);
    const tick = (now: number) => {
      if (!visible) { raf.current = requestAnimationFrame(tick); return; }
      const dt = last.current ? Math.min((now - last.current) / 1000, 0.1) : 0; last.current = now;
      if (!grab.current.on) {
        if (Math.abs(vel.current) > 0.5) { rot.current += vel.current * dt; vel.current *= 0.94; }
        else rot.current += speed * (1 + Math.sin(now / 2600) * breath) * dt;
      }
      paint(); raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const wake = () => { if (document.visibilityState === 'visible') last.current = 0; };
    document.addEventListener('visibilitychange', wake);
    return () => { cancelAnimationFrame(raf.current); io.disconnect(); document.removeEventListener('visibilitychange', wake); };
  }, [R, step, count, speed, breath, clearArc, haze, reduced]);

  const down = (e: React.PointerEvent) => { if (!draggable) return; e.currentTarget.setPointerCapture?.(e.pointerId); grab.current = { on: true, x: e.clientX }; vel.current = 0; };
  const move = (e: React.PointerEvent) => { if (!grab.current.on) return; const d = (e.clientX - grab.current.x) * 0.2; grab.current.x = e.clientX; rot.current += d; vel.current = d * 60; };
  const up = (e: React.PointerEvent) => { e.currentTarget.releasePointerCapture?.(e.pointerId); grab.current.on = false; };

  return (
    <div className={className} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      style={{ position: 'relative', width: '100%', height: cardHeight + 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: `${perspective}px`, cursor: draggable ? 'grab' : 'default', touchAction: 'pan-y', userSelect: 'none', ...style }}>
      <div style={{ transform: `rotateX(${tilt}deg)`, transformStyle: 'preserve-3d' }}>
        <div ref={arcRef} style={{ position: 'relative', width: cardWidth, height: cardHeight, transformStyle: 'preserve-3d' }}>
          {Array.from({ length: count }, (_, i) => (
            <article key={i} ref={(el) => { cards.current[i] = el; }} className={cardClassName}
              style={{ position: 'absolute', inset: 0, transform: `rotateY(${i * step}deg) translateZ(${R}px)`, willChange: 'opacity, filter, transform' }}>
              {render(i)}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
