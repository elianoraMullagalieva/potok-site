import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';

/* Проволочные 3D-объекты из линий и точек, как на референсе: catmull-строки нет, только тонкие штрихи */
export type WireKind = 'coil' | 'dots' | 'poly' | 'rings' | 'wave' | 'funnel';
type Props = { kind: WireKind; color?: string; accent?: string; faded?: number; speed?: number; className?: string; stroke?: number };

type V = [number, number, number];
const rotX = ([x, y, z]: V, a: number): V => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotY = ([x, y, z]: V, a: number): V => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
const rotZ = ([x, y, z]: V, a: number): V => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];

export function Wire({ kind, color = '#1a1b1f', accent, faded = 0, speed = 1, className, stroke = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = ref.current!; const ctx = cv.getContext('2d')!;
    let raf = 0, running = true, visible = true, w = 0, h = 0, dpr = Math.min(devicePixelRatio, 2);
    const resize = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); }); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(cv);

    // --- геометрия ---
    const model = build(kind);
    const proj = (p: V, s: number): [number, number, number] => {
      const d = 3.2, k = d / (d - p[2]);
      return [w / 2 + p[0] * s * k, h / 2 - p[1] * s * k, k];
    };

    const draw = (ms: number) => {
      const t = (ms / 1000) * speed;
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w, h) * 0.36;
      const ang = kind === 'coil' ? { x: 1.1, y: t * 0.25, z: 0.0 } : kind === 'wave' ? { x: 1.05, y: 0.6 + Math.sin(t * 0.2) * 0.15, z: 0 } : { x: 0.5 + Math.sin(t * 0.15) * 0.2, y: t * 0.3, z: 0.2 };
      const tr = (p: V): V => rotX(rotY(rotZ(p, ang.z), ang.y), ang.x);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      if (kind === 'dots') {
        for (let i = 0; i < model.pts.length; i++) {
          const p = model.pts[i]; const q = tr(p); const q2 = tr([p[0] * 1.06, p[1] * 1.06, p[2] * 1.06]);
          const a = proj(q, s), b = proj(q2, s);
          const depth = (q[2] + 1) / 2; // 0 дальний, 1 ближний
          const isFaded = faded > 0 && (Math.atan2(p[2], p[0]) + Math.PI) / (2 * Math.PI) < faded;
          ctx.strokeStyle = isFaded ? (accent ?? color) : color;
          ctx.globalAlpha = (isFaded ? 0.9 : 0.12 + depth * 0.75);
          ctx.lineWidth = stroke * (0.6 + depth * 0.8);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
      } else if (kind === 'wave') {
        const n = model.grid!; const amp = 0.18;
        const P: V[] = model.pts.map(([x, , z]) => [x, Math.sin(x * 4 + t * 1.2) * amp * Math.cos(z * 3 + t * 0.8), z]);
        ctx.strokeStyle = color; ctx.lineWidth = stroke;
        for (let r = 0; r < n; r++) {
          ctx.beginPath();
          for (let c = 0; c < n; c++) { const a = proj(tr(P[r * n + c]), s * 1.3); c ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1]); }
          ctx.globalAlpha = 0.25 + (r / n) * 0.55; ctx.stroke();
        }
        for (let c = 0; c < n; c++) {
          ctx.beginPath();
          for (let r = 0; r < n; r++) { const a = proj(tr(P[r * n + c]), s * 1.3); r ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1]); }
          ctx.globalAlpha = 0.35; ctx.stroke();
        }
        if (accent) { // одна ячейка подсвечена — «целевая заявка»
          const i = Math.floor((t * 0.5) % (n * n)); const a = proj(tr(P[i]), s * 1.3);
          ctx.globalAlpha = 1; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(a[0], a[1], 3.5, 0, 7); ctx.fill();
        }
      } else {
        // линии (coil, rings, poly, funnel)
        for (const line of model.lines) {
          ctx.beginPath();
          let first = true;
          for (const p of line.pts) { const a = proj(tr(p), s); first ? ctx.moveTo(a[0], a[1]) : ctx.lineTo(a[0], a[1]); first = false; }
          if (line.closed) ctx.closePath();
          ctx.strokeStyle = line.accent && accent ? accent : color; ctx.globalAlpha = line.alpha ?? 0.8; ctx.lineWidth = stroke * (line.width ?? 1); ctx.stroke();
        }
        for (const p of model.pts) { // вершины
          const q = tr(p); const a = proj(q, s); const depth = (q[2] + 1) / 2;
          ctx.globalAlpha = 0.35 + depth * 0.65; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(a[0], a[1], 1.6 + depth * 1.2, 0, 7); ctx.fill();
        }
        if (accent && kind === 'poly') { // сигнал бежит по рёбрам
          const L = model.lines; const k = (t * 0.6) % L.length; const ln = L[Math.floor(k)]; const f = k % 1;
          const a0 = ln.pts[0], a1 = ln.pts[1]; const p: V = [a0[0] + (a1[0] - a0[0]) * f, a0[1] + (a1[1] - a0[1]) * f, a0[2] + (a1[2] - a0[2]) * f];
          const a = proj(tr(p), s); ctx.globalAlpha = 1; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(a[0], a[1], 4, 0, 7); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    const loop = (ms: number) => { if (!running) return; if (visible) draw(ms); raf = requestAnimationFrame(loop); };
    resize();
    if (reduced) draw(4000); else raf = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [kind, color, accent, faded, speed, reduced, stroke]);

  return <canvas ref={ref} className={className} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden />;
}

