import { useCallback, useEffect, useState } from 'react';
import { initLenis } from './lib/lenis';
import { Hero } from './sections/Hero/Hero';
import { HeroCardV2 } from './sections/Hero/HeroCardsV2';
import { Benefits } from './sections/Benefits/Benefits';
import { BenefitsV2 } from './sections/Benefits/BenefitsV2';
import { Services } from './sections/Services/Services';
import { WorkSphere } from './sections/Gallery/WorkSphere';
import { Cases } from './sections/Cases/Cases';
import { Quiz } from './sections/Quiz/Quiz';
import { Preloader } from './ui/Preloader';

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
      <Quiz />
      <Services />
      <WorkSphere />
      <Cases />
      <a className="label" href={V1 ? `${import.meta.env.BASE_URL}v2/` : `${import.meta.env.BASE_URL}v1/`} style={{ position: 'fixed', left: 16, bottom: 14, zIndex: 50, color: 'var(--mute)' }}>{V1 ? 'Версия 2 →' : 'Версия 1 →'}</a>
    </main>
  );
}
