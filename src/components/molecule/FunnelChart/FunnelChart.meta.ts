import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { FunnelChart } from './FunnelChart';
export default defineMeta({
  tier: 'molecule', name: 'FunnelChart',
  description: 'Ordinal funnel: one hue with monotone lightness steps (re-stepped for the dark surface), horizontal bars on a shared hairline baseline, 16 px thick, 4 px rounded data-end and square baseline end. Labels, values and step-conversions are real text in text tokens, so nothing is colour-only; a table view sits in a disclosure. Up to 5 ordinal steps - a 6th stage reuses the darkest step rather than inventing a hue.',
  props: [
    { name: 'stages', type: 'FunnelStage[]', required: true, description: '{ key, label, value, hint? } in funnel order (widest first).' },
    { name: 'caption', type: 'string', required: true, description: 'Figure caption; a single series needs no legend.' },
    { name: 'unitLabel', type: 'string', description: 'What one unit is, e.g. "sessions".' },
    { name: 'stepLabel', type: 'string', description: 'Suffix for the step-conversion column.' },
    { name: 'tableFallback', type: 'ReactNode', description: 'The same numbers as a table, in a disclosure.' },
    { name: 'tableLabel', type: 'string', default: 'Table view', description: 'Disclosure summary.' },
  ],
  states: ['default', 'empty (all zero)'],
  usages: [{ title: 'Five-stage funnel', render: () => h(FunnelChart, { caption: 'Sessions by stage', unitLabel: 'sessions', stepLabel: 'of previous', stages: [{ key: 'outreach_open', label: 'Outreach opened', value: 42 }, { key: 'view', label: 'Page viewed', value: 31 }, { key: 'demo_open', label: 'Demo opened', value: 18 }, { key: 'booking_started', label: 'Booking started', value: 7 }, { key: 'booking_confirmed', label: 'Booking confirmed', value: 4 }] }) }],
  a11y: ['The SVG is aria-hidden; every label, value and conversion is text, so screen readers and forced-colors users get the whole chart.', 'Each bar carries an SVG <title> for a pointer tooltip; the disclosure table is the non-hover path.', 'Colour carries order only, never identity; the ordinal ramp is validated for monotone lightness and light-end contrast in both themes.'],
  usedBy: ['A-01'],
});
