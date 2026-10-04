/* Знаки клиентов: геометрия по смыслу ниши, один цвет, читаются в 20px */
export function CaseMark({ id, size = 36 }: { id: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 40 40', fill: 'none', 'aria-hidden': true } as const;
  switch (id) {
    case 'gates': // секционные ворота: створки и арка
      return (
        <svg {...p}><rect x="6" y="14" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2.4" /><path d="M6 20h28M6 26h28" stroke="currentColor" strokeWidth="2.4" /><path d="M8 14c2-6 7-9 12-9s10 3 12 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      );
    case 'steel': // ангар: ферма из треугольников
      return (
        <svg {...p}><path d="M5 32 20 8l15 24H5Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /><path d="M12.5 32 20 20l7.5 12M20 8v12" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>
      );
    default: // модули: три блока со сдвигом
      return (
        <svg {...p}><rect x="5" y="22" width="14" height="12" rx="3" fill="currentColor" /><rect x="21" y="22" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="2.4" /><rect x="13" y="7" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="2.4" /></svg>
      );
  }
}
