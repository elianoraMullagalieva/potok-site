import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';
import styles from './Sky.module.css';

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const FRAG = `
precision highp float;
uniform vec2 r; uniform float t; uniform float seed; uniform float zoom; uniform vec2 pan;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<6;i++){ v+=a*noise(p); p=m*p+seed; a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / r; vec2 q = uv; q.x *= r.x/r.y;
  q = q*zoom + pan;
  // градиент неба: глубокий синий сверху, светлый у горизонта
  vec3 top = vec3(0.06, 0.34, 0.98); vec3 hor = vec3(0.50, 0.74, 1.0);
  vec3 sky = mix(hor, top, smoothstep(0.0, 1.0, pow(uv.y, 0.85)));
  // солнце в верхнем левом углу
  float sun = exp(-length(uv - vec2(0.18, 1.05))*2.2);
  sky += vec3(0.45, 0.42, 0.30) * sun * 0.55;
  // облака: два слоя, медленный дрейф
  float d1 = fbm(q*1.6 + vec2(t*0.012, 0.0));
  float d2 = fbm(q*3.4 + vec2(-t*0.02, t*0.004) + 7.0);
  float band = smoothstep(0.80, 0.25, uv.y);           // кучевые только внизу
  float c1 = smoothstep(0.52, 0.76, d1) * band;
  float c2 = smoothstep(0.62, 0.82, d2) * 0.35 * smoothstep(0.3, 0.95, uv.y);
  float cloud = clamp(c1 + c2, 0.0, 1.0);
  // объём: верх облака светлее, низ в тени
  float shade = fbm(q*2.2 + vec2(0.0, 0.35) + vec2(t*0.012, 0.0));
  vec3 cloudCol = mix(vec3(0.78, 0.84, 0.95), vec3(1.0), smoothstep(0.35, 0.75, shade));
  cloudCol += sun * 0.25;
  vec3 col = mix(sky, cloudCol, cloud);
  // лёгкое виньетирование по краям
  col *= 1.0 - 0.18*pow(length((uv-0.5)*vec2(1.0,1.2)), 2.2);
  gl_FragColor = vec4(col, 1.0);
}`;

type Props = { seed?: number; zoom?: number; pan?: [number, number]; animate?: boolean; className?: string; dpr?: number };

export function Sky({ seed = 1.7, zoom = 1, pan = [0, 0], animate = true, className, dpr }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) return;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error('Sky shader:', gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uS = gl.getUniformLocation(prog, 'seed'), uZ = gl.getUniformLocation(prog, 'zoom'), uP = gl.getUniformLocation(prog, 'pan');
    gl.uniform1f(uS, seed); gl.uniform1f(uZ, zoom); gl.uniform2f(uP, pan[0], pan[1]);
    const scale = Math.min(dpr ?? devicePixelRatio, 1.5) * 0.6; // шейдер мягкий, полное разрешение не нужно
    let raf = 0, running = true, visible = true;
    const resize = () => {
      const w = Math.max(2, Math.floor(cv.clientWidth * scale)), h = Math.max(2, Math.floor(cv.clientHeight * scale));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(uR, w, h); }
    };
    const draw = (ms: number) => { resize(); gl.uniform1f(uT, ms / 1000 + seed * 40); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const loop = (ms: number) => { if (!running) return; if (visible) draw(ms); raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    const ro = new ResizeObserver(() => draw(performance.now()));
    ro.observe(cv);
    if (animate && !reduced) raf = requestAnimationFrame(loop); else draw(performance.now());
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [seed, zoom, pan, animate, reduced, dpr]);
  return <canvas ref={ref} className={`${styles.sky} ${className ?? ''}`} aria-hidden />;
}


/* Статичные копии неба: один общий WebGL-контекст → dataURL. Не плодим контексты. */
let shared: { cv: HTMLCanvasElement; gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> } | null = null;
function getShared() {
  if (shared) return shared;
  const cv = document.createElement('canvas');
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true, antialias: false })!;
  const sh = (type: number, src: string) => { const x = gl.createShader(type)!; gl.shaderSource(x, src); gl.compileShader(x); return x; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(['r', 't', 'seed', 'zoom', 'pan'].map((k) => [k, gl.getUniformLocation(prog, k)]));
  shared = { cv, gl, u };
  return shared;
}
const cache = new Map<string, string>();
export function skyImage(seed: number, zoom: number, pan: [number, number], w = 640, h = 480) {
  const key = `${seed}|${zoom}|${pan}|${w}x${h}`;
  const hit = cache.get(key); if (hit) return hit;
  const { cv, gl, u } = getShared();
  cv.width = w; cv.height = h; gl.viewport(0, 0, w, h);
  gl.uniform2f(u.r, w, h); gl.uniform1f(u.t, seed * 40); gl.uniform1f(u.seed, seed); gl.uniform1f(u.zoom, zoom); gl.uniform2f(u.pan, pan[0], pan[1]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  const url = cv.toDataURL('image/jpeg', 0.86);
  cache.set(key, url);
  return url;
}
export function SkyStatic({ seed = 2, zoom = 0.8, pan = [0, 0] as [number, number], className }: { seed?: number; zoom?: number; pan?: [number, number]; className?: string }) {
  const url = useMemo(() => skyImage(seed, zoom, pan), [seed, zoom, pan[0], pan[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className={`${styles.sky} ${className ?? ''}`} style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} aria-hidden />;
}
