import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { DataTable } from './DataTable';
import { Badge } from '../../atom/Badge/Badge';
type R = { id: string; tool: string; cost: number; status: string };
const rows: R[] = [{ id: '1', tool: 'Toast POS', cost: 495, status: 'guessed' }, { id: '2', tool: '7shifts', cost: 105, status: 'confirmed' }, { id: '3', tool: 'QuickBooks Online', cost: 90, status: 'rejected' }];
export default defineMeta({ tier: 'organism', name: 'DataTable', description: 'The one table: real <table> with caption, sticky head, zebra rows; rows become labelled cards under 768 px.', props: [{ name: 'columns', type: 'Column<T>[]', required: true, description: '' }, { name: 'rows', type: 'T[]', required: true, description: '' }, { name: 'caption', type: 'string', required: true, description: 'sr-only caption' }, { name: 'rowHref', type: '(row) => string', description: 'First cell becomes a link' }], states: ['default', 'empty', 'cards < 768'],
  usages: [{ title: 'Stack guesses', render: () => h(DataTable<R>, { caption: 'Stack guesses', rows, columns: [{ key: 'tool', header: 'Tool' }, { key: 'cost', header: '$ / mo', align: 'right' }, { key: 'status', header: 'Status', render: (r) => h(Badge, { tone: r.status === 'confirmed' ? 'success' : r.status === 'rejected' ? 'danger' : 'neutral' }, r.status) }] }) }], a11y: ['Semantic table with caption and th scope.', 'Card mode keeps header text as labels.'], usedBy: ['D-01', 'D-03', 'D-04', 'D-09'] });