type Line = { pts: V[]; closed?: boolean; alpha?: number; width?: number; accent?: boolean };
function build(kind: WireKind): { pts: V[]; lines: Line[]; grid?: number } {
  const pts: V[] = []; const lines: Line[] = [];
  if (kind === 'coil') {
    const N = 7, seg = 72;
    for (let i = 0; i < N; i++) {
      const y = -0.55 + (i / (N - 1)) * 1.1, r = 0.95 - Math.abs(i - (N - 1) / 2) * 0.015;
      const ring: V[] = []; for (let k = 0; k < seg; k++) { const a = (k / seg) * Math.PI * 2; ring.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
      lines.push({ pts: ring, closed: true, alpha: 0.9 - (i / N) * 0.35, width: i === N - 1 ? 1.4 : 1 });
    }
  } else if (kind === 'funnel') {
    const N = 6, seg = 72;
    for (let i = 0; i < N; i++) {
      const y = 0.6 - (i / (N - 1)) * 1.2, r = 1.0 - (i / (N - 1)) * 0.78;
      const ring: V[] = []; for (let k = 0; k < seg; k++) { const a = (k / seg) * Math.PI * 2; ring.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
      lines.push({ pts: ring, closed: true, alpha: 0.5 + (i / N) * 0.5, accent: i === N - 1, width: i === N - 1 ? 1.6 : 1 });
    }
  } else if (kind === 'dots') {
    const n = 1100, g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = g * i; pts.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
  } else if (kind === 'poly') {
    const f = (1 + Math.sqrt(5)) / 2, raw: V[] = [];
    for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) { raw.push([0, s1, s2 * f]); raw.push([s1, s2 * f, 0]); raw.push([s2 * f, 0, s1]); }
    const norm = (p: V): V => { const l = Math.hypot(...p); return [p[0] / l, p[1] / l, p[2] / l]; };
    const vs = raw.map(norm); pts.push(...vs);
    for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) {
      const d = Math.hypot(vs[i][0] - vs[j][0], vs[i][1] - vs[j][1], vs[i][2] - vs[j][2]);
      if (d < 1.1) lines.push({ pts: [vs[i], vs[j]], alpha: 0.55 });
    }
    // дуги-«тики» вокруг, как на референсе
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * Math.PI * 2, arc: V[] = [];
      for (let k = 0; k <= 8; k++) { const a = a0 + (k / 8) * 0.35; arc.push([Math.cos(a) * 1.25, Math.sin(a * 2.1) * 0.5, Math.sin(a) * 1.25]); }
      lines.push({ pts: arc, alpha: 0.5, width: 1.2 });
    }
  } else if (kind === 'rings') {
    const seg = 96;
    const mk = (fn: (a: number) => V) => { const r: V[] = []; for (let k = 0; k < seg; k++) r.push(fn((k / seg) * Math.PI * 2)); return r; };
    lines.push({ pts: mk((a) => [Math.cos(a), Math.sin(a) * 0.5, Math.sin(a) * 0.85]), closed: true, alpha: 0.9, width: 1.4 });
    lines.push({ pts: mk((a) => [Math.cos(a) * 0.5, Math.sin(a), Math.cos(a) * 0.85]), closed: true, alpha: 0.9, width: 1.4 });
    lines.push({ pts: mk((a) => [Math.sin(a) * 0.85, Math.cos(a) * 0.85, Math.sin(a) * 0.5]), closed: true, alpha: 0.9, width: 1.4, accent: true });
  } else if (kind === 'wave') {
    const n = 16;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) pts.push([(c / (n - 1) - 0.5) * 2, 0, (r / (n - 1) - 0.5) * 2]);
    return { pts, lines, grid: n };
  }
  return { pts, lines };
}
