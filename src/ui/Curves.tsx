/* Семейство кривых роста на сетке, как плитка Motion на референсе */
export function Curves({ color = 'currentColor', accent, w = 200, h = 110 }: { color?: string; accent?: string; w?: number; h?: number }) {
  const n = 6, pad = 8;
  const curve = (k: number) => {
    const x0 = pad + k * 10, x1 = w - pad - (n - 1 - k) * 10;
    const y0 = h - pad, y1 = pad;
    const cx = (x0 + x1) / 2;
    return `M${x0},${y0} C${cx + 20},${y0} ${cx - 20},${y1} ${x1},${y1}`;
  };
  const cols = Array.from({ length: 11 }, (_, i) => pad + (i / 10) * (w - pad * 2));
  const rows = Array.from({ length: 6 }, (_, i) => pad + (i / 5) * (h - pad * 2));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <g stroke={color} strokeOpacity="0.14" strokeWidth="0.75">
        {cols.map((x) => <line key={x} x1={x} y1={pad} x2={x} y2={h - pad} />)}
        {rows.map((y) => <line key={y} x1={pad} y1={y} x2={w - pad} y2={y} />)}
      </g>
      <line x1={pad} y1={pad} x2={w - pad} y2={pad} stroke={color} strokeOpacity="0.5" strokeWidth="1" />
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={color} strokeOpacity="0.5" strokeWidth="1" />
      {Array.from({ length: n }, (_, k) => (
        <path key={k} d={curve(k)} fill="none" stroke={k === n - 1 && accent ? accent : color} strokeOpacity={k === n - 1 ? 1 : 0.35 + k * 0.1} strokeWidth={k === n - 1 ? 1.8 : 1.1} strokeLinecap="round">
          {k === n - 1 && <animate attributeName="stroke-dasharray" values="0 400;400 0" dur="2.4s" fill="freeze" />}
        </path>
      ))}
      <circle cx={pad} cy={h - pad} r="2.6" fill={color} />
      <circle cx={w - pad} cy={pad} r="2.6" fill={accent ?? color} />
      <circle r="3" fill={accent ?? color}>
        <animateMotion dur="3.2s" repeatCount="indefinite" path={curve(n - 1)} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
      </circle>
    </svg>
  );
}
