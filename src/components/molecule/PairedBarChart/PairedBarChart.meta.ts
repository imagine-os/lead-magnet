import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PairedBarChart } from './PairedBarChart';
export default defineMeta({
  tier: 'molecule', name: 'PairedBarChart',
  description: 'Two series compared stage by stage on ONE shared scale: grouped horizontal bars, 14 px thick, 4 px rounded data-end, a 2 px surface gap inside each pair. Built for an A/B readout, where two self-normalised funnels would be the classic misread. Colour is a validated two-slot categorical pair (identity, never rank); every bar also carries its series letter and its value as text, and a table view sits in a disclosure.',
  props: [
    { name: 'series', type: '[PairedSeries, PairedSeries]', required: true, description: '{ key (short tag, e.g. "A"), label, note? } - exactly two.' },
    { name: 'rows', type: 'PairedRow[]', required: true, description: '{ key, label, values: [seriesA, seriesB] } in row order.' },
    { name: 'caption', type: 'string', required: true, description: 'Figure caption; the legend under it carries identity.' },
    { name: 'unitLabel', type: 'string', description: 'What one unit is, e.g. "sessions".' },
    { name: 'tableFallback', type: 'ReactNode', description: 'The same numbers as a table, in a disclosure.' },
    { name: 'tableLabel', type: 'string', default: 'Table view', description: 'Disclosure summary.' },
  ],
  states: ['default', 'one side empty', 'both zero'],
  usages: [{ title: 'A/B funnel, shared scale', render: () => h(PairedBarChart, {
    caption: 'Sessions by funnel stage', unitLabel: 'sessions',
    series: [{ key: 'A', label: 'Variant A', note: 'reveal' }, { key: 'B', label: 'Variant B', note: 'audit' }],
    rows: [{ key: 'outreach_open', label: 'Outreach opened', values: [41, 44] }, { key: 'view', label: 'Page viewed', values: [34, 36] }, { key: 'demo_open', label: 'Demo opened', values: [12, 19] }, { key: 'booking_started', label: 'Booking started', values: [4, 8] }, { key: 'booking_confirmed', label: 'Booking confirmed', values: [2, 6] }],
  }) }],
  a11y: [
    'The SVG is aria-hidden; each bar repeats its series and value as text (visible value + an sr-only "Variant B: 19"), so the chart is never colour-only.',
    'Both series are named in the legend and tagged A / B on every bar - identity survives greyscale, forced-colors and print.',
    'One shared maximum across both series: bar length is comparable between the two sides, which is the whole point of the pair.',
    'The table view is a disclosure, not a hover: pointer tooltips (<title>) are an extra, never the only path to a number.',
  ],
  usedBy: ['A-01'],
});
