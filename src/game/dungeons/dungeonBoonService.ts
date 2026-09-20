import { DUNGEON_BOONS, DUNGEON_BOON_IDS, type DungeonBoonDefinition } from "../../data/dungeons/dungeonBoons";
import type { RandomSource } from "../../utils/random";
import type { DungeonRunState } from "./dungeonTypes";

export function getSelectedDungeonBoons(run: DungeonRunState): DungeonBoonDefinition[] {
  return (run.selectedBoonIds ?? []).map((id) => DUNGEON_BOONS[id]).filter((entry): entry is DungeonBoonDefinition => Boolean(entry));
}

export function offerDungeonBoonChoices(run: DungeonRunState, random: RandomSource, count = 3): DungeonRunState {
  if ((run.pendingBoonChoiceIds?.length ?? 0) > 0 || run.status !== "active") return run;
  const selected = new Set(run.selectedBoonIds ?? []);
  const pool = DUNGEON_BOON_IDS.filter((id) => !selected.has(id));
  const choices: string[] = [];
  while (pool.length && choices.length < count) {
    const index = random.int(0, pool.length - 1);
    const [picked] = pool.splice(index, 1);
    if (picked) choices.push(picked);
  }
  return choices.length ? { ...run, pendingBoonChoiceIds: choices } : run;
}

export function chooseDungeonBoon(run: DungeonRunState, boonId: string): DungeonRunState {
  const choices = run.pendingBoonChoiceIds ?? [];
  if (!choices.includes(boonId)) throw new Error("This expedition boon is not currently offered");
  if (!DUNGEON_BOONS[boonId]) throw new Error("Unknown expedition boon");
  return {
    ...run,
    selectedBoonIds: [...new Set([...(run.selectedBoonIds ?? []), boonId])],
    pendingBoonChoiceIds: [],
  };
}

export function sumDungeonBoonValue(run: DungeonRunState, key: keyof Pick<DungeonBoonDefinition,
  "heroInitiativeModifier" | "enemyInitiativeModifier" | "heroArmorClassModifier" | "heroOpeningAttackRollModifier" |
  "enemyOpeningAttackRollModifier" | "heroHealingPowerModifier" | "heroMovementRangeModifier" | "rewardGoldModifier" | "rareLootModifier"
>): number {
  return getSelectedDungeonBoons(run).reduce((sum, boon) => sum + (boon[key] ?? 0), 0);
}
