import { hero } from '../../content/texts';
import { Wire } from '../../ui/Wire';
import { Curves } from '../../ui/Curves';
import { Dot } from '../../ui/Tag';
import s from './Hero.module.css';
import v from './HeroV2.module.css';

function Head({ label, trend = false }: { label: string; trend?: boolean }) {
  return (
    <div className={s.head}>
      <span className="label">{label}</span>
      {trend && <span className={s.trend} aria-hidden><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9 9 1M3 1h6v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
    </div>
  );
}

/* V2: проволочные объекты и кривые вместо плоских диаграмм */
export function HeroCardV2({ i }: { i: number }) {
  switch (i) {
    case 0: // ниши — пилюли как UI-плитка референса
      return (
        <div className={`${s.inner} ${s.white}`}>
          <Head label="Ниша" />
          <div className={v.pills}>
            {hero.niches.map((n, k) => (
              <span key={n} className={`${v.pill} ${k === 0 ? v.pillOn : ''}`} style={{ width: ['88%', '72%', '54%', '62%', '58%'][k] }}>
                <i className={v.pillIcon} /><span>{n}</span>
              </span>
            ))}
          </div>
          <div className={s.chipsBottom}>{hero.channels.map((n) => <span key={n} className={`${s.chip} ${s.chipDark}`}>{n}</span>)}</div>
        </div>
      );
    case 1: // 9 из 10 — сфера из штрихов, десятая доля подсвечена
      return (
        <div className={`${s.inner} ${s.white}`}>
          <Head label="Запуски" trend />
          <div className={v.sphere}><Wire kind="dots" faded={0.1} accent="#ffe14d" stroke={1} speed={0.8} /></div>
          <div>
            <div className={`num ${s.big}`}>9 <span className={s.bigMute}>из 10</span></div>
            <p className={s.caption}>запусков — заявки в 1-й день</p>
          </div>
        </div>
      );
    case 2: // пилюля на градиенте неба, как «Agent»
      return (
        <div className={`${s.inner} ${s.glass} ${v.agent}`}>
          <span className={v.agentPill}><Dot /><span>{hero.card.label}</span><span className={`num ${v.agentTime}`}>{hero.card.time}</span></span>
          <p className={v.agentText}>{hero.card.text}</p>
        </div>
      );
    case 3: // тёмная: светящееся кольцо + мысль
      return (
        <div className={`${s.inner} ${s.dark}`}>
          <Head label="Поток" />
          <div className={v.glow}><i /></div>
          <p className={s.idea}><span>{hero.mainIdea[0]}</span> <span className={s.ideaMute}>{hero.mainIdea[1]}</span> <span>{hero.mainIdea[2]}</span></p>
        </div>
      );
    default: // бюджет — семейство кривых на сетке
      return (
        <div className={`${s.inner} ${s.white}`}>
          <Head label="Бюджет на рекламу" trend />
          <div className={v.curves}><Curves color="#121316" accent="#ffe14d" /></div>
          <div>
            <div className={`num ${s.big}`}>от 2 000 ₽</div>
            <p className={s.caption}>в день</p>
          </div>
        </div>
      );
  }
}
