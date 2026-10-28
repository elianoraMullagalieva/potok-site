import { Suspense, lazy, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Hero } from './sections/Hero/Hero';
import { Preloader } from './ui/Preloader';
import { Sky } from './ui/Sky';
import { useMedia } from './lib/useMedia';

const params = new URLSearchParams(location.search);
const V1 = params.get('v') === '1' || /\/v[12](\/|$)/.test(location.pathname);
// /v1/3/ или ?n=3 — показать только первые N блоков (отдельная ссылка для показа)
const LIMIT = Number(params.get('n')) || (location.pathname.match(/\/(\d+)(\/|$)/)?.[1] ? Number(location.pathname.match(/\/(\d+)(\/|$)/)![1]) : 99);
// вариант акцента: /lime/ или /white/ в пути, либо ?accent=
const ACCENT = params.get('accent') || location.pathname.match(/\/(lime|white)(\/|$)/)?.[1] || '';
if (ACCENT) document.documentElement.dataset.accent = ACCENT;
// вариант тарифов без серой плашки: /v1/flat/ или ?flat
if (params.has('flat') || /\/flat(\/|$)/.test(location.pathname)) document.documentElement.dataset.pricing = 'flat';
// прелоадер показывается при каждой загрузке; ?nopre отключает его
const skipLoader = params.has('nopre') || matchMedia('(prefers-reduced-motion: reduce)').matches;

// Первый экран едет одним чанком; всё остальное, включая выгоды нужной версии, подгружается отдельно
const HeroCardV2 = lazy(() => import('./sections/Hero/HeroCardsV2').then((m) => ({ default: m.HeroCardV2 })));
const Benefits = lazy(() => V1 ? import('./sections/Benefits/Benefits').then((m) => ({ default: m.Benefits })) : import('./sections/Benefits/BenefitsV2').then((m) => ({ default: m.BenefitsV2 })));
const Quiz = lazy(() => import('./sections/Quiz/Quiz').then((m) => ({ default: m.Quiz })));
const Services = lazy(() => import('./sections/Services/Services').then((m) => ({ default: m.Services })));
const Cases = lazy(() => import('./sections/Cases/Cases').then((m) => ({ default: m.Cases })));
const Process = lazy(() => import('./sections/Process/Process').then((m) => ({ default: m.Process })));
const Pricing = lazy(() => import('./sections/Pricing/Pricing').then((m) => ({ default: m.Pricing })));
const About = lazy(() => import('./sections/About/About').then((m) => ({ default: m.About })));
const Faq = lazy(() => import('./sections/Faq/Faq').then((m) => ({ default: m.Faq })));
const Footer = lazy(() => import('./sections/Lead/Footer').then((m) => ({ default: m.Footer })));
const Lead = lazy(() => import('./sections/Lead/Lead').then((m) => ({ default: m.Lead })));

/* Обёртка-див нужна пину ScrollTrigger: pin-spacer появляется внутри стабильного родителя, React не теряет узел */
/** Одно небо на два блока: этапы и сфера едут поверх неподвижного шейдера, стыка нет */
function SkyBand({ children }: { children: ReactNode }) {
  const small = useMedia('(max-width: 900px)');
  return (
    <div className="skyBand">
      <div className="skyBand__sky"><div className="skyBand__view"><Sky seed={11.2} zoom={1.05} pan={[0.5, 0.15]} animate={!small} /></div></div>
      {children}
    </div>
  );
}

function Block({ children, h = '100vh' }: { children: ReactNode; h?: string }) {
  return <Suspense fallback={<div style={{ minHeight: h }} />}><div className="blk">{children}</div></Suspense>;
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
  const done = useCallback(() => setLoading(false), []);

  return (
    <>
    <main className="page">
      {loading && <Preloader onDone={done} />}
      <Hero renderCard={V1 ? undefined : (i) => <Suspense fallback={null}><HeroCardV2 i={i} /></Suspense>} delay={loading ? 3.0 : 0} />
      {LIMIT > 1 && <Block><Benefits /></Block>}
      {LIMIT > 2 && <Block><Quiz /></Block>}
      {LIMIT > 3 && <Block><Services /></Block>}
      {LIMIT > 4 && <Block><Cases /></Block>}
      {LIMIT > 5 && <SkyBand><Block><Process /></Block></SkyBand>}
      {LIMIT > 9 && <Block><Pricing /></Block>}
      {LIMIT > 10 && <Block><About /></Block>}
      {LIMIT > 11 && <Block><Faq /></Block>}
      {LIMIT > 12 && <Block h="80vh"><Lead /></Block>}
      <RefreshOnce />
    </main>
    {LIMIT > 12 && <div className="footerSlot"><Suspense fallback={null}><Footer /></Suspense></div>}
      {!import.meta.env.PAGES && <a className="label" href={(V1 ? `${import.meta.env.BASE_URL}v2/` : `${import.meta.env.BASE_URL}v1/`) + (LIMIT < 99 ? `${LIMIT}/` : '')} style={{ position: 'fixed', left: 16, bottom: 14, zIndex: 50, color: 'var(--ink)', background: 'rgba(244,243,239,.85)', backdropFilter: 'blur(8px)', padding: '6px 10px', borderRadius: 999, boxShadow: '0 0 0 1px var(--line) inset' }}>{V1 ? 'Версия 2 →' : 'Версия 1 →'}</a>}
    </>
  );
}
