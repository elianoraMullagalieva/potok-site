import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { CaseDetail } from './sections/Cases/CaseDetail';
import { Chats } from './sections/Cases/Chats';
import { Lead } from './sections/Lead/Lead';
import { cases, nav, caseDetail } from './content/texts';
import { Logo } from './ui/Logo';
import { Button } from './ui/Button';

/* Страница одного кейса: открывается с главной в новой вкладке, ?id= выбирает нишу */
function CasePage() {
  useEffect(() => {
    import('./lib/lenis').then((m) => m.initLenis());
    import('./lib/reveal').then((m) => m.initReveal(document.querySelector('main')!));
    const id = new URLSearchParams(location.search).get('id');
    if (id && cases.items.some((c) => c.id === id)) requestAnimationFrame(() => window.dispatchEvent(new CustomEvent('case:open', { detail: id })));
  }, []);
  const home = import.meta.env.PAGES ? `${import.meta.env.BASE_URL}v3/` : `${import.meta.env.BASE_URL}`;
  return (
    <main className="page">
      {/* закреплённая шапка: лого ведёт на главную, справа быстрые действия */}
      <header className="caseBar">
        <Logo href={home} />
        <nav className="caseBarMenu" aria-label="Меню">{nav.menu.map((m) => <a key={m.label} href={home + m.href}>{m.label}</a>)}</nav>
        <div className="caseBarActions">
          <a className="caseBarTg" href="https://t.me/potok_studio" target="_blank" rel="noreferrer" aria-label="Написать в Telegram">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21.4 4.3 2.9 11.4c-1 .4-1 1.6.1 1.9l4.6 1.4 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7l3-14.6c.2-1-.8-1.8-1.7-1.4Zm-3.7 3.4-8.4 7.6-.3 3.2-1.4-4.4 9.6-6.1c.4-.3.8.1.5.4Z" /></svg>
          </a>
          <Button variant="primary" href="#lead" className="caseBarCta">{caseDetail.same}</Button>
        </div>
      </header>
      <CaseDetail />
      <Chats />
      <Lead />
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<StrictMode><CasePage /></StrictMode>);
