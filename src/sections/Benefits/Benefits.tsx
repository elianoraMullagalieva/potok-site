import { useEffect, useRef, useState } from 'react';
import { gsap, getLenis } from '../../lib/lenis';
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

  // если раскрытая карточка не влезла по высоте — докручиваем ровно настолько, чтобы влезла
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const el = root.current?.querySelector<HTMLElement>(`.${styles.cardOn}`);
      if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom <= vh - 16 && r.top >= 0) return;
      const dy = r.top < 0 ? r.top - 16 : Math.min(r.bottom - vh + 24, r.top - 16);
      const l = getLenis();
      if (l) l.scrollTo(window.scrollY + dy, { duration: 0.9 }); else window.scrollBy({ top: dy, behavior: 'smooth' });
    }, 820);
    return () => window.clearTimeout(t);
  }, [open]);

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
      <div className={styles.cHead}>
        <h3 className={styles.dTitle}>{d.title}</h3>
        <div className={styles.dCount}><b className="num">{d.count}</b><span>{d.countLabel}</span></div>
      </div>
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
            <b className={styles.dStepL}><span className={styles.dStepN}>0{i + 1}</span>{st.label}</b>
            <p className={styles.dStepP}>{st.note}</p>
          </li>
        ))}
      </ol>
      <div className={styles.dNiches}>
        <div className={styles.marquee}><div>{[...d.niches, ...d.niches].map((n, i) => <span key={i}>{n}</span>)}</div></div>
      </div>
    </>
  );
}

/* кольцо из n сегментов, сегменты зажигаются по очереди */
function Ring({ n, label, k }: { n: number; label: string; k: number }) {
  const r = 25, c = 2 * Math.PI * r, seg = c / n, gap = n > 4 ? 3.2 : 5;
  return (
    <div className={styles.ring} style={{ '--k': k } as React.CSSProperties}>
      <svg viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r={r} className={styles.ringBg} />
        {Array.from({ length: n }, (_, j) => (
          <circle key={j} cx="32" cy="32" r={r} className={styles.ringSeg} style={{ strokeDasharray: `${seg - gap} ${c - seg + gap}`, strokeDashoffset: -j * seg, '--j': j } as React.CSSProperties} />
        ))}
      </svg>
      <b className="num">{n}</b>
      <span>{label}</span>
    </div>
  );
}

