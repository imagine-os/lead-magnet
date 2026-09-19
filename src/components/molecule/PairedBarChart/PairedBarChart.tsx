import type { ReactNode } from 'react';
import { componentAttr } from '../../../design/meta';
import './PairedBarChart.css';

export interface PairedSeries { key: string; label: string; /** Optional second line under the legend label, e.g. the archetype. */ note?: string }
export interface PairedRow { key: string; label: string; /** One value per series, in series order. */ values: number[] }
export interface PairedBarChartProps {
  /** Exactly two series: identity, not order. Slot 1 and slot 2 of the categorical pair, never recoloured by rank. */
  series: [PairedSeries, PairedSeries];
  rows: PairedRow[];
  /** Figure caption; with two series the legend below it carries identity. */
  caption: string;
  /** What one unit is, e.g. "sessions". */
  unitLabel?: string;
  /** The same numbers as a table, in a disclosure (never gated behind hover). */
  tableFallback?: ReactNode;
  tableLabel?: string;
}

/**
 * Two series, one shared scale. Grouped horizontal bars on a shared hairline baseline: 14 px thick, 4 px rounded
 * data-end, a 2 px surface gap between the pair, both bars measured against the same maximum so the two sides are
 * actually comparable (a self-normalised small multiple is the classic A/B misread).
 * Colour is categorical (two fixed slots) and is never the only encoding: each bar carries its series letter and its
 * value as text, the legend names both, and a table view sits under the chart.
 */
export function PairedBarChart({ series, rows, caption, unitLabel, tableFallback, tableLabel = 'Table view' }: PairedBarChartProps) {
  const max = Math.max(0, ...rows.flatMap((r) => r.values));
  return (<figure {...componentAttr('PairedBarChart')} className="pbc">
    <figcaption className="pbc-cap">{caption}{unitLabel && <span className="pbc-unit"> · {unitLabel}</span>}</figcaption>
    <ul className="pbc-legend">
      {series.map((s, i) => (<li key={s.key} className="pbc-legend-item">
        <span className={`pbc-swatch pbc-slot-${i + 1}`} aria-hidden />
        <span className="pbc-legend-label">{s.label}{s.note && <span className="pbc-legend-note"> · {s.note}</span>}</span>
      </li>))}
    </ul>
    <ol className="pbc-rows">
      {rows.map((r) => (<li className="pbc-row" key={r.key}>
        <span className="pbc-stage">{r.label}</span>
        <span className="pbc-pair">
          {series.map((s, i) => {
            const v = r.values[i] ?? 0;
            const width = max > 0 ? Math.max((v / max) * 100, v > 0 ? 1.5 : 0) : 0;
            return (<span className="pbc-bar" key={s.key}>
              <span className="pbc-tag" aria-hidden>{s.key}</span>
              <span className="pbc-plot">
                <svg className="pbc-svg" height="18" width="100%" aria-hidden="true" focusable="false">
                  <title>{`${s.label} · ${r.label}: ${v}`}</title>
                  <rect x="0" y="2" height="14" width={`${width}%`} rx="4" className={`pbc-mark pbc-slot-${i + 1}`} />
                  {v > 0 && <rect x="0" y="2" height="14" width="4" className={`pbc-mark pbc-slot-${i + 1}`} />}
                </svg>
              </span>
              <span className="pbc-val">{v.toLocaleString()}</span>
              <span className="sr-only">{`${s.label}: ${v}`}</span>
            </span>);
          })}
        </span>
      </li>))}
    </ol>
    {tableFallback && <details className="pbc-table"><summary>{tableLabel}</summary><div className="pbc-table-body">{tableFallback}</div></details>}
  </figure>);
}
