import type { ReactNode } from 'react';
import './FunnelChart.css';

export interface FunnelStage { key: string; label: string; value: number; hint?: string }
export interface FunnelChartProps {
  stages: FunnelStage[];
  /** Read as the figure caption; names what is plotted (a single ordinal series needs no legend). */
  caption: string;
  /** What one unit is, e.g. "sessions". */
  unitLabel?: string;
  /** Rendered inside a disclosure under the chart: the same numbers as a table (never gated behind hover). */
  tableFallback?: ReactNode;
  tableLabel?: string;
  /** Label for the step-conversion column, e.g. "of previous step". */
  stepLabel?: string;
}
const MAX_STEPS = 5;
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

/**
 * Ordinal funnel: one hue, monotone lightness steps (light -> dark, dark mode stepped for the dark surface),
 * horizontal bars against a shared baseline, 16 px thick with a 4 px rounded data-end and a square baseline end.
 * Labels and values are real text in text tokens, so the SVG is decorative and the numbers are never colour-only.
 */
export function FunnelChart({ stages, caption, unitLabel, tableFallback, tableLabel = 'Table view', stepLabel }: FunnelChartProps) {
  const top = Math.max(...stages.map((s) => s.value), 0);
  return (<figure className="funnel">
    <figcaption className="funnel-cap">{caption}{unitLabel && <span className="funnel-unit"> · {unitLabel}</span>}</figcaption>
    <ol className="funnel-rows">
      {stages.map((s, i) => {
        const width = top > 0 ? Math.max((s.value / top) * 100, s.value > 0 ? 1.5 : 0) : 0;
        const step = Math.min(i + 1, MAX_STEPS);
        const prev = i > 0 ? stages[i - 1] : null;
        return (<li className="funnel-row" key={s.key}>
          <span className="funnel-label">{s.label}</span>
          <span className="funnel-plot">
            <svg className="funnel-svg" height="20" width="100%" aria-hidden="true" focusable="false">
              <title>{`${s.label}: ${s.value}`}</title>
              <rect x="0" y="2" height="16" width={`${width}%`} rx="4" className={`funnel-mark funnel-step-${step}`} />
              {s.value > 0 && <rect x="0" y="2" height="16" width="4" className={`funnel-mark funnel-step-${step}`} />}
            </svg>
          </span>
          <span className="funnel-value">{s.value.toLocaleString()}</span>
          <span className="funnel-drop">{prev ? `${pct(s.value, prev.value)} %${stepLabel ? ` ${stepLabel}` : ''}` : (s.hint ?? '')}</span>
        </li>);
      })}
    </ol>
    {tableFallback && <details className="funnel-table"><summary>{tableLabel}</summary><div className="funnel-table-body">{tableFallback}</div></details>}
  </figure>);
}
