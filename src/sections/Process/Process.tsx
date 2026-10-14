import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { process, services } from '../../content/texts';
import { Face } from '../../ui/Face';
import { SwipeHint } from '../../ui/SwipeHint';
import { useMedia } from '../../lib/useMedia';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Process.module.css';

type Step = (typeof process.steps)[number];
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/**
 * Как работаем: рамка с небом, внутри ряд из пяти одинаковых белых карточек.
 * Видно три с хвостом четвёртой; рамка закрепляется, и скролл везёт ряд влево.
 * В каждой карточке: когда, что, короткий живой фрагмент и кто ведёт.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const small = useMedia('(max-width: 900px)');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.h2}, .${styles.sub}`, { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: small ? 'top 85%' : 'top 75%', once: small } });
      if (small) {
        // телефон и планшет: без pin, карточки-«сторис» один раз мягко проявляются
        gsap.from(`.${styles.card}`, { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: `.${styles.view}`, start: 'top 90%', once: true } });
        return;
      }
      // ряд едет влево до последней карточки с полем справа, затем пауза, чтобы её рассмотреть
      const pad = () => parseFloat(getComputedStyle(view.current!).paddingLeft) * 2;
      const dist = () => Math.max(0, track.current!.scrollWidth + pad() - view.current!.clientWidth);
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist() + 700}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to(track.current, { x: () => -dist(), ease: 'none', duration: 1 }).to({}, { duration: 0.35 });
    }, root);
    return () => ctx.revert();
  }, [reduced, small]);

  // инфографика в карточках запускается, когда блок попал в экран
  useEffect(() => {
    const cards = Array.from(root.current?.querySelectorAll<HTMLElement>(`.${styles.card}`) ?? []);
    const on = () => cards.forEach((c) => c.setAttribute('data-live', ''));
    if (reduced) { on(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { on(); io.disconnect(); } }, { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section id="process" ref={root} className={styles.section}>
      <div className={styles.frame}>
        <div className={styles.top}>
          <h2 className={`display ${styles.h2}`}>{process.title}</h2>
          <p className={styles.sub}>{process.sub}</p>
        </div>
        <div className={styles.hintRow}><SwipeHint onDark text={process.hint} /></div>
        <div ref={view} className={styles.view}>
          <div ref={track} className={styles.track}>
            {process.steps.map((st) => <Card key={st.n} st={st} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ st }: { st: Step }) {
  const p = services.people[st.who];
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <span className={styles.when}>{st.when}</span>
        <span className={`num ${styles.n}`}>{st.n}</span>
      </header>
      <h3 className={styles.title}>{st.title}</h3>
      <div className={styles.visual}><Visual st={st} /></div>
      <footer className={styles.foot}>
        <Face src={p.face} name={p.name} size={40} />
        <div className={styles.msgBody}>
          <span className={styles.who}>{p.name.split(' ')[0]}<em className="num">{['09:12', '17:40', '14:20', '14:21', 'пн, 09:00'][Number(st.n) - 1]}</em></span>
          <p className={styles.result}>{st.result}</p>
        </div>
      </footer>
    </article>
  );
}

/* Фрагмент работы по этапу. Только серый, жёлтый, чёрный, белый */
function Visual({ st }: { st: Step }) {
  const m = st.mock as Record<string, unknown>;
  switch (st.kind) {
    case 'demand': {
      const bars = m.bars as number[];
      return (
        <div className={styles.plate}>
          <span className={styles.vLabel}>{m.label as string}</span>
          <div className={styles.bars}>{bars.map((b, k) => <i key={k} style={{ '--h': `${b}%`, '--k': k } as React.CSSProperties} />)}</div>
          <b className={`num ${styles.vBig}`}>{m.note as string}</b>
        </div>
      );
    }
    case 'sites': {
      const shots = m.shots as string[];
      return (
        <div className={styles.sites}>
          {shots.map((s, k) => <span key={s} className={styles.site} style={{ '--k': k } as React.CSSProperties}><img src={asset(s)} alt="" loading="lazy" draggable={false} /></span>)}
        </div>
      );
    }
    case 'launch': {
      const rows = m.rows as string[][];
      return (
        <div className={styles.chain}>
          {rows.map(([name, status], k) => (
            <div key={name} className={styles.chainRow} style={{ '--k': k } as React.CSSProperties}>
              <span className={styles.node}><i /></span>
              <span className={styles.pill}>{name}</span>
              <span className={styles.status}><i className={styles.wait}>модерация…</i><i className={styles.ok}>{status}</i></span>
            </div>
          ))}
          <div className={`${styles.chainRow} ${styles.chainLast}`} style={{ '--k': 2 } as React.CSSProperties}>
            <span className={`${styles.node} ${styles.nodeOn}`}><i /></span>
            <span className={`${styles.pill} ${styles.pillYellow}`}>{m.first as string}</span>
          </div>
        </div>
      );
    }
    case 'fraud': {
      const leads = m.leads as string[][];
      return (
        <div className={styles.list}>
          {leads.map(([who, st2], k) => <div key={k} className={`${styles.row} ${styles.lead} ${st2 === 'целевая' ? '' : styles.rowNo}`} style={{ '--i': k } as React.CSSProperties}><span>{who}</span><b className={st2 === 'целевая' ? styles.good : styles.bad}>{st2}</b></div>)}
        </div>
      );
    }
    default: {
      const rows = m.rows as string[][];
      const widths = [78, 46, 30, 62];
      return (
        <div className={styles.report}>
          <span className={styles.vLabel}>Неделя 2 · отчёт</span>
          {rows.map(([k, v], i) => (
            <div key={k} className={styles.rRow} style={{ '--i': i, '--w': `${widths[i]}%` } as React.CSSProperties}>
              <span className={styles.rName}>{k}</span>
              <span className={styles.rBar}><i className={i === 1 ? styles.rBarOn : ''} /></span>
              <b className="num">{v}</b>
            </div>
          ))}
        </div>
      );
    }
  }
}
