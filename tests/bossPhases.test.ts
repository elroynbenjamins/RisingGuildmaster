import { describe, expect, it } from "vitest";
import { BOSS_PHASES } from "../src/data/bosses/bossPhases";
import { resolveNewBossPhases } from "../src/game/bosses/bossPhaseService";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { createSeededRandom } from "../src/utils/random";

const base = { hp: 100, physicalDamage: 20, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };

describe("data-driven boss phases", () => {
  it("triggers phases once when thresholds are crossed", () => {
    const queen = createEnemyInstance("spider_queen", base, createSeededRandom(4));
    const first = resolveNewBossPhases({ ...queen, currentHP: queen.maxHP * .50 });
    expect(first.triggeredPhaseIds).toEqual(["queen_brood_stirs", "queen_webguard"]);
    expect(resolveNewBossPhases(first.instance).triggeredPhaseIds).toEqual([]);
  });

  it("keeps standard boss reactions compact and data-driven", () => {
    expect(BOSS_PHASES.queen_brood_stirs!.summonGroups).toEqual([{ enemyDefinitionId: "spiderling_swarm", count: 2 }]);
    expect(BOSS_PHASES.chieftain_last_stand!.selfModifiers).toContainEqual(expect.objectContaining({ stat: "physicalDamage", value: .10 }));
    expect(BOSS_PHASES.serekh_redraws_names!.heroModifiers).toContainEqual(expect.objectContaining({ stat: "movementRange", value: -1 }));
  });
});
