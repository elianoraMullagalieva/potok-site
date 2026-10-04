import { useEffect, useState } from 'react';
export function useMedia(q: string) {
  const [m, setM] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const mq = matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    setM(mq.matches);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}
