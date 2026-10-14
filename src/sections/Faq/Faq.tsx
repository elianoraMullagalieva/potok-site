import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/lenis';
import { faq, services } from '../../content/texts';
import { Face } from '../../ui/Face';
import { Dot } from '../../ui/Tag';
import { Button } from '../../ui/Button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Faq.module.css';

/**
 * Вопросы: слева закреплённый заголовок и «онлайн», справа список.
 * Клик раскрывает ответ: сначала три точки «печатает», затем текст набирается очень быстро.
 */
export function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.aside} > *`, { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from(`.${styles.item}`, { y: 24, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: `.${styles.list}`, start: 'top 80%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const lead = services.people['Андрей'];
  return (
    <section id="faq" ref={root} className={`wrap ${styles.section}`}>
      <div className={styles.grid}>
        <div className={styles.aside}>
          <div className={styles.head}><Dot /><span className="label mute">{faq.label}</span></div>
          <h2 className={`display ${styles.h2}`}>{faq.title}</h2>
          <p className={styles.sub}>{faq.sub}</p>
          <div className={styles.who}>
            <img className={styles.bigAva} src={`${import.meta.env.BASE_URL}${lead.photo}`} alt={lead.name} width={96} height={96} loading="lazy" draggable={false} />
            <div>
              <div className={styles.online}><i /><b>{lead.name.split(' ')[0]}</b>&nbsp;{faq.online}</div>
              <Button variant="dark" arrow className={styles.write} href={faq.writeHref}>{faq.write}</Button>
            </div>
          </div>
        </div>
        <ul className={styles.list}>
          {faq.items.map((it, i) => <Item key={it.q} it={it} i={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} reduced={reduced} />)}
        </ul>
      </div>
    </section>
  );
}

type Q = (typeof faq.items)[number];
function Item({ it, i, open, onToggle, reduced }: { it: Q; i: number; open: boolean; onToggle: () => void; reduced: boolean }) {
  const p = services.people[it.who];
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'idle' | 'dots' | 'typing' | 'done'>('idle');
  const timer = useRef(0);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!open) { setPhase('idle'); setTyped(''); return; }
    if (reduced) { setTyped(it.a); setPhase('done'); return; }
    setPhase('dots'); setTyped('');
    timer.current = window.setTimeout(() => {
      setPhase('typing');
      let k = 0;
      const step = () => {
        k += 3; // по три символа за тик — очень быстро, но видно, что печатает
        setTyped(it.a.slice(0, k));
        if (k < it.a.length) timer.current = window.setTimeout(step, 14);
        else setPhase('done');
      };
      step();
    }, 650);
    return () => clearTimeout(timer.current);
  }, [open, it.a, reduced]);

  return (
    <li className={`${styles.item} ${open ? styles.on : ''}`}>
      <button type="button" className={styles.q} onClick={onToggle} aria-expanded={open}>
        <span className={`num ${styles.n}`}>{String(i + 1).padStart(2, '0')}</span>
        <span className={styles.qText}>{it.q}</span>
        <span className={styles.plus} aria-hidden />
      </button>
      <div className={styles.body} aria-hidden={!open}>
        <div className={styles.bodyIn}>
          <div className={styles.answer}>
            <span className={styles.ava}><Face src={p.face} name={p.name} size={44} /><i /></span>
            <div className={styles.bubble}>
              <span className={styles.from}>{p.name.split(' ')[0]} · {p.role}</span>
              {phase === 'dots' && <span className={styles.dots} aria-hidden><i /><i /><i /></span>}
              {(phase === 'typing' || phase === 'done') && <p className={styles.text}>{typed}{phase === 'typing' && <span className={styles.caret} />}</p>}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
