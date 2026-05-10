/**
 * Hydride-domain validation checklist.
 *
 * These are the physics steps the X-Hydride Lab pipeline expects to be
 * addressed before any candidate can be promoted out of "exploratory
 * hypothesis" status. The list is deliberately short: each item maps to a
 * concrete computational or experimental task.
 *
 * The list is consumed by:
 *   - The candidate-generation system prompt (so the model is instructed to
 *     include the appropriate items in `validation_steps`).
 *   - The demo seed candidates (so demo data is consistent with what we ask
 *     the model to produce).
 *   - The demo research-report fallback (rendered into the validation plan).
 */
export const HYDRIDE_DOMAIN_CHECKLIST = [
  "Zero-point energy correction",
  "Anharmonic phonon correction",
  "Isotope H/D effect study",
  "Pressure sweep across the target window",
  "Convex hull / decomposition pathway analysis",
  "Diamond anvil cell (DAC) synthesis feasibility assessment",
] as const;

export type HydrideChecklistItem = (typeof HYDRIDE_DOMAIN_CHECKLIST)[number];
