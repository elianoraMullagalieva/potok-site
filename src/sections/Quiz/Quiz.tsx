import { useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap } from '../../lib/lenis';
import { quiz } from '../../content/texts';
import { SkyStatic } from '../../ui/Sky';
import { Face } from '../../ui/Face';
import { services, hero, benefits } from '../../content/texts';
import { Segments } from '../Hero/Hero';
import { Button } from '../../ui/Button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './Quiz.module.css';

/* Результат по правилу из текстов: «Пока не знаю»/«Ничего» → Тест; «Агентство»/«Фрилансер» → Ведение; нестандартная ниша → Связка */
function plan(answers: (number | null)[]) {
  const [niche, , budget, tried] = answers;
  if (budget === 3 || tried === 0) return quiz.plans.test;
  if (tried === 1 || tried === 2) return quiz.plans.lead;
  if (niche === 3) return quiz.plans.custom;
  return quiz.plans.test;
}

export function Quiz() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0); // 0..3 вопросы, 4 финал
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [sent, setSent] = useState(false);
  const reduced = useReducedMotion();
  const answered = answers.filter((a) => a !== null).length;

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.card}`, { y: 80, opacity: 0, scale: 0.97, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from(`.${styles.h2}`, { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 80%' } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // смена шага: панель вопроса уезжает влево, новая приезжает справа
  const pane = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const go = (next: number) => {
    if (busy.current && !reduced) return;
    if (reduced || !pane.current) { setStep(next); busy.current = false; return; }
    busy.current = true;
    gsap.killTweensOf(pane.current);
    gsap.to(pane.current, { x: next > step ? -24 : 24, opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: true, onComplete: () => {
      setStep(next);
      gsap.fromTo(pane.current, { x: next > step ? 24 : -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out', overwrite: true, onComplete: () => { busy.current = false; } });
    } });
  };
  const choose = (i: number) => {
    if (busy.current) return;
    busy.current = true;
    const a = [...answers]; a[step] = i; setAnswers(a);
    const from = step;
    setTimeout(() => { busy.current = false; go(Math.min(from + 1, 4)); }, 320);
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = { name: fd.get('name'), contact: fd.get('contact'), answers: answers.map((a, i) => (a === null ? null : quiz.questions[i].a[a])), plan: plan(answers) };
    const token = import.meta.env.VITE_TG_TOKEN, chat = import.meta.env.VITE_TG_CHAT;
    if (token && chat) {
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: `Квиз · ${payload.plan}\n${payload.name} · ${payload.contact}\n${payload.answers.join(' · ')}` }) }).catch(() => {});
    }
    setSent(true);
  };

  const q = quiz.questions[step];
  const fill = (answered / 4) * 100;

  return (
    <section id="quiz" ref={root} className={`wrap ${styles.section}`}>
      <h2 className={`display ${styles.h2}`}>{quiz.title}</h2>
      <div className={styles.card}>
        {/* левая колонка: вопрос или финал */}
        <div className={styles.left}>
          <div className={styles.top}>
            <span className={`label ${styles.progressLabel}`}>{step < 4 ? quiz.progress(step + 1) : quiz.title}</span>
            {step < 4
              ? <span className={styles.steps} aria-hidden>{[0, 1, 2, 3].map((i) => <i key={i} className={i < answered ? styles.stepOn : ''} />)}</span>
              : <span className={styles.plan}>{plan(answers)}</span>}
          </div>
          <div ref={pane} className={styles.pane}>
            {step < 4 ? (
              <>
                <h3 className={styles.q}>{q.q}</h3>
                <ul className={styles.options}>
                  {q.a.map((o, i) => (
                    <li key={o}>
                      <button type="button" className={`${styles.opt} ${answers[step] === i ? styles.optOn : ''}`} onClick={() => choose(i)}>
                        <span className={styles.optFill} aria-hidden /><span className={styles.optText}>{o}</span>
                        <span className={styles.optIdx} aria-hidden>{i + 1}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {step > 0 && <button type="button" className={styles.back} onClick={() => go(step - 1)}>← {quiz.back}</button>}
              </>
            ) : sent ? (
              <div className={styles.done}><span className={styles.check} aria-hidden>✓</span><h3 className={styles.q}>{quiz.final.done}</h3></div>
            ) : (
              <form className={styles.form} onSubmit={submit}>
                <h3 className={styles.q}>{quiz.final.title}</h3>
                <p className={styles.sub}>{quiz.final.sub}</p>
                <div className={styles.insideBlock}>
                  <span className="label mute">{quiz.final.insideLabel}</span>
                  <ul className={styles.inside}>{quiz.final.inside.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
                <p className={styles.bonus}><i aria-hidden /><b>Бонус</b><span>{quiz.final.bonus}</span></p>
                <div className={styles.fields}>
                  <input name="name" required placeholder={quiz.final.name} aria-label={quiz.final.name} className={styles.input} autoComplete="name" />
                  <input name="contact" required placeholder={quiz.final.contact} aria-label={quiz.final.contact} className={styles.input} autoComplete="tel" />
                </div>
                <label className={styles.consent}><input type="checkbox" required /> <span>{quiz.final.consent}</span></label>
                <Button variant="primary" arrow type="submit" className={styles.cta}>{quiz.final.cta}</Button>
                <button type="button" className={styles.back} onClick={() => go(3)}>← {quiz.back}</button>
              </form>
            )}
          </div>
        </div>

        {/* правая колонка: небо и «О», которая заливается за каждый ответ */}
        <div className={styles.right}>
          <SkyStatic id="quiz" />
          <Value answers={answers} step={step} />
          <div className={styles.o} aria-hidden>
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <defs><clipPath id="oFill"><rect x="0" y="0" width="200" height="200" style={{ transform: `translateY(${200 - fill * 2}px)`, transition: 'transform 1s cubic-bezier(.16,1,.3,1)' }} /></clipPath></defs>
              <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="18" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="var(--yellow)" strokeWidth="18" clipPath="url(#oFill)" />
            </svg>
            <span className={`num ${styles.pct}`}>{fill}%</span>
          </div>
          <ul className={styles.picked}>
            {answers.map((a, i) => a === null ? null : <li key={i} className={styles.pick}>{quiz.questions[i].a[a]}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}


/* Правая панель: один аргумент на шаг, доказательство цифрой, живой элемент и растущий список выгод */
function Value({ answers, step }: { answers: (number | null)[]; step: number }) {
  const i = Math.min(step, 4);
  const st = quiz.steps[i];
  const person = services.people[quiz.speaker];
  const answered = answers.filter((a) => a !== null).length;
  return (
    <div className={styles.val}>
      <div className={styles.say} key={`s${i}`}>
        <Face src={person.face} name={person.name} size={40} />
        <div>
          <div className={styles.sayName}>{person.name} <span>· {person.role}</span></div>
          <p className={styles.sayText}>{quiz.say[i]}</p>
        </div>
      </div>

      <div className={styles.slide} key={`v${i}`}>
        <div className={styles.slideText}>
          <h3 className={styles.vTitle}>{st.title}</h3>
          <p className={styles.vSub}>{st.sub}</p>
          <div className={styles.proof}><b className="num">{st.proof}</b><span>{st.proofLabel}</span></div>
        </div>
        <div className={styles.visual}><Visual kind={st.visual} /></div>
      </div>

      <ul className={styles.gains}>
        <li className={styles.gainsLabel}>{quiz.gainsLabel}</li>
        {quiz.steps.slice(0, 4).map((g, k) => (
          <li key={g.gain} className={k < answered ? styles.gainOn : ''}>
            <i aria-hidden>{k < answered && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.6 2.6L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}</i>
            <span>{g.gain}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Живые элементы в стиле карточек героя */
function Visual({ kind }: { kind: string }) {
  if (kind === 'ad') return (
    <div className={`${styles.vcard} ${styles.vcDark}`}>
      <span className={styles.vcTag}>Avito Ads</span>
      <i className={styles.vcPic}><SkyStatic id="speed" /></i>
      <b>Промышленные ворота</b>
      <small>Н. Новгород · связка готова</small>
    </div>
  );
  if (kind === 'crm') return (
    <div className={`${styles.vcard} ${styles.vcGlass}`}>
      <div className={styles.notif}>
        <span className={styles.appIcon}>a</span>
        <div>
          <div className={styles.nHead}><span>{hero.card.app}</span><span>{hero.card.time}</span></div>
          <div className={styles.nTitle}>{hero.card.label}</div>
          <div className={styles.nText}>{hero.card.text}</div>
        </div>
      </div>
      <small className={styles.vcUnder}>{hero.card.under}</small>
    </div>
  );
  if (kind === 'budget') return (
    <div className={styles.vcard}>
      <span className={styles.vcTag}>Бюджет на рекламу</span>
      <b className={`num ${styles.vcBig}`}>от 2 000 ₽</b>
      <small>в день</small>
      <span className={styles.bars}>{[30, 44, 40, 58, 54, 72, 68, 90, 100].map((h, k) => <i key={k} style={{ height: `${h}%`, animationDelay: `${k * 0.07}s` }} />)}</span>
    </div>
  );
  if (kind === 'team') return (
    <div className={`${styles.vcard} ${styles.vcDark}`}>
      <span className={styles.vcTag}>Поток</span>
      <span className={styles.faces}>{benefits.team.map((t) => <Face key={t.initials} src={t.face} name={t.name} size={44} />)}</span>
      <b>{hero.mainIdea[0]}</b>
      <small>{hero.mainIdea[1]}</small>
    </div>
  );
  return (
    <div className={styles.vcard}>
      <span className={styles.vcTag}>Запуски</span>
      <b className={`num ${styles.vcBig}`}>9 <span>из 10</span></b>
      <span data-live="1" className={styles.segWrap}><Segments total={10} filled={9} /></span>
      <small>запусков — заявки в 1-й день</small>
    </div>
  );
}
