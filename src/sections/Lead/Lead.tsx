import { useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap } from '../../lib/lenis';
import { lead, services } from '../../content/texts';
import { Button } from '../../ui/Button';
import { Sky } from '../../ui/Sky';
import { Face } from '../../ui/Face';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { useMedia } from '../../lib/useMedia';
import styles from './Lead.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/**
 * Заявка: две панели. Слева небо, человек, который ответит, крупный вопрос и подарок за заявку.
 * Справа тёмная панель: что интересует, три поля и вопрос, жёлтая кнопка.
 */
export function Lead() {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const reduced = useReducedMotion();
  const small = useMedia('(max-width: 900px)');
  const person = services.people[lead.person];

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.card}`, { y: 60, opacity: 0, scale: 0.98, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from(`.${styles.left} > *, .${styles.right} > *`, { y: 20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: root.current, start: 'top 60%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const toggle = (x: string) => setPicked((p) => (p.includes(x) ? p.filter((y) => y !== x) : [...p, x]));
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const token = import.meta.env.VITE_TG_TOKEN, chat = import.meta.env.VITE_TG_CHAT;
    if (token && chat) fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text: `Заявка\n${fd.get('name')} · ${fd.get('contact')}\n${fd.get('niche')}\n${picked.join(', ')}\n${fd.get('question') ?? ''}` }) }).catch(() => {});
    setSent(true);
  };

  return (
    <section id="lead" ref={root} className={styles.section}>
      <div className={styles.card}>
        {/* слева: небо, человек, вопрос, подарок */}
        <div className={styles.left}>
          <Sky seed={9.1} zoom={1.1} pan={[0.3, 0.1]} animate={!small} />
          <div className={styles.shade} />
          <div className={styles.who}>
            <div className={styles.person}>
              <Face src={person.face} name={person.name} size={64} ring="rgba(255,255,255,.6)" />
              <div><b>{person.name}</b><span>{lead.personLine}</span></div>
            </div>
            <div className={styles.contacts}>
              <a className={styles.pill} href={`mailto:${lead.email}`}>{lead.email}</a>
              <a className={`${styles.pill} ${styles.pillTg}`} href={lead.tgHref} target="_blank" rel="noreferrer"><Icon id="tg" />{lead.tg}</a>
            </div>
          </div>

          <h2 className={`display ${styles.h2}`}>{lead.title}<br /><span>{lead.titleTail}</span></h2>

          <div className={styles.gift}>
            <div className={styles.giftHead}><span className={styles.giftLabel}>{lead.giftLabel}</span><span className={styles.usually}>{lead.giftUsually}</span></div>
            <ul className={styles.gifts}>
              {lead.gifts.map((g) => <li key={g.t}><img src={asset(`gifts/v3/${g.visual}.jpg`)} alt="" loading="lazy" draggable={false} /><span>{g.t}</span></li>)}
            </ul>
          </div>

          <ul className={styles.socials}>
            {lead.socials.map((s) => <li key={s.id}><a href={s.href} aria-label={s.name} title={s.name} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><Icon id={s.id} /></a></li>)}
          </ul>
        </div>

        {/* справа: форма */}
        <div className={styles.right}>
          <h3 className={styles.fTitle}><span>{lead.formTitle}</span><br />{lead.formTitleTail}</h3>
          {sent ? (
            <div className={styles.done}><span className={styles.check} aria-hidden>✓</span>{lead.done}</div>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              <span className={styles.label}>{lead.interestLabel}</span>
              <div className={styles.chips}>
                {lead.interests.map((x) => <button key={x} type="button" className={`${styles.chip} ${picked.includes(x) ? styles.chipOn : ''}`} onClick={() => toggle(x)} aria-pressed={picked.includes(x)}>{x}</button>)}
              </div>
              <label className={styles.field}><input name="name" required placeholder=" " autoComplete="name" /><span>{lead.name}</span></label>
              <label className={styles.field}><input name="contact" required placeholder=" " autoComplete="tel" /><span>{lead.contact}</span></label>
              <label className={styles.field}><input name="niche" placeholder=" " /><span>{lead.niche}</span></label>
              <label className={styles.field}><input name="question" placeholder=" " /><span>{lead.question}</span></label>
              <label className={styles.consent}><input type="checkbox" required /> <span>{lead.consent}</span></label>
              <Button variant="primary" arrow type="submit" className={styles.cta}>{lead.cta}</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* Свои простые иконки: VK, MAX, Telegram, Instagram, почта */
function Icon({ id }: { id: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'vk': return <svg viewBox="0 0 24 24" width="17" height="17"><path {...p} d="M3 7c.5 7 4 10 9 10h1v-4c2 .3 3.5 2 4 4h3c-.5-2.5-2.3-4.4-4-5 1.7-.8 3.3-2.8 3.8-5h-3c-.5 2-2 3.6-3.8 4V7h-3v3" /></svg>;
    case 'max': return <svg viewBox="0 0 24 24" width="17" height="17"><circle {...p} cx="12" cy="12" r="8.5" /><path {...p} d="M8 15V9l4 4 4-4v6" /></svg>;
    case 'tg': return <svg viewBox="0 0 24 24" width="17" height="17"><path {...p} d="M21 4 3 11l6 2 2 6 3-4 5 3z" /><path {...p} d="M9 13l12-9" /></svg>;
    case 'ig': return <svg viewBox="0 0 24 24" width="17" height="17"><rect {...p} x="4" y="4" width="16" height="16" rx="5" /><circle {...p} cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" r="1" fill="currentColor" /></svg>;
    default: return <svg viewBox="0 0 24 24" width="17" height="17"><rect {...p} x="3" y="5" width="18" height="14" rx="3" /><path {...p} d="M3 8l9 6 9-6" /></svg>;
  }
}
