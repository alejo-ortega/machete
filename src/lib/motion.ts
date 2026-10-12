import type { Transition } from "motion/react";

/** Sliding indicators (selection, active nav, segmented control). */
export const glide: Transition = { type: "spring", stiffness: 720, damping: 46, mass: 0.6 };

/** Elements entering or leaving. */
export const ease: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };
