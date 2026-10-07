import { Suspense, lazy, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Hero } from './sections/Hero/Hero';
import { Preloader } from './ui/Preloader';

const params = new URLSearchParams(location.search);
const V1 = params.get('v') === '1' || /\/v1(\/|$)/.test(location.pathname);
// /v1/3/ или ?n=3 — показать только первые N блоков (отдельная ссылка для показа)
const LIMIT = Number(params.get('n')) || (location.pathname.match(/\/(\d+)\/?$/)?.[1] ? Number(location.pathname.match(/\/(\d+)\/?$/)![1]) : 99);
const skipLoader = params.has('nopre') || matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('potok:seen:v2') === '1';

// Первый экран едет одним чанком; всё остальное, включая выгоды нужной версии, подгружается отдельно
const HeroCardV2 = lazy(() => import('./sections/Hero/HeroCardsV2').then((m) => ({ default: m.HeroCardV2 })));
const Benefits = lazy(() => V1 ? import('./sections/Benefits/Benefits').then((m) => ({ default: m.Benefits })) : import('./sections/Benefits/BenefitsV2').then((m) => ({ default: m.BenefitsV2 })));
const Quiz = lazy(() => import('./sections/Quiz/Quiz').then((m) => ({ default: m.Quiz })));
const Services = lazy(() => import('./sections/Services/Services').then((m) => ({ default: m.Services })));
const WorkSphere = lazy(() => import('./sections/Gallery/WorkSphere').then((m) => ({ default: m.WorkSphere })));
const Cases = lazy(() => import('./sections/Cases/Cases').then((m) => ({ default: m.Cases })));
const Process = lazy(() => import('./sections/Process/Process').then((m) => ({ default: m.Process })));
const Pricing = lazy(() => import('./sections/Pricing/Pricing').then((m) => ({ default: m.Pricing })));
const About = lazy(() => import('./sections/About/About').then((m) => ({ default: m.About })));
const Lead = lazy(() => import('./sections/Lead/Lead').then((m) => ({ default: m.Lead })));

function Block({ children, h = '100vh' }: { children: ReactNode; h?: string }) {
  return <Suspense fallback={<div style={{ minHeight: h }} />}>{children}</Suspense>;
}

/* Один пересчёт ScrollTrigger после того, как смонтировались все секции */
function RefreshOnce() {
  useEffect(() => {
    let id = 0;
    import('./lib/lenis').then(({ ScrollTrigger }) => { id = requestAnimationFrame(() => ScrollTrigger.refresh()); });
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}

export default function App() {
  const [loading, setLoading] = useState(!skipLoader);
  useEffect(() => { import('./lib/lenis').then((m) => m.initLenis()); }, []);
  const done = useCallback(() => { sessionStorage.setItem('potok:seen:v2', '1'); setLoading(false); }, []);

  return (
    <main>
      {loading && <Preloader onDone={done} />}
      <Hero renderCard={V1 ? undefined : (i) => <Suspense fallback={null}><HeroCardV2 i={i} /></Suspense>} delay={loading ? 3.0 : 0} />
      {LIMIT > 1 && <Block><Benefits /></Block>}
      {LIMIT > 2 && <Block><Quiz /></Block>}
      {LIMIT > 3 && <Block><Services /></Block>}
      {LIMIT > 4 && <Block><WorkSphere /></Block>}
      {LIMIT > 5 && <Block><Cases /></Block>}
      {LIMIT > 6 && <Block><Process /></Block>}
      {LIMIT > 7 && <Block><Pricing /></Block>}
      {LIMIT > 8 && <Block><About /></Block>}
      {LIMIT > 9 && <Block h="80vh"><Lead /></Block>}
      <RefreshOnce />
      <a className="label" href={(V1 ? `${import.meta.env.BASE_URL}v2/` : `${import.meta.env.BASE_URL}v1/`) + (LIMIT < 99 ? `${LIMIT}/` : '')} style={{ position: 'fixed', left: 16, bottom: 14, zIndex: 50, color: 'var(--ink)', background: 'rgba(244,243,239,.85)', backdropFilter: 'blur(8px)', padding: '6px 10px', borderRadius: 999, boxShadow: '0 0 0 1px var(--line) inset' }}>{V1 ? 'Версия 2 →' : 'Версия 1 →'}</a>
    </main>
  );
}