/* 2. Старт: дорожка на человека, задачи прямо на плашках, бегущая отметка до первой заявки */
function DTimeline() {
  const d = D.photo;
  // ось: день 1 — 9…20, день 2 — 9…15; второй день плотнее по задачам, поэтому его час шире (k2)
  const k2 = 1.6, gap = 0.6, total = 11 + gap + 6 * k2;
  const x = (day: number, h: number) => ((day === 1 ? h - 9 : 11 + gap + (h - 9) * k2) / total) * 100;
  const ticks1 = [9, 12, 15, 18], ticks2 = [9, 12, 15];
  let n = 0;
  return (
    <>
      <div className={styles.gHead}>
        <div>
          <h3 className={styles.dTitle}>{d.title}</h3>
          <p className={styles.gNote}>{d.note}</p>
        </div>
        <div className={styles.rings}>{d.rings.map((r, k) => <Ring key={r.label} n={r.n} label={r.label} k={k} />)}</div>
      </div>
      <div className={styles.gScroll}>
        <div className={styles.gantt} style={{ '--lead': `${x(d.lead.d, d.lead.at)}%` } as React.CSSProperties}>
          <div className={styles.gAxis}>
            <span className={styles.gDay} style={{ left: `${x(1, 9)}%` }}>День 1</span>
            <span className={styles.gDay} style={{ left: `${x(2, 9)}%` }}>День 2</span>
            {ticks1.map((t) => <i key={`a${t}`} style={{ left: `${x(1, t)}%` }}>{t}:00</i>)}
            {ticks2.map((t) => <i key={`b${t}`} style={{ left: `${x(2, t)}%` }}>{t}:00</i>)}
          </div>
          {d.lanes.map((ln) => {
            const p = services.people[ln.who];
            return (
              <div key={ln.who} className={styles.lane}>
                <div className={styles.laneWho}><Face src={p.face} name={p.name} size={30} /><span><b>{ln.who}</b><small>{p.role}</small></span></div>
                <div className={styles.laneTrack}>
                  {ln.tasks.map((t) => (
                    <span key={t.h} className={styles.gBar} style={{ left: `${x(t.d, t.from)}%`, width: `${x(t.d, t.to) - x(t.d, t.from)}%`, '--i': n++ } as React.CSSProperties}>
                      <b>{t.h}</b>{t.s && <small>{t.s}</small>}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          <div className={styles.gOver} aria-hidden>
            <span className={styles.gSplit} style={{ left: `${(x(1, 20) + x(2, 9)) / 2}%` }} />
            <span className={styles.gNow} />
            <span className={styles.gLeadLine} />
          </div>
          <div className={styles.gLeadRow}><span className={styles.gLead}><b>{d.lead.label}</b></span></div>
        </div>
      </div>
      <p className={styles.gSwipe}>Листайте вправо →</p>
    </>
  );
}

/* 3. CRM: светлые плитки — заявки штриховкой, расход линией, цена заявки по площадкам, лента */
function DCrm() {
  const d = D.light;
  const max = Math.max(...d.leads.week);
  const peak = d.leads.week.indexOf(max);
  const cv = d.spend.curve, cmax = Math.max(...cv) * 1.15;
  const pts = cv.map((v, i) => [(i / (cv.length - 1)) * 100, 100 - (v / cmax) * 100]);
  const team = ['Андрей', 'Ольга', 'Данил'].map((w) => services.people[w]);
  return (
    <>
      <div className={styles.cHead}>
        <h3 className={styles.dTitle}>{d.title}</h3>
        <div className={styles.cTools}>
          <span className={`${styles.cPill} ${styles.cPillOn}`}>{d.period}</span>
          {d.sources.map((x) => <span key={x} className={styles.cPill}>{x}</span>)}
          <span className={styles.cAvas}>{team.map((p) => <Face key={p.name} src={p.face} name={p.name} size={30} />)}<i>Вы</i></span>
        </div>
      </div>
      <div className={styles.cGrid}>
        <div className={`${styles.tile} ${styles.tLeads}`} style={{ '--i': 0 } as React.CSSProperties}>
          <span className={styles.tLabel}>{d.leads.label}</span><span className={styles.tArrow}>↗</span>
          <b className={`num ${styles.tBig}`}>{d.leads.value}</b>
          <span className={styles.tSub}><em>{d.leads.delta}</em> {d.leads.deltaLabel}</span>
          <div className={styles.hBars}>
            {d.leads.week.map((v, i) => (
              <div key={i} className={i === peak ? styles.hPeak : ''}>
                <i style={{ height: `${(v / max) * 78}%`, '--i': i } as React.CSSProperties}>{i === peak && <em>{v}</em>}</i>
                <span>{d.leads.days[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`${styles.tile} ${styles.tSpend}`} style={{ '--i': 1 } as React.CSSProperties}>
          <span className={styles.tLabel}>{d.spend.label}</span><span className={styles.tArrow}>↗</span>
          <div className={styles.tRow}><b className={`num ${styles.tBig}`}>{d.spend.value}</b><span className={styles.tSub}>{d.spend.of}</span></div>
          <div className={styles.line}>
            <div className={styles.lineArea} style={{ clipPath: `polygon(0% 100%, ${pts.map(([a, b]) => `${a}% ${b}%`).join(', ')}, 100% 100%)` }} />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden><polyline points={pts.map(([a, b]) => `${a},${b}`).join(' ')} /></svg>
            {pts.map(([a, b], i) => <i key={i} className={i === d.spend.pin ? styles.dotOn : ''} style={{ left: `${a}%`, top: `${b}%` }} />)}
            <em className={styles.linePin} style={{ left: `${pts[d.spend.pin][0]}%`, top: `${pts[d.spend.pin][1]}%` }}>{d.spend.pinLabel}</em>
          </div>
        </div>
        <div className={`${styles.tile} ${styles.tPrice}`} style={{ '--i': 2 } as React.CSSProperties}>
          <span className={styles.tLabel}>{d.price.label}</span><span className={styles.tArrow}>↗</span>
          <b className={`num ${styles.tBig}`}>{d.price.value}</b>
          <span className={styles.tSub}>{d.price.norm}</span>
          <ul className={styles.split}>{d.price.split.map(([l, v]) => <li key={l}><span style={{ width: `${v}%` }}>{l}</span><b className="num">{v} %</b></li>)}</ul>
        </div>
        <div className={`${styles.tile} ${styles.tFeed}`} style={{ '--i': 3 } as React.CSSProperties}>
          <span className={styles.tLabel}>{d.feedLabel}</span><span className={styles.tLive} />
          <ul className={styles.feed2}>
            {d.feed.map(([n, sub, st, t], i) => (
              <li key={n} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.fAva}>{n[0].toUpperCase()}</span>
                <span className={styles.fTxt}><b>{n}</b><small>{sub}</small></span>
                <em className={t === 'ok' ? styles.fOk : styles.fNo}>{st}</em>
              </li>
            ))}
          </ul>
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
