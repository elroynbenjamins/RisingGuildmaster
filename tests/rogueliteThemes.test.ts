import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { DUNGEONS, DUNGEON_NODES } from "../src/data/dungeons/dungeons";
import { ROGUELITE_ENCOUNTERS } from "../src/data/dungeons/rogueliteEncounters";
import { ENEMIES } from "../src/data/enemies";
import { COMBAT_BOARD_SIZES } from "../src/game/combat/grid/gridTypes";
import { isRogueliteEncounterDiscovered, startDungeonRun } from "../src/game/dungeons/dungeonService";
import { sequenceRandom } from "./combatTestUtils";

describe("roguelite themes and encounter variety", () => {
  it("defines six themes with varied regular, elite, and boss encounter pools", () => {
    expect(new Set(Object.values(DUNGEONS).map((entry) => entry.themeId))).toEqual(new Set(["forest", "arctic", "jungle", "wasteland", "desert", "undead"]));
    for (const dungeon of Object.values(DUNGEONS)) { const nodes = dungeon.nodeIds.map((id) => DUNGEON_NODES[id]!); const combat = nodes.find((node) => node.id.endsWith("_combat"))!; const elite = nodes.find((node) => node.type === "elite")!; const boss = nodes.find((node) => node.type === "boss")!; expect(combat.encounterPoolIds!.length).toBeGreaterThanOrEqual(4); expect(elite.encounterPoolIds!.length).toBeGreaterThanOrEqual(3); expect(boss.encounterPoolIds!.length).toBeGreaterThanOrEqual(3); for (const id of [...combat.encounterPoolIds!, ...elite.encounterPoolIds!, ...boss.encounterPoolIds!]) expect(ROGUELITE_ENCOUNTERS[id]).toBeDefined(); }
  });
  it("pre-rolls different saved encounters from the same theme", () => { const low = startDungeonRun("thornwood_trials", [], [], [], sequenceRandom([0, 0, 0, 0])); const high = startDungeonRun("thornwood_trials", [], [], [], sequenceRandom([.99, .99, .99, .99])); expect(low.selectedEncounterIds).not.toEqual(high.selectedEncounterIds); expect(startDungeonRun("thornwood_trials", [], [], [], sequenceRandom([0, 0, 0, 0])).selectedEncounterIds).toEqual(low.selectedEncounterIds); });
  it("adds late campaign formations only when the party reaches their level gate", () => {
    const levelNine = startDungeonRun("ashen_march", [], [], [], sequenceRandom([.99, .99, .99, .99]), undefined, 9);
    expect(Object.values(levelNine.selectedEncounterIds)).not.toContain("rl_waste_laurel_elite");
    expect(Object.values(levelNine.selectedEncounterIds)).not.toContain("rl_waste_varkesh_boss");
    const levelTwelve = startDungeonRun("ashen_march", [], [], [], sequenceRandom([.99, .99, .99, .99]), undefined, 12);
    expect(Object.values(levelTwelve.selectedEncounterIds)).toContain("rl_waste_laurel_elite");
    expect(Object.values(levelTwelve.selectedEncounterIds)).toContain("rl_waste_varkesh_boss");
  });
  it("never rolls a formation containing an undiscovered creature", () => {
    const known = ["skeleton", "skeleton_archer", "zombie", "ironbound_sentry", "hollow_warden"];
    const run = startDungeonRun("wardstone_depths", [], [], [], sequenceRandom([.99, .99, .99, .99]), known);
    Object.values(run.selectedEncounterIds).forEach((id) => expect(isRogueliteEncounterDiscovered(id, known)).toBe(true));
    expect(Object.values(run.selectedEncounterIds)).not.toContain("rl_undead_mire_procession");
    expect(() => startDungeonRun("wardstone_depths", [], [], [], undefined, ["skeleton"])).toThrow("only discovered creatures");
  });
  it("integrates every Chapter 3 and 4 enemy into an appropriate theme", () => {
    const usedEnemyIds = new Set(Object.values(ROGUELITE_ENCOUNTERS).flatMap((encounter) => encounter.enemies.map((group) => group.enemyDefinitionId)));
    for (const id of ["rimefang_wolf", "icebound_warden", "aurora_seer", "hroth_iceblood", "vaelith_pale_echo", "mire_lurker", "drowned_legionnaire", "gravewater_hexer", "bell_widow", "morrowveil_archivist"]) expect(usedEnemyIds.has(id), id).toBe(true);
  });
  it("provides a unique tactical environment for every theme", () => { const environmentIds = ["roguelite_forest_ruins", "roguelite_arctic_shelf", "roguelite_jungle_temple", "roguelite_ash_wastes", "roguelite_desert_tomb", "roguelite_necropolis"]; expect(new Set(environmentIds).size).toBe(6); environmentIds.forEach((id) => expect(BATTLEFIELDS[id]?.terrainPlacements.length).toBeGreaterThan(5)); expect(BATTLEFIELDS.roguelite_desert_tomb?.terrainPlacements.some((entry) => entry.terrainType === "sand")).toBe(true); expect(BATTLEFIELDS.roguelite_ash_wastes?.terrainPlacements.some((entry) => entry.terrainType === "ash")).toBe(true); });
  it("uses explicit numerical buffs and debuffs for every theme", () => { for (const dungeon of Object.values(DUNGEONS)) { expect(Object.keys(dungeon.combatModifiers).length).toBeGreaterThan(0); Object.values(dungeon.combatModifiers).forEach((value) => expect(typeof value).toBe("number")); } });
  it("keeps every formation on its battlefield and references existing monsters", () => {
    for (const encounter of Object.values(ROGUELITE_ENCOUNTERS)) {
      const battlefield = BATTLEFIELDS[encounter.battlefieldId];
      expect(battlefield, encounter.battlefieldId).toBeDefined();
      const size = COMBAT_BOARD_SIZES[battlefield!.boardSizeId];
      for (const group of encounter.enemies) {
        expect(ENEMIES[group.enemyDefinitionId], group.enemyDefinitionId).toBeDefined();
        expect(group.spawnPositions).toHaveLength(group.count);
        for (const position of group.spawnPositions) {
          expect(position.x, `${encounter.id} x`).toBeLessThan(size.width);
          expect(position.y, `${encounter.id} y`).toBeLessThan(size.height);
        }
      }
    }
  });
});
