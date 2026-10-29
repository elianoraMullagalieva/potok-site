import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/lenis';
import { benefits, services } from '../../content/texts';
import { SkyStatic } from '../../ui/Sky';
import { Tag, Dot } from '../../ui/Tag';
import { Face } from '../../ui/Face';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Benefits.module.css';

export function Benefits() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (k: string) => setOpen((o) => (o === k ? null : k));

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      // слова манифеста проявляются по скроллу: серый → чёрный
      gsap.fromTo(`.${styles.w}`, { opacity: 0.18 }, {
        opacity: 1, stagger: 0.04, ease: 'none',
        scrollTrigger: { trigger: `.${styles.manifest}`, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
      });
      // появление: карточки спрятаны заранее и один раз всплывают; once — чтобы не застревать при повторном монтировании
      gsap.set(`.${styles.card}`, { y: 90, opacity: 0 });
      gsap.to(`.${styles.card}`, {
        y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: `.${styles.cards}`, start: 'top 82%', once: true },
      });
      // лёгкий параллакс: карточки с разным смещением едут с разной скоростью
      // на телефоне карточки идут в одну колонку, параллакс там даёт наезды друг на друга
      if (window.matchMedia('(min-width: 561px)').matches) {
        gsap.utils.toArray<HTMLElement>(`.${styles.card}`).forEach((c, i) => {
          // параллакс через yPercent, чтобы не спорить с появлением по y
          gsap.fromTo(c, { yPercent: (i % 2 ? 8 : -8) }, { yPercent: (i % 2 ? -8 : 8), ease: 'none', scrollTrigger: { trigger: `.${styles.cards}`, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="benefits" ref={root} className={`wrap ${styles.section}`}>
      <div className={styles.head}>
        <Dot /><span className="label mute">{benefits.label}</span>
      </div>

      <h2 className={`display ${styles.manifest}`}>
        {benefits.manifest.map((chunk, i) =>
          chunk === '▬' ? (
            <span key={i} className={styles.capsule} aria-hidden><SkyStatic id={i === 1 ? 'manifest1' : 'manifest2'} /></span>
          ) : (
            chunk.split(' ').map((w, j) => <span key={`${i}-${j}`} className={`${styles.w} ${i >= 2 ? styles.wMute : ''}`}>{w}</span>)
          ),
        )}
      </h2>

      <div className={`${styles.cards} ${open ? styles.cardsOpen : ''}`}>
        {benefits.cards.map((c, i) => (
          <article key={c.tag} className={`${styles.card} ${styles[c.kind]} ${open === c.kind ? styles.cardOn : ''} ${open && open !== c.kind ? styles.cardDim : ''}`} style={{ '--i': i } as React.CSSProperties}
            role="button" tabIndex={0} aria-expanded={open === c.kind} onClick={() => toggle(c.kind)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(c.kind); } }}>
            <span className={styles.more} aria-hidden>{open === c.kind ? '−' : '+'}</span>
            {c.kind === 'photo' && <SkyStatic id="speed" />}
            {c.kind === 'photo' && <div className={styles.photoShade} />}
            <div className={styles.cardTop}>
              <Tag onDark={c.kind !== 'light' && c.kind !== 'grey'}>{c.tag}</Tag>
            </div>
            {c.kind === 'dark' && <Chain />}
            {c.kind === 'photo' && <Timeline />}
            {c.kind === 'light' && <CrmRows />}
            {c.kind === 'grey' && <Team />}
            {/* раскрытое содержимое живёт в самой карточке */}
            {open === c.kind && (
              <div className={styles.inCard} onClick={(e) => e.stopPropagation()}>
                {c.kind === 'dark' && <DChain />}
                {c.kind === 'photo' && <DTimeline />}
                {c.kind === 'light' && <DCrm />}
                {c.kind === 'grey' && <DTeam />}
              </div>
            )}
            <div className={styles.cardBody}>
              <Dot className={styles.cardDot} /><h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardText}>{c.text}</p>
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}

const D = benefits.details;

/* 1. Связка: объявление нарисовано, квиз и бот — места под фото, заявка в CRM */
function DChain() {
  const d = D.dark;
  return (
    <>
      <h3 className={styles.dTitle}>{d.title}</h3>
      <ol className={styles.dChain}>
        {d.steps.map((st, i) => (
          <li key={st.k} style={{ '--i': i } as React.CSSProperties}>
            <div className={styles.dShot}>
              {st.k === 'ad' && (
                <div className={styles.ad}>
                  <span className={styles.adMark}>Реклама</span><span className={styles.adUrl}>{d.ad.url}</span>
                  <b className={styles.adTitle}>{d.ad.title}</b>
                  <p className={styles.adText}>{d.ad.text}</p>
                  <div className={styles.adLinks}>{d.ad.sitelinks.map((x) => <span key={x}>{x}</span>)}</div>
                </div>
              )}
              {st.k === 'quiz' && <div className={styles.ph}><span>{d.quizPh}</span></div>}
              {st.k === 'bot' && <div className={styles.ph}><span>{d.botPh}</span></div>}
              {st.k === 'lead' && (
                <div className={styles.leadCard}>
                  <span className={styles.leadNew}>Новая заявка · 14:20</span>
                  <b>Игорь, +7 927 ··· 41</b>
                  <ul><li><i>Тип</i>секционные</li><li><i>Размер</i>4 × 5 м</li><li><i>Срок</i>в этом месяце</li></ul>
                  <span className={styles.leadOk}>целевая</span>
                </div>
              )}
            </div>
            <span className={styles.dStepN}>0{i + 1}</span>
            <b className={styles.dStepL}>{st.label}</b>
            <p className={styles.dStepP}>{st.note}</p>
          </li>
        ))}
      </ol>
      <div className={styles.dCount}>
        <b className="num">{d.count}</b><span>{d.countLabel}</span>
        <div className={styles.marquee}><div>{[...d.niches, ...d.niches].map((n, i) => <span key={i}>{n}</span>)}</div></div>
      </div>
    </>
  );
}

/* 2. Старт: диаграмма по часам двух дней, исполнители, бегущая отметка времени, первая заявка */
function DTimeline() {
  const d = D.photo;
  // ось: день 1 — 9…20 (11 ч), день 2 — 9…15 (6 ч), между днями узкий разрыв
  const total = 11 + 6, gap = 0.6;
  const x = (day: number, h: number) => ((day === 1 ? h - 9 : 11 + gap + (h - 9)) / (total + gap)) * 100;
  const ticks1 = [9, 12, 15, 18], ticks2 = [9, 12, 15];
  return (
    <>
      <h3 className={styles.dTitle}>{d.title}</h3>
      <div className={styles.gStats}>{d.stats.map(([b, t]) => <div key={t}><b className="num">{b}</b><span>{t}</span></div>)}</div>
      <div className={styles.gantt}>
        <div className={styles.gAxis}>
          <span className={styles.gDay} style={{ left: `${x(1, 9)}%` }}>День 1</span>
          <span className={styles.gDay} style={{ left: `${x(2, 9)}%` }}>День 2</span>
          {ticks1.map((t) => <i key={`a${t}`} style={{ left: `${x(1, t)}%` }}>{t}:00</i>)}
          {ticks2.map((t) => <i key={`b${t}`} style={{ left: `${x(2, t)}%` }}>{t}:00</i>)}
        </div>
        <div className={styles.gBody}>
          <span className={styles.gSplit} style={{ left: `${(x(1, 20) + x(2, 9)) / 2}%` }} />
          {d.rows.map((r, i) => {
            const p = services.people[r.who];
            return (
              <div key={i} className={styles.gRow} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.gBar} style={{ left: `${x(r.d, r.from)}%`, width: `${x(r.d, r.to) - x(r.d, r.from)}%` }}>
                  <Face src={p.face} name={p.name} size={22} />
                </span>
                {/* подпись справа от полоски, у правого края — слева; на телефоне всегда над строкой */}
                <em className={styles.gLabel} style={x(r.d, r.to) > 62 ? { right: `calc(${100 - x(r.d, r.from)}% + 10px)` } : { left: `calc(${x(r.d, r.to)}% + 10px)` }}>{r.h}</em>
              </div>
            );
          })}
          <span className={styles.gLead} style={{ left: `${x(d.lead.d, d.lead.at)}%` }}><b>{d.lead.label}</b></span>
          <span className={styles.gNow} />
        </div>
      </div>
      <p className={styles.dNote}>{d.note}</p>
    </>
  );
}

/* 3. CRM: четыре цифры, неделя столбиками, лента заявок */
function DCrm() {
  const d = D.light;
  const max = Math.max(...d.week);
  return (
    <>
      <h3 className={styles.dTitle}>{d.title}</h3>
      <div className={styles.dCrm}>
        <div className={styles.kpis}>
          {d.kpis.map(([l, v], i) => <div key={l} className={i === 1 ? styles.kpiOn : ''} style={{ '--i': i } as React.CSSProperties}><span>{l}</span><b className="num">{v}</b></div>)}
        </div>
        <div className={styles.week}>
          <span className={styles.panelLabel}>{d.weekLabel}</span>
          <div className={styles.weekBars}>{d.week.map((v, i) => <div key={i}><i style={{ height: `${(v / max) * 100}%`, '--i': i } as React.CSSProperties} /><span>{d.days[i]}</span></div>)}</div>
        </div>
        <div className={styles.feed}>
          <span className={styles.panelLabel}>{d.feedLabel}</span>
          <ul>{d.feed.map(([n, s, t], i) => <li key={n} style={{ '--i': i } as React.CSSProperties}><span>{n}</span><em className={t === 'ok' ? styles.fOk : styles.fNo}>{s}</em></li>)}</ul>
        </div>
      </div>
    </>
  );
}

/* 4. Команда: у каждого своя зона, при наведении — реплика */
function DTeam() {
  return (
    <>
      <h3 className={styles.dTitle}>{D.grey.title}</h3>
      <ul className={styles.dTeam}>
        {services.items.map((it, i) => {
          const p = services.people[it.lead];
          return (
            <li key={it.n} style={{ '--i': i } as React.CSSProperties}>
              <Face src={p.face} name={p.name} size={64} />
              <b>{p.name}</b>
              <span className={styles.zone}>{it.zone}</span>
              <p className={styles.stat}><b className="num">{it.stat.big}</b> {it.stat.text}</p>
              <span className={styles.bubble}>{it.says[0]}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* Связка: объявление → квиз → бот → заявка. Слова из подписи карточки */
function Chain() {
  const steps = ['Объявления', 'Квиз', 'Бот'];
  return (
    <div className={styles.chain} aria-hidden>
      {steps.map((st, i) => (
        <div key={st} className={styles.chainRow}>
          <span className={styles.chainNode}><i /></span>
          <span className={styles.chainPill}>{st}</span>
          {i < steps.length - 1 && <span className={styles.chainLine} />}
        </div>
      ))}
      <div className={styles.chainRow}>
        <span className={`${styles.chainNode} ${styles.chainNodeOn}`}><i /></span>
        <span className={`${styles.chainPill} ${styles.chainPillOn}`}>Заявки</span>
      </div>
    </div>
  );
}
/* Таймлайн запуска: бюджет зачислен → день 1 → день 2 */
function Timeline() {
  return (
    <div className={styles.tl} aria-hidden>
      <div className={styles.tlTrack}><i style={{ width: '66%' }} /></div>
      <ul className={styles.tlMarks}>
        <li><b /><span>Бюджет зачислен</span></li>
        <li><b /><span>День 1</span></li>
        <li><b /><span>День 2</span></li>
      </ul>
    </div>
  );
}
function CrmRows() {
  const widths = [78, 46, 30, 62];
  return (
    <ul className={styles.crm} aria-hidden>
      <li className={styles.crmHead}><span className="label">CRM</span><span className={styles.live} /></li>
      {benefits.crmRows.map((r, i) => (
        <li key={r}><span>{r}</span><i className={i === 1 ? styles.barOn : ''} style={{ width: `${widths[i]}%` }} /></li>
      ))}
    </ul>
  );
}
function Team() {
  return (
    <div className={styles.team} aria-hidden>
      {benefits.team.map((t) => <span key={t.initials} className={styles.ava}><Face src={t.face} name={t.name} size={54} /></span>)}
      <span className={styles.noMgr}>{benefits.noManagers}</span>
    </div>
  );
}
