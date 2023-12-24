import { styleVariants } from "@vanilla-extract/css";

import { vars } from "../../theme.css";

// TODO
/**
 * This should have a transition from
 * ```css
 * background: linear-gradient(0deg, rgba(232, 232, 242, 0.66), rgba(232, 232, 242, 0.66)), linear-gradient(180deg, #FFEBB8 0%, #FED874 100%);
 * ```
 * to
 * ```css
 * background: linear-gradient(180deg, #FFEBB8 0%, #FED874 100%);
 * ```
 * over 200ms
 */
export const eliteIconPath = styleVariants({
  inactive: {},
  active: {
    fill: "url(#rarity5)",
  },
});

export const eliteZeroIconPath = styleVariants({
  inactive: {
    fill: "transparent",
    stroke: vars.colors.neutrals.midtoneBrighterer,
  },
  active: { fill: "transparent", stroke: vars.colors.neutrals.white },
});
