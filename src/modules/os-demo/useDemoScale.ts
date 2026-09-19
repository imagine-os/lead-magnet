import { useViewportAtLeast } from '../../a11y';

/**
 * The `--scale` band the demo is rendering in, as a number, for the few sizes CSS cannot reach: `Icon` and the inline
 * chart take a pixel `size` prop, so without this they stay 16 / 20 / 72 px next to type that is 2.25x bigger on a
 * 4K TV. The numbers mirror `src/styles/tokens.css` exactly (1920 / 2560 / 3840 -> 1.125 / 1.5 / 2.25, P-01); when a
 * band changes there, change it here.
 */
export function useDemoScale(): number {
  const tv = useViewportAtLeast(1920);
  const tv2 = useViewportAtLeast(2560);
  const tv4 = useViewportAtLeast(3840);
  return tv4 ? 2.25 : tv2 ? 1.5 : tv ? 1.125 : 1;
}
/** `px` grown into the current band, rounded to a whole pixel (icons are drawn on a 24-unit grid). */
export const useScaled = (px: number): number => Math.round(px * useDemoScale());
