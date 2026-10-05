import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { initLenis } from './lib/lenis';
import { Hero } from './sections/Hero/Hero';
import { HeroCardV2 } from './sections/Hero/HeroCardsV2';
import { Benefits } from './sections/Benefits/Benefits';
import { BenefitsV2 } from './sections/Benefits/BenefitsV2';
import { Preloader } from './ui/Preloader';

// Всё ниже второго экрана грузится отдельными чанками: первый экран приходит быстрее
const Quiz = lazy(() => import('./sections/Quiz/Quiz').then((m) => ({ default: m.Quiz })));
const Services = lazy(() => import('./sections/Services/Services').then((m) => ({ default: m.Services })));
const WorkSphere = lazy(() => import('./sections/Gallery/WorkSphere').then((m) => ({ default: m.WorkSphere })));
const Cases = lazy(() => import('./sections/Cases/Cases').then((m) => ({ default: m.Cases })));
const Process = lazy(() => import('./sections/Process/Process').then((m) => ({ default: m.Process })));
const Pricing = lazy(() => import('./sections/Pricing/Pricing').then((m) => ({ default: m.Pricing })));
const About = lazy(() => import('./sections/About/About').then((m) => ({ default: m.About })));
const Lead = lazy(() => import('./sections/Lead/Lead').then((m) => ({ default: m.Lead })));

const params = new URLSearchParams(location.search);
const V1 = params.get('v') === '1' || /\/v1\/?$/.test(location.pathname);
const skipLoader = params.has('nopre') || matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('potok:seen') === '1';

export default function App() {
  const [loading, setLoading] = useState(!skipLoader);
  useEffect(() => { initLenis(); }, []);
  const done = useCallback(() => { sessionStorage.setItem('potok:seen', '1'); setLoading(false); }, []);

  return (
    <main>
      {loading && <Preloader onDone={done} />}
      <Hero renderCard={V1 ? undefined : (i) => <HeroCardV2 i={i} />} delay={loading ? 3.0 : 0} />
      {V1 ? <Benefits /> : <BenefitsV2 />}
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Quiz />
        <Services />
        <WorkSphere />
        <Cases />
        <Process />
        <Pricing />
        <About />
        <Lead />
      </Suspense>
      <a className="label" href={V1 ? `${import.meta.env.BASE_URL}v2/` : `${import.meta.env.BASE_URL}v1/`} style={{ position: 'fixed', left: 16, bottom: 14, zIndex: 50, color: 'var(--ink)', background: 'rgba(244,243,239,.85)', backdropFilter: 'blur(8px)', padding: '6px 10px', borderRadius: 999, boxShadow: '0 0 0 1px var(--line) inset' }}>{V1 ? 'Версия 2 →' : 'Версия 1 →'}</a>
    </main>
  );
}
