import { describe, expect, it } from "vitest";
import { DUNGEON_BOONS } from "../src/data/dungeons/dungeonBoons";
import { chooseDungeonBoon, offerDungeonBoonChoices, sumDungeonBoonValue } from "../src/game/dungeons/dungeonBoonService";
import { availableDungeonNodeIds, markDungeonNodeResolved, startDungeonRun } from "../src/game/dungeons/dungeonService";
import { createSeededRandom } from "../src/utils/random";

describe("roguelite expedition boons", () => {
  it("offers three unique temporary choices and locks routing until one is chosen", () => {
    let run = startDungeonRun("wardstone_depths");
    run = markDungeonNodeResolved(run, "Opening room cleared");
    expect(availableDungeonNodeIds(run)).toHaveLength(3);

    run = offerDungeonBoonChoices(run, createSeededRandom(19));
    expect(run.pendingBoonChoiceIds).toHaveLength(3);
    expect(new Set(run.pendingBoonChoiceIds).size).toBe(3);
    expect(availableDungeonNodeIds(run)).toEqual([]);

    const chosenId = run.pendingBoonChoiceIds![0]!;
    run = chooseDungeonBoon(run, chosenId);
    expect(run.selectedBoonIds).toEqual([chosenId]);
    expect(run.pendingBoonChoiceIds).toEqual([]);
    expect(availableDungeonNodeIds(run)).toHaveLength(3);
  });

  it("does not re-offer already selected boons", () => {
    let run = startDungeonRun("wardstone_depths");
    run = offerDungeonBoonChoices(run, createSeededRandom(5));
    const chosenId = run.pendingBoonChoiceIds![0]!;
    run = chooseDungeonBoon(run, chosenId);
    run = offerDungeonBoonChoices(run, createSeededRandom(6));
    expect(run.pendingBoonChoiceIds).not.toContain(chosenId);
  });

  it("stacks boon benefits and pact drawbacks for the remainder of the run", () => {
    const run = {
      ...startDungeonRun("wardstone_depths"),
      selectedBoonIds: ["field_surgeons_kit", "blood_price", "reckless_vanguard"],
    };
    expect(sumDungeonBoonValue(run, "heroHealingPowerModifier")).toBeCloseTo(.05);
    expect(sumDungeonBoonValue(run, "rewardGoldModifier")).toBeCloseTo(.30);
    expect(sumDungeonBoonValue(run, "heroInitiativeModifier")).toBe(3);
    expect(sumDungeonBoonValue(run, "enemyOpeningAttackRollModifier")).toBe(1);
    expect(DUNGEON_BOONS.blood_price!.kind).toBe("pact");
  });

  it("rejects a boon that is not in the current offer", () => {
    const run = offerDungeonBoonChoices(startDungeonRun("wardstone_depths"), createSeededRandom(2));
    const unavailableId = Object.keys(DUNGEON_BOONS).find((id) => !run.pendingBoonChoiceIds?.includes(id))!;
    expect(() => chooseDungeonBoon(run, unavailableId)).toThrow("not currently offered");
  });
});
