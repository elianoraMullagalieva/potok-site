import { useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap } from '../../lib/lenis';
import { lead } from '../../content/texts';
import { Footer } from './Footer';
import { Button } from '../../ui/Button';
import { Sky } from '../../ui/Sky';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { useMedia } from '../../lib/useMedia';
import styles from './Lead.module.css';

/* Заявка + футер: рифма с героем (небо в рамке), форма в одну строку, ПО / ТОК по углам */
export function Lead() {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const reduced = useReducedMotion();
  const small = useMedia('(max-width: 768px)');
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.pills} li, .${styles.form}, .${styles.alt}`, { y: 20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: root.current, start: 'top 60%' } });
      gsap.from(`.${styles.frame}`, { scale: 0.96, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
    }, root);
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
        <Sky seed={9.1} zoom={1.1} pan={[0.3, 0.1]} animate={!small} />
        <div className={styles.shade} />
        <div className={styles.inner}>
          <h2 className={`display ${styles.h2}`}>{lead.title}</h2>
          <p className={styles.sub}>{lead.sub}</p>
          <ul className={styles.pills}>{lead.pills.map((p) => <li key={p}>{p}</li>)}</ul>
          {sent ? (
            <div className={styles.done}><span className={styles.check} aria-hidden>✓</span>{lead.done}</div>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              <input name="name" required placeholder={lead.name} aria-label={lead.name} className={styles.input} autoComplete="name" />
              <input name="contact" required placeholder={lead.contact} aria-label={lead.contact} className={styles.input} autoComplete="tel" />
              <input name="niche" placeholder={lead.niche} aria-label={lead.niche} className={styles.input} />
              <Button variant="primary" arrow type="submit" className={styles.cta}>{lead.cta}</Button>
              <label className={styles.consent}><input type="checkbox" required /> <span>{lead.consent}</span></label>
            </form>
          )}
          <p className={styles.alt}>{lead.alt} <a href="#">{lead.altLink}</a></p>
        </div>
      </div>

      <Footer />
    </section>
  );
}
