import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { process, services } from '../../content/texts';
import { Sky } from '../../ui/Sky';
import { Face } from '../../ui/Face';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Process.module.css';

type Step = (typeof process.steps)[number];

/**
 * Как работаем: рамка с небом (рифма с героем), внутри пять карточек по этапам.
 * В каждой — человек, который за этап отвечает, его реплика и живой кусок работы:
 * спрос по городу, экран квиза, статус площадок, фильтр заявок, недельный отчёт.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const small = useMedia('(max-width: 900px)');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.h2}, .${styles.sub}`, { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from(`.${styles.card}`, { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: `.${styles.grid}`, start: 'top 85%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="process" ref={root} className={styles.section}>
      <div className={styles.frame}>
        <Sky seed={11.2} zoom={1.05} pan={[0.5, 0.15]} animate={!small} />
        <div className={styles.shade} />
        <div className={styles.top}>
          <h2 className={`display ${styles.h2}`}>{process.title}</h2>
          <p className={styles.sub}>{process.sub}</p>
        </div>
        <div className={styles.grid}>
          {process.steps.map((st, i) => <Card key={st.n} st={st} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function Card({ st, i }: { st: Step; i: number }) {
  const p = services.people[st.who];
  return (
    <article className={styles.card} style={{ '--i': i } as React.CSSProperties}>
      <header className={styles.head}>
        <span className={styles.when}><i /> {st.when}</span>
        <span className={`num ${styles.n}`}>{st.n}</span>
      </header>
      <h3 className={styles.title}>{st.title}</h3>
      <div className={styles.visual}><Visual st={st} /></div>
      <div className={styles.say}>
        <Face src={p.face} name={p.name} size={36} />
        <p><b>{p.name.split(' ')[0]}:</b> {st.say}</p>
      </div>
      <p className={styles.result}><i aria-hidden />{st.result}</p>
    </article>
  );
}

/* Кусок работы по этапу. Данные — из texts.process.steps[].mock */
function Visual({ st }: { st: Step }) {
  const m = st.mock as Record<string, unknown>;
  switch (st.kind) {
    case 'demand': {
      const bars = m.bars as number[];
      return (
        <div className={styles.demand}>
          <span className={styles.vLabel}>{m.label as string}</span>
          <div className={styles.bars}>{bars.map((b, k) => <i key={k} style={{ '--h': `${b}%`, '--k': k } as React.CSSProperties} />)}</div>
          <span className={styles.vNote}>{m.note as string}</span>
        </div>
      );
    }
    case 'quiz': {
      const a = m.a as string[];
      return (
        <div className={styles.quiz}>
          <div className={styles.qTop}><span>{m.step as string}</span><span className={styles.qBar}><i /></span></div>
          <div className={styles.qQ}>{m.q as string}</div>
          <div className={styles.qA}>{a.map((x, k) => <span key={x} className={k === 1 ? styles.qOn : ''}>{x}</span>)}</div>
          <div className={styles.msg}><span className={styles.msgApp}>Telegram</span>{m.msg as string}</div>
        </div>
      );
    }
    case 'launch': {
      const rows = m.rows as string[][];
      return (
        <div className={styles.launch}>
          {rows.map(([name, status]) => <div key={name} className={styles.lRow}><span>{name}</span><span className={styles.ok}>{status}</span></div>)}
          <div className={styles.first}><i /><span>{m.first as string}</span></div>
        </div>
      );
    }
    case 'fraud': {
      const leads = m.leads as string[][];
      return (
        <ul className={styles.leads}>
          {leads.map(([who, st2], k) => <li key={k} className={st2 === 'целевая' ? styles.leadOk : styles.leadNo}><span>{who}</span><b>{st2}</b></li>)}
        </ul>
      );
    }
    default: {
      const rows = m.rows as string[][];
      return (
        <div className={styles.report}>
          <span className={styles.vLabel}>Неделя 2 · отчёт</span>
          {rows.map(([k, v]) => <div key={k} className={styles.rRow}><span>{k}</span><b className="num">{v}</b></div>)}
        </div>
      );
    }
  }
}
