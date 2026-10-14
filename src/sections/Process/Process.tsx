import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/lenis';
import { process, services } from '../../content/texts';
import { Sky } from '../../ui/Sky';
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
    if (reduced || small) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.h2}, .${styles.sub}`, { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      // ряд едет влево до последней карточки с полем справа, затем пауза, чтобы её рассмотреть
      const pad = () => parseFloat(getComputedStyle(view.current!).paddingLeft) * 2;
      const dist = () => Math.max(0, track.current!.scrollWidth + pad() - view.current!.clientWidth);
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist() + 700}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to(track.current, { x: () => -dist(), ease: 'none', duration: 1 }).to({}, { duration: 0.35 });
    }, root);
    return () => ctx.revert();
  }, [reduced, small]);

  // карточка «оживает», когда видна больше чем наполовину: запускаем её инфографику
  useEffect(() => {
    const cards = Array.from(root.current?.querySelectorAll<HTMLElement>(`.${styles.card}`) ?? []);
    if (reduced) { cards.forEach((c) => c.setAttribute('data-live', '')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0.5) e.target.setAttribute('data-live', ''); }), { threshold: [0.5] });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
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
        <p className={styles.result}>{st.result}</p>
        <span className={styles.who}><Face src={p.face} name={p.name} size={28} />{p.name.split(' ')[0]}</span>
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
        <div className={styles.list}>
          {rows.map(([name, status], k) => <div key={name} className={styles.row} style={{ '--k': k, '--i': k } as React.CSSProperties}><span>{name}</span><b className={styles.okWrap}><i className={styles.wait}>модерация…</i><i className={styles.ok}>{status}</i></b></div>)}
          <div className={`${styles.row} ${styles.rowYellow}`}><i className={styles.dot} /><span>{m.first as string}</span></div>
        </div>
      );
    }
    case 'fraud': {
      const leads = m.leads as string[][];
      return (
        <div className={styles.list}>
          {leads.map(([who, st2], k) => <div key={k} className={`${styles.row} ${st2 === 'целевая' ? '' : styles.rowNo}`} style={{ '--i': k } as React.CSSProperties}><span>{who}</span><b className={st2 === 'целевая' ? styles.ok : styles.no}>{st2}</b></div>)}
        </div>
      );
    }
    default: {
      const rows = m.rows as string[][];
      return (
        <div className={styles.plate}>
          {rows.map(([k, v], i) => <div key={k} className={styles.rRow} style={{ '--i': i } as React.CSSProperties}><span>{k}</span><b className="num">{v}</b></div>)}
        </div>
      );
    }
  }
}
