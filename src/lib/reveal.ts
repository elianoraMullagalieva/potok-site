/**
 * Плавное появление при прокрутке для всего, у чего нет своей анимации:
 * заголовки, подзаголовки, карточки. Соседи появляются по очереди.
 * Элементы, которые уже ведёт GSAP (у них есть инлайн-стиль) или CSS-анимация, не трогаем — чтобы эффекты не спорили.
 */
const SEL = [
  'section h2', 'section h3', 'section article',
  'section [class*="_card_"]', 'section [class*="_plan_"]', 'section [class*="_tile_"]',
  'section [class*="_sub_"]', 'section [class*="_item_"]', 'section [class*="_lead_"]',
].join(',');

export function initReveal(root: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('rvIn');
      io.unobserve(e.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const scan = () => {
    const hero = root.querySelector('section');
    root.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
      if (el.dataset.rv || hero?.contains(el)) return;
      el.dataset.rv = '1';
      if (el.closest('[data-rv-on]') || el.style.opacity || el.style.transform || el.style.visibility) return;
      if (getComputedStyle(el).animationName !== 'none') return;
      if (el.parentElement?.closest('[data-rv-on]')) return;
      // уже в кадре на момент разметки — не прячем, чтобы не мигало
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) return;
      const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => (c as HTMLElement).dataset.rvOn !== undefined) : [];
      el.style.setProperty('--rvd', `${Math.min(sibs.length, 5) * 80}ms`);
      el.dataset.rvOn = '';
      el.classList.add('rv');
      io.observe(el);
    });
  };
  // страховка: при быстрой прокрутке наблюдатель может пропустить элемент — проверяем, что уже на экране
  let raf = 0;
  const sweep = () => {
    raf = 0;
    root.querySelectorAll<HTMLElement>('.rv:not(.rvIn)').forEach((el) => {
      const r = el.getBoundingClientRect();
      // на экране или уже пролистан
      if (r.width && r.top < innerHeight * 0.95) { el.classList.add('rvIn'); io.unobserve(el); }
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(sweep); };
  window.addEventListener('scroll', onScroll, { passive: true });
  // блоки вне экрана: ставим их бесконечные CSS-анимации на паузу
  const blkIO = new IntersectionObserver((entries) => {
    for (const e of entries) (e.target as HTMLElement).classList.toggle('offscreen', !e.isIntersecting);
  }, { rootMargin: '150px 0px' });
  const watchBlocks = () => root.querySelectorAll<HTMLElement>(':scope > section, :scope > .blk, :scope > .skyBand, footer').forEach((b) => {
    if (b.dataset.pw) return; b.dataset.pw = '1'; blkIO.observe(b);
  });
  watchBlocks();
  // секции подгружаются лениво — досканируем, когда появляются новые
  let t = 0;
  const mo = new MutationObserver(() => { clearTimeout(t); t = window.setTimeout(() => { scan(); watchBlocks(); }, 700); });
  mo.observe(root, { childList: true, subtree: true });
  t = window.setTimeout(scan, 900);
  return () => { io.disconnect(); blkIO.disconnect(); mo.disconnect(); clearTimeout(t); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
}
