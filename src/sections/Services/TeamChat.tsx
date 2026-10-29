import { useEffect, useRef, useState } from 'react';
import { services, benefits } from '../../content/texts';
import { Button } from '../../ui/Button';
import { Face } from '../../ui/Face';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './TeamChat.module.css';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
type Phase = 'idle' | 'dots' | 'type' | 'done';

/* Вариант Б: исполнитель сам рассказывает в чате, фраза печатается,
   а справа на «экране» он показывает инфографику к ней. По сообщению можно кликнуть — экран вернётся к нему. */
export function TeamChat({ n, lead, says }: { n: string; lead: string; says: string[] }) {
  const lines = services.chat[n];
  const person = services.people[lead];
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [view, setView] = useState(0);

  // старт, когда блок попал в экран
  useEffect(() => {
    const el = root.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // смена человека — разговор начинается заново
  useEffect(() => {
    if (reduced) { setShown(lines.length); setPhase('done'); setView(lines.length - 1); return; }
    setShown(0); setTyped(0); setView(0); setPhase(started ? 'dots' : 'idle');
  }, [n, started, reduced, lines.length]);

  // очередь: «печатает…» → текст по буквам → пауза, пока играет инфографика → следующая фраза
  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    let t = 0;
    if (shown >= lines.length) { setPhase('done'); return; }
    if (phase === 'dots') t = window.setTimeout(() => { setPhase('type'); setView(shown); }, 700);
    else if (typed < lines[shown].m.length) t = window.setTimeout(() => setTyped((x) => x + 2), 24);
    else t = window.setTimeout(() => { setShown((x) => x + 1); setTyped(0); setPhase('dots'); }, 1500);
    return () => window.clearTimeout(t);
  }, [phase, typed, shown, lines]);

  // лента держится на последнем сообщении
  useEffect(() => { const f = feed.current; if (f) f.scrollTo({ top: f.scrollHeight, behavior: 'smooth' }); }, [shown, typed, phase]);

  const cur = lines[view];
  return (
    <div ref={root} className={styles.box}>
      <div className={styles.portrait}>
        <img key={person.photo} src={asset(person.photo)} alt={person.name} loading="lazy" decoding="async" />
        <div className={styles.pCard}><b>{person.name}</b><span>{person.role} · {person.exp.split('.')[0]}</span></div>
      </div>

      <div className={styles.chat}>
        <div className={styles.cHead}>
          <Face src={person.face} name={person.name} size={38} />
          <div><b>{lead}</b><span className={phase === 'dots' ? styles.typing : styles.online}>{phase === 'dots' ? `${services.chatTyping}…` : services.chatOnline}</span></div>
        </div>
        <div ref={feed} className={styles.feed}>
          {lines.slice(0, shown).map((l, i) => (
            <button key={`${n}${i}`} type="button" className={`${styles.msg} ${view === i ? styles.msgOn : ''}`} onClick={() => setView(i)}>
              {l.m}<i>{l.cap}</i>
            </button>
          ))}
          {phase === 'type' && shown < lines.length && (
            <div className={`${styles.msg} ${styles.msgOn}`}>{lines[shown].m.slice(0, typed)}<span className={styles.caret} /></div>
          )}
          {phase === 'dots' && <div className={`${styles.msg} ${styles.dots}`}><span /><span /><span /></div>}
          {phase === 'done' && (
            <>
              <span className={styles.fromLabel}>{services.saysLabel}</span>
              {says.map((q, k) => <div key={q} className={styles.in} style={{ '--k': k } as React.CSSProperties}>{q}<time>{['10:42', '16:05'][k]}</time></div>)}
              <Button variant="primary" arrow href="#quiz" className={styles.reply}>{services.chatReply}</Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.screen}>
        <div className={styles.sHead}>
          <span>{services.chatShow} · <b>{cur.cap}</b></span>
          <span className={styles.sDots}>{lines.map((_, i) => <i key={i} className={i === view ? styles.sDotOn : i < shown ? styles.sDotSeen : ''} />)}</span>
        </div>
        <div key={`${n}-${view}`} className={styles.stage}>
          <Viz v={cur.v} n={n} line={cur} />
        </div>
      </div>
    </div>
  );
}

const st = (i: number) => ({ '--i': i } as React.CSSProperties);

function Viz({ v, n, line }: { v: string; n: string; line: { big?: string; pct?: number } }) {
  const it = services.items.find((x) => x.n === n)!;
  switch (v) {
    case 'hello':
      return (
        <div className={styles.vHello}>
          <span className={styles.vKicker}>Расскажу по порядку</span>
          <b className={styles.vZone}>{it.zone}</b>
          <ol>{services.chat[n].slice(1, 4).map((l, i) => <li key={l.cap} style={st(i)}><i>{i + 1}</i>{l.cap}</li>)}</ol>
        </div>
      );
    case 'match': {
      const niches = benefits.details.dark.niches.slice(0, 12);
      return (
        <div className={styles.vMatch}>
          <div className={styles.pills}>{niches.map((x, i) => <span key={x} className={i === 0 ? styles.pillWin : ''} style={st(i)}>{x}</span>)}</div>
          <div className={styles.found}><span>Связка найдена · Н. Новгород</span><div className={styles.meter}><i style={{ width: '94%' }} /></div><b className="num">94 %</b><em>совпадение с вашей нишей</em></div>
        </div>
      );
    }
    case 'launch':
      return (
        <div className={styles.vLaunch}>
          {[['Яндекс Директ', 'День 1'], ['Avito Ads', 'День 2']].map(([p, d], i) => (
            <div key={p} className={styles.lRow} style={st(i)}>
              <b>{p}</b><span className={styles.lDay}>{d}</span>
              <div className={styles.meter}><i /></div>
              <em className={styles.lOk}>активна</em>
            </div>
          ))}
          <div className={styles.lFirst}><i />Первая заявка · 14:20</div>
        </div>
      );
    case 'report': {
      const pts = [12, 30, 26, 44, 40, 58, 66];
      return (
        <div className={styles.vReport}>
          <div className={styles.kpi3}>{[['Расход', '28 400 ₽'], ['Заявки', '31'], ['Цена заявки', '916 ₽']].map(([l, val], i) => <div key={l} style={st(i)} className={i === 1 ? styles.kOn : ''}><span>{l}</span><b className="num">{val}</b></div>)}</div>
          <svg viewBox="0 0 300 90" className={styles.spark} aria-hidden><polyline points={pts.map((y, i) => `${i * 50},${90 - y}`).join(' ')} /></svg>
        </div>
      );
    }
    case 'page':
      return (
        <div className={styles.vPage}>
          <div className={styles.browser}>
            <div className={styles.bBar}><i /><i /><i /><span>vorota-nn.ru</span></div>
            <div className={styles.bHero} style={st(0)}><b>Промышленные ворота за 7 дней</b><span>Нижний Новгород · монтаж под ключ</span><em>Рассчитать цену</em></div>
            <div className={styles.bRow}>{[1, 2, 3].map((k) => <span key={k} style={st(k)} />)}</div>
          </div>
          <div className={styles.tags}>{['1 услуга', '1 город', '1 кнопка'].map((x, i) => <span key={x} style={st(i + 3)}>{x}</span>)}</div>
        </div>
      );
    case 'quiz':
      return (
        <div className={styles.vQuiz}>
          <div className={styles.qSteps}>{[1, 2, 3, 4].map((k) => <i key={k} style={st(k)} />)}</div>
          <div className={styles.qCard}><span>Вопрос 2 из 4</span><b>Какой размер проёма?</b>{['До 3 м', '3–5 м', 'Больше 5 м'].map((o, i) => <em key={o} className={i === 1 ? styles.qPick : ''}>{o}</em>)}</div>
          <div className={styles.found}><span>Доходят до конца</span><div className={styles.meter}><i style={{ width: '68%' }} /></div><b className="num">68 %</b><em>обычный квиз — около 30 %</em></div>
        </div>
      );
    case 'flow':
      return (
        <div className={styles.vFlow}>
          {['Квиз', 'CRM', 'Telegram'].map((x, i) => <div key={x} className={styles.node} style={st(i)}><b>{x}</b><span>{['Игорь · 4×5 м', 'Сделка создана', 'Новая заявка'][i]}</span></div>)}
          <span className={styles.flowDot} />
          <div className={styles.flowTime}><b className="num">0,8 с</b> от кнопки до вашего телефона</div>
        </div>
      );
    case 'crm':
      return (
        <div className={styles.vCrm}>
          {([['Новые', [['Игорь', 'ворота 4×5'], ['Олег', 'откатные'], ['Анна', 'шлагбаум']]], ['В работе', [['Марина', 'замер в пт'], ['Сергей', 'КП отправлено']]], ['Договор', [['Павел', '412 000 ₽']]]] as [string, string[][]][]).map(([c, cards], i) => (
            <div key={c} className={styles.col}><span>{c} · {cards.length}</span>{cards.map(([a, b], j) => <i key={a} style={st(i * 3 + j)} className={i === 2 ? styles.colWin : ''}><b>{a}</b>{b}</i>)}</div>
          ))}
        </div>
      );
    case 'filter':
      return (
        <div className={styles.vFilter}>
          {[['Игорь · +7 927 ···', 'целевая', 1], ['test · +7 000 ···', 'бот', 0], ['Марина · +7 917 ···', 'целевая', 1], ['Игорь · +7 927 ···', 'дубль', 0], ['Олег · +7 903 ···', 'целевая', 1]].map(([a, b, ok], i) => (
            <div key={i} className={`${styles.fRow} ${ok ? '' : styles.fBad}`} style={st(i)}><span>{a}</span><em>{b}</em></div>
          ))}
          <div className={styles.found}><span>Доходят до вас</span><div className={styles.meter}><i style={{ width: '55%' }} /></div><b className="num">55 %</b><em>остальное — боты, дубли и спам</em></div>
        </div>
      );
    case 'calls':
      return (
        <div className={styles.vCalls}>
          <div className={styles.waves}>{Array.from({ length: 30 }, (_, i) => <i key={i} className={[2, 5, 7, 11, 13, 16, 19, 22, 24, 27, 28, 29].includes(i) ? styles.wLost : ''} style={{ ...st(i), height: `${30 + ((i * 37) % 60)}%` }} />)}</div>
          <p className={styles.legend}><i />12 из 30 сорвались на вопросе о цене</p>
        </div>
      );
    case 'script':
      return (
        <div className={styles.vScript}>
          {['Приветствие и имя', 'Уточнить задачу', 'Ответ на «дорого»', 'Назвать срок', 'Договориться о замере'].map((x, i) => <div key={x} style={st(i)} className={i === 2 || i === 4 ? styles.hl : ''}><i className="num">{i + 1}</i>{x}</div>)}
        </div>
      );
    case 'compare':
      return (
        <div className={styles.vCompare}>
          {[['До разбора', 8], ['Через месяц', 16]].map(([l, p], i) => <div key={l as string} className={styles.cmp}><div className={styles.cBar}><i style={{ height: `${(p as number) * 5}%`, ...st(i) } as React.CSSProperties} className={i ? styles.cWin : ''} /></div><b className="num">{p} %</b><span>{l}</span></div>)}
          <em className={styles.x2}>×2</em>
        </div>
      );
    case 'stat': {
      const r = 54, c = 2 * Math.PI * r;
      return (
        <div className={styles.vStat}>
          <svg viewBox="0 0 140 140" aria-hidden><circle cx="70" cy="70" r={r} className={styles.rBg} /><circle cx="70" cy="70" r={r} className={styles.rFg} style={{ strokeDasharray: c, '--off': c * (1 - (line.pct ?? 100) / 100), '--c': c } as React.CSSProperties} /></svg>
          <b className="num">{line.big}</b>
          <span>{it.stat.text}</span>
        </div>
      );
    }
  }
  return null;
}
