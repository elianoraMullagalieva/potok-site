import { useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap, ScrollTrigger } from '../../lib/lenis';
import { lead, footer, nav } from '../../content/texts';
import { Button } from '../../ui/Button';
import { Sky } from '../../ui/Sky';
import { Logo } from '../../ui/Logo';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Lead.module.css';

/* Заявка + футер: рифма с героем (небо в рамке), форма в одну строку, ПО / ТОК по углам */
export function Lead() {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.frame}`, { scale: 0.96, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from(`.${styles.word}`, { yPercent: 100, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: `.${styles.footer}`, start: 'top 85%' } });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const token = import.meta.env.VITE_TG_TOKEN, chat = import.meta.env.VITE_TG_CHAT;
    if (token && chat) fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text: `Заявка\n${fd.get('name')} · ${fd.get('contact')}\n${fd.get('niche')}` }) }).catch(() => {});
    setSent(true);
  };

  return (
    <section id="lead" ref={root} className={styles.section}>
      <div className={styles.frame}>
        <Sky seed={9.1} zoom={1.1} pan={[0.3, 0.1]} />
        <div className={styles.shade} />
        <div className={styles.inner}>
          <h2 className={`display ${styles.h2}`}>{lead.title}</h2>
          <p className={styles.sub}>{lead.sub}</p>
          <ul className={styles.pills}>{lead.pills.map((p) => <li key={p}>{p}</li>)}</ul>
          {sent ? (
            <div className={styles.done}><span className={styles.check} aria-hidden>✓</span>{lead.done}</div>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              <input name="name" required placeholder={lead.name} className={styles.input} autoComplete="name" />
              <input name="contact" required placeholder={lead.contact} className={styles.input} autoComplete="tel" />
              <input name="niche" placeholder={lead.niche} className={styles.input} />
              <Button variant="primary" arrow type="submit" className={styles.cta}>{lead.cta}</Button>
              <label className={styles.consent}><input type="checkbox" required /> <span>{lead.consent}</span></label>
            </form>
          )}
          <p className={styles.alt}>{lead.alt} <a href="#">{lead.altLink}</a></p>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.fTop}>
          <div><Logo /><p className={styles.fLine}>{footer.line}</p></div>
          <ul className={styles.fContacts}>{footer.contacts.map((c) => <li key={c}><a href="#">{c}</a></li>)}</ul>
          <ul className={styles.fMenu}>{nav.menu.map((m) => <li key={m.label}><a href={m.href}>{m.label}</a></li>)}</ul>
        </div>
        <div className={styles.words} aria-hidden>
          <span className={styles.mask}><span className={styles.word}>{footer.wordA}</span></span>
          <span className={styles.mask}><span className={styles.word}>{footer.wordB}</span></span>
        </div>
        <div className={styles.fBottom}>
          <ul>{footer.legal.map((l) => <li key={l}>{l}</li>)}</ul>
          <span>{footer.copy}</span>
        </div>
      </footer>
    </section>
  );
}
