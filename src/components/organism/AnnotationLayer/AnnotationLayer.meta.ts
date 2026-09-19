import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { AnnotationLayer } from './AnnotationLayer';
import { COMPONENT_CLASS_HINTS, stableSelector, nearestComponent } from './elementPath';

export default defineMeta({
  tier: 'organism', name: 'AnnotationLayer',
  description: 'T49 annotation pins: an Annotate toggle that turns any element into a target, a modal that files a feedback row with element_path / component / viewport / theme, numbered pins anchored to their element, and a drawer listing every pin on the page (including ones whose element is gone). Mounted once by DevTools for dev mode and anyone with feedback.read.',
  props: [
    { name: 'pageCode', type: 'string', required: true, description: 'Spec code of the current route; pins are scoped to it.' },
    { name: 'route', type: 'string', required: true, description: 'Route path recorded on every row.' },
  ],
  states: ['hidden (no dev mode, no feedback.read)', 'idle with pins', 'annotate mode', 'filing (modal)', 'thread open', 'drawer open', 'orphaned pin'],
  usages: [{
    title: 'Live on this page',
    render: () => h('div', { className: 'stack' },
      h('p', { className: 'small muted' }, 'Mounted by DevTools on every route: the Annotate toggle sits above the Feedback button, bottom right. Turn it on and click any element.'),
      h('p', { className: 'xs mono faint' }, `${COMPONENT_CLASS_HINTS.length} class hints map an unlabelled element to a library component until every component carries data-component.`),
      h(AnnotationLayer, { pageCode: 'D-02', route: '/dev/components' })),
  }, {
    title: 'What a click records',
    render: () => {
      const el = typeof document !== 'undefined' ? document.body : null;
      return h('p', { className: 'xs mono' }, el ? `${nearestComponent(el)} · ${stableSelector(el)}` : '—');
    },
  }],
  a11y: [
    'The toggle and every pin are real buttons with 44 px targets (the pin keeps a transparent 44 px halo around a 28 px dot).',
    'Annotate mode is keyboard-complete: Tab to an element and press Enter to file against it; Escape leaves the mode.',
    'Outlines in annotate mode show on :hover AND :focus-visible, so the mode is not hover-only (P-03).',
    'The layer is pointer-transparent and hides pins whose element is gone, so it can never cover a control (R-F03).',
  ],
  usedBy: ['D-09', 'D-02'],
});
