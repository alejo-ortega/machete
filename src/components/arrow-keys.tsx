import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

const icon = "size-2.5";

/** Arrow glyphs sized for a small keycap. */
export const arrows = {
  up: <ArrowUp aria-label="Up" className={icon} strokeWidth={2.5} />,
  down: <ArrowDown aria-label="Down" className={icon} strokeWidth={2.5} />,
  left: <ArrowLeft aria-label="Left" className={icon} strokeWidth={2.5} />,
  right: <ArrowRight aria-label="Right" className={icon} strokeWidth={2.5} />,
};
