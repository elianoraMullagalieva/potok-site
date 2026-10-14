import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/lenis';
import { cases, caseDetail } from '../../content/texts';
import { Button } from '../../ui/Button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './CaseDetail.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/**
 * Открытый кейс: вкладки по нишам, слева логотип, заголовок результата, задача и решение,
 * справа четыре компактные цифры. Ниже переписка с клиентом и, по кнопке, пять этапов проекта.
 */
export function CaseDetail({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState(false);
  const reduced = useReducedMotion();
  const c = cases.items.find((x) => x.id === active) ?? cases.items[0];
  const d = caseDetail.items[c.id];

  // смена вкладки: содержимое мягко перетекает, цифры набегают
  const busy = useRef(false);
  const pick = (id: string) => {
    if (id === active || busy.current) return;
    setSteps(false);
    if (reduced || !root.current) { onPick(id); return; }
    busy.current = true;
    gsap.to(`.${styles.swap}`, { y: -8, opacity: 0, duration: 0.18, ease: 'power2.in', overwrite: true, onComplete: () => {
      onPick(id);
      requestAnimationFrame(() => gsap.fromTo(`.${styles.swap}`, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.04, overwrite: true, onComplete: () => { busy.current = false; } }));
    } });
  };

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(root.current, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 85%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} id="case" className={styles.wrap}>
      {/* вкладки */}
      <div className={styles.tabs} role="tablist" aria-label={caseDetail.label}>
        <span className="label mute">{caseDetail.label}</span>
        <div className={styles.tabRow}>
          {cases.items.map((it) => (
            <button key={it.id} role="tab" type="button" aria-selected={it.id === active} className={`${styles.tab} ${it.id === active ? styles.tabOn : ''}`} onClick={() => pick(it.id)}>{caseDetail.items[it.id].tab}</button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.main}>
          <div className={styles.left}>
            <div className={`${styles.client} ${styles.swap}`}>
              <span className={styles.logoBox}><img src={asset(`logos/${c.id}.png`)} alt={c.client} /></span>
              <span><b>{c.client}</b><small>{c.niche} · {c.city}</small></span>
            </div>
            <h3 className={`${styles.headline} ${styles.swap}`}>{d.headline}</h3>
            <dl className={`${styles.ts} ${styles.swap}`}>
              <div><dt>{caseDetail.taskLabel}</dt><dd>{d.task}</dd></div>
              <div><dt>{caseDetail.solutionLabel}</dt><dd>{d.solution}</dd></div>
            </dl>
            <div className={styles.actions}>
              <button type="button" className={styles.full} onClick={() => setSteps((v) => !v)} aria-expanded={steps}>
                <span className={styles.fullT}>{caseDetail.full}</span>
                <span className={styles.fullS}>{caseDetail.fullSub} · {c.period}</span>
              </button>
              <Button variant="dark" arrow href="#lead">{caseDetail.same}</Button>
            </div>
          </div>
          <ul className={styles.nums}>
            {d.nums.map(([v, l], k) => (
              <li key={l} className={`${styles.num} ${k === 0 ? styles.numMain : ''} ${styles.swap}`}><b className="num">{v}</b><span>{l}</span></li>
            ))}
          </ul>
        </div>

        {/* этапы: раскрываются по кнопке */}
        <div className={styles.stepsWrap} aria-hidden={!steps}>
          <div className={styles.stepsIn}>
            <div className={styles.steps}>
              <span className="label mute">{caseDetail.stepsTitle}</span>
              <ol>{d.steps.map((st, k) => <li key={st}><i className="num">{String(k + 1).padStart(2, '0')}</i><span>{st}</span></li>)}</ol>
            </div>
          </div>
        </div>

        {/* переписка */}
        <div className={styles.chats}>
          <div className={styles.chatsHead}><h4>{caseDetail.chatsTitle}</h4><p>{caseDetail.chatsSub}</p></div>
          <div className={styles.chatRow}>
            {d.chats.map((ch, k) => (
              <div key={k} className={`${styles.chat} ${styles.swap}`}>
                <div className={styles.chatTop}><i>{ch.who.slice(0, 1)}</i><span><b>{ch.who}</b><small>{ch.role}</small></span><em className="num">{['10:42', '18:05'][k]}</em></div>
                {ch.msgs.map((m) => <p key={m} className={styles.msg}>{mark(m)}</p>)}
                <p className={`${styles.msg} ${styles.ours}`}>{ch.reply}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==главное== в сообщении выделяется маркером */
function mark(s: string) {
  return s.split(/==/).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}
