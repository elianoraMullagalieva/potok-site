import { useEffect, useRef, useState, type FormEvent } from 'react';
import { footer } from '../../content/texts';
import { Logo, LogoMark } from '../../ui/Logo';
import { SkyStatic } from '../../ui/Sky';
import styles from './Footer.module.css';

/**
 * Футер: две карточки рядом — слева небо с логотипом и соцсетями, справа светлая
 * с навигацией и мини-формой; над правой «висит» кубик со знаком. Снизу — водяной знак
 * «ПОТОК» во всю ширину: viewBox подгоняется по реальным границам букв.
 */
export function Footer() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const token = import.meta.env.VITE_TG_TOKEN, chat = import.meta.env.VITE_TG_CHAT;
    if (token && chat) fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text: `Футер · ${fd.get('contact')}` }) }).catch(() => {});
    setSent(true);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* левая: небо, логотип, слоган, соцсети */}
        <div className={styles.left}>
          <SkyStatic id="quiz" className={styles.sky} />
          <div className={styles.shade} />
          <div className={styles.logo}><Logo onDark /></div>
          <p className={styles.tagline}>{footer.tagline[0]}<br /><span>{footer.tagline[1]}</span></p>
          <div className={styles.socialRow}>
            <span className={styles.hand}>{footer.socialLabel}</span>
            <ul className={styles.socials}>
              {footer.socials.map((s) => <li key={s.id}><a href={s.href} aria-label={s.name} title={s.name} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><Icon id={s.id} /></a></li>)}
            </ul>
          </div>
        </div>

        {/* правая: кубик, колонки, низ */}
        <div className={styles.right}>
          <a href="#quiz" className={styles.lucky} aria-label={footer.lucky}>
            <span className={styles.cube}><span className={styles.cubeMark}><LogoMark size={44} /></span></span>
            <span className={styles.luckyRow}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden><path d="M3 20C6 14 10 9 18 5M18 5h-6M18 5v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className={styles.hand}>{footer.lucky}</span>
            </span>
          </a>
          <div className={styles.cols}>
            {footer.cols.map((c) => (
              <div key={c.title} className={styles.col}>
                <span className={`${styles.hand} ${styles.colTitle}`}>{c.title}</span>
                {c.links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
              </div>
            ))}
          </div>
          <div className={styles.bottom}>
            <div className={styles.legal}>
              <span>{footer.copy}</span>
              {footer.legal.map((l) => <span key={l}>{l}</span>)}
            </div>
            <div className={styles.mini}>
              <h4>{footer.ctaHead}<strong>{footer.ctaStrong}</strong></h4>
              {sent ? <p className={styles.done}>✓ {footer.ctaDone}</p> : (
                <form className={styles.sub} onSubmit={submit}>
                  <input name="contact" type="text" required placeholder={footer.ctaPlaceholder} aria-label={footer.ctaPlaceholder} autoComplete="tel" />
                  <button type="submit">{footer.ctaButton}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <ElasticSign />
    </footer>
  );
}

/* Подпись как у Osmo: буквы поднимаются снизу по очереди от центра к краям, пока футер
   въезжает в экран. В моменте верх надписи образует дугу, потом выравнивается в строку.
   Привязано к прокрутке в обе стороны, плюс лёгкий наклон от скорости скролла. */
function ElasticSign() {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current, row = line.current; if (!el || !row) return;
    const letters = Array.from(row.children) as HTMLElement[];
    const n = letters.length, mid = (n - 1) / 2;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, p = 0, last = window.scrollY, vel = 0, skew = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = () => {
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      // 0 — верх подписи у нижнего края экрана, 1 — подпись полностью видна
      const target = reduced ? 1 : Math.max(0, Math.min(1, (vh - r.top) / (r.height * 1.6)));
      p += (target - p) * 0.14;
      const y = window.scrollY, dy = y - last; last = y;
      vel += (dy - vel) * 0.18;
      skew += ((reduced ? 0 : Math.max(-14, Math.min(14, vel * 0.7))) - skew) * 0.12;
      for (let i = 0; i < n; i++) {
        const u = Math.abs(i - mid) / mid;        // 0 в центре, 1 у краёв
        const delay = u * u * 0.55;               // центр стартует первым: получается дуга
        const lp = ease(Math.max(0, Math.min(1, (p - delay) / (1 - 0.55))));
        letters[i].style.transform = `translate3d(0, ${((1 - lp) * 112).toFixed(2)}%, 0)`;
      }
      row.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const text = footer.sign.repeat(3);
  return (
    <div ref={box} className={styles.sign} aria-hidden>
      <div ref={line} className={styles.signLine}>{[...text].map((ch, i) => <span key={i}>{ch}</span>)}</div>
    </div>
  );
}

/* Простые свои иконки, без фирменных путей: самолётик, трубка, VK, конверт */
function Icon({ id }: { id: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'tg': return <svg viewBox="0 0 24 24" width="16" height="16"><path {...p} d="M21 4 3 11l6 2 2 6 3-4 5 3z" /><path {...p} d="M9 13l12-9" /></svg>;
    case 'wa': return <svg viewBox="0 0 24 24" width="16" height="16"><path {...p} d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /><path {...p} d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2z" /></svg>;
    case 'vk': return <svg viewBox="0 0 24 24" width="16" height="16"><path {...p} d="M3 7c.5 7 4 10 9 10h1v-4c2 .3 3.5 2 4 4h3c-.5-2.5-2.3-4.4-4-5 1.7-.8 3.3-2.8 3.8-5h-3c-.5 2-2 3.6-3.8 4V7h-3v3" /></svg>;
    default: return <svg viewBox="0 0 24 24" width="16" height="16"><rect {...p} x="3" y="5" width="18" height="14" rx="3" /><path {...p} d="M3 8l9 6 9-6" /></svg>;
  }
}
