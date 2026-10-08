import { useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap } from '../../lib/lenis';
import { quiz } from '../../content/texts';
import { SkyStatic } from '../../ui/Sky';
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
          <div className={styles.valueHead}>
            <span className={`label ${styles.valueLabel}`}>{quiz.value.label}</span>
            <h3 className={styles.valueTitle}>{quiz.value.title}</h3>
            <p className={styles.valueText}>{quiz.value.text}</p>
          </div>
          {/* ценность связки: объявление, квиз, бот, CRM */}
          <div className={styles.minis} aria-hidden>
            <div className={`${styles.mini} ${styles.miniAd}`}>
              <span className={styles.miniTag}>{quiz.value.minis.ad.tag}</span>
              <i className={styles.miniPic}><SkyStatic id="speed" /></i>
              <b>{quiz.value.minis.ad.title}</b>
              <small>{quiz.value.minis.ad.line}</small>
            </div>
            <div className={`${styles.mini} ${styles.miniQuiz}`}>
              <span className={styles.miniTag}>{quiz.value.minis.quiz.tag}</span>
              <b>{quiz.value.minis.quiz.q}</b>
              <span className={styles.miniOpts}>{quiz.value.minis.quiz.a.map((x, i) => <i key={x} className={i === 1 ? styles.miniOptOn : ''}>{x}</i>)}</span>
            </div>
            <div className={`${styles.mini} ${styles.miniBot}`}>
              <span className={styles.miniTag}>{quiz.value.minis.bot.tag}</span>
              <span className={styles.bubble}>{quiz.value.minis.bot.msg}</span>
            </div>
            <div className={`${styles.mini} ${styles.miniCrm}`}>
              <span className={styles.miniTag}>{quiz.value.minis.crm.tag}</span>
              <b className="num">{quiz.value.minis.crm.value}</b>
              <span className={styles.bars}>{[40, 55, 48, 70, 64, 86, 100].map((h, i) => <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />)}</span>
            </div>
          </div>
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
