export type CombatTutorialStep = "move" | "basic_attack" | "end_turn" | "complete";
export type CombatTutorialAction = "moved" | "used_basic_attack" | "ended_turn";

const NEXT_STEP: Record<CombatTutorialStep, Partial<Record<CombatTutorialAction, CombatTutorialStep>>> = {
  move: { moved: "basic_attack" },
  basic_attack: { used_basic_attack: "end_turn" },
  end_turn: { ended_turn: "complete" },
  complete: {},
};

/** Only a successfully resolved combat action advances the guided walkthrough. */
export function advanceCombatTutorial(step: CombatTutorialStep, action: CombatTutorialAction): CombatTutorialStep {
  return NEXT_STEP[step][action] ?? step;
}
