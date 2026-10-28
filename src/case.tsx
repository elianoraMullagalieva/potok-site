import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { CaseDetail } from './sections/Cases/CaseDetail';
import { Chats } from './sections/Cases/Chats';
import { Lead } from './sections/Lead/Lead';
import { cases } from './content/texts';

/* Страница одного кейса: открывается с главной в новой вкладке, ?id= выбирает нишу */
function CasePage() {
  useEffect(() => {
    import('./lib/lenis').then((m) => m.initLenis());
    const id = new URLSearchParams(location.search).get('id');
    if (id && cases.items.some((c) => c.id === id)) requestAnimationFrame(() => window.dispatchEvent(new CustomEvent('case:open', { detail: id })));
  }, []);
  const home = import.meta.env.PAGES ? `${import.meta.env.BASE_URL}v2/` : `${import.meta.env.BASE_URL}`;
  return (
    <main className="page">
      <a href={home} className="label casePageBack">← На главную</a>
      <CaseDetail />
      <Chats />
      <Lead />
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<StrictMode><CasePage /></StrictMode>);
