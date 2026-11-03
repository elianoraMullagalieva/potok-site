import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

/* Картинка грузится, только когда до неё остаётся ~600px прокрутки.
   Стандартный loading="lazy" начинает качать слишком рано (за 1,5–2,5 тыс. px), и первый экран ждёт чужие фото */
const io = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const img = e.target as HTMLImageElement;
        const src = img.dataset.lazySrc; if (src) img.src = src;
        img.removeAttribute('data-lazy-src');
        io!.unobserve(img);
      }
    }, { rootMargin: '600px 0px 600px 0px' })
  : null;

export function LazyImg({ src, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [eager] = useState(() => !io);
  useEffect(() => {
    const el = ref.current; if (!el || !io || !src) return;
    el.dataset.lazySrc = src;
    io.observe(el);
    return () => io.unobserve(el);
  }, [src]);
  // прозрачный пиксель до загрузки, размеры задаются стилями как у обычной картинки
  return <img ref={ref} src={eager ? src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} {...rest} />;
}
