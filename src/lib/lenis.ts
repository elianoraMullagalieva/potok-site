import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initLenis() {
  if (lenis) return lenis;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9, syncTouch: false, anchors: true });
  ScrollTrigger.config({ ignoreMobileResize: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
export function getLenis() { return lenis; }
export { gsap, ScrollTrigger };
