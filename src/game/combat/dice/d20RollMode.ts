export type D20RollMode = "normal" | "advantage" | "disadvantage";

/** Multiple sources do not stack. Any advantage and disadvantage cancel each other. */
export function combineD20RollModes(...modes: readonly (D20RollMode | undefined)[]): D20RollMode {
  const advantage = modes.includes("advantage");
  const disadvantage = modes.includes("disadvantage");
  if (advantage === disadvantage) return "normal";
  return advantage ? "advantage" : "disadvantage";
}

export function chooseD20Roll(rolls: readonly number[], mode: D20RollMode): number {
  if (!rolls.length) throw new Error("At least one D20 roll is required");
  if (mode === "advantage") return Math.max(...rolls);
  if (mode === "disadvantage") return Math.min(...rolls);
  return rolls[0]!;
}
