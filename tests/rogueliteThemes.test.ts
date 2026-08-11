import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { DUNGEONS, DUNGEON_NODES } from "../src/data/dungeons/dungeons";
import { ROGUELITE_ENCOUNTERS } from "../src/data/dungeons/rogueliteEncounters";
import { startDungeonRun } from "../src/game/dungeons/dungeonService";
import { sequenceRandom } from "./combatTestUtils";

describe("roguelite themes and encounter variety", () => {
  it("defines six themes with three regular groups, two elites, and two bosses each", () => {
    expect(new Set(Object.values(DUNGEONS).map((entry) => entry.themeId))).toEqual(new Set(["forest", "arctic", "jungle", "wasteland", "desert", "undead"]));
    for (const dungeon of Object.values(DUNGEONS)) { const nodes = dungeon.nodeIds.map((id) => DUNGEON_NODES[id]!); const combat = nodes.find((node) => node.id.endsWith("_combat"))!; const elite = nodes.find((node) => node.type === "elite")!; const boss = nodes.find((node) => node.type === "boss")!; expect(combat.encounterPoolIds).toHaveLength(3); expect(elite.encounterPoolIds).toHaveLength(2); expect(boss.encounterPoolIds).toHaveLength(2); for (const id of [...combat.encounterPoolIds!, ...elite.encounterPoolIds!, ...boss.encounterPoolIds!]) expect(ROGUELITE_ENCOUNTERS[id]).toBeDefined(); }
  });
  it("pre-rolls different saved encounters from the same theme", () => { const low = startDungeonRun("thornwood_trials", [], [], [], sequenceRandom([0, 0, 0, 0])); const high = startDungeonRun("thornwood_trials", [], [], [], sequenceRandom([.99, .99, .99, .99])); expect(low.selectedEncounterIds).not.toEqual(high.selectedEncounterIds); expect(startDungeonRun("thornwood_trials", [], [], [], sequenceRandom([0, 0, 0, 0])).selectedEncounterIds).toEqual(low.selectedEncounterIds); });
  it("provides a unique tactical environment for every theme", () => { const environmentIds = ["roguelite_forest_ruins", "roguelite_arctic_shelf", "roguelite_jungle_temple", "roguelite_ash_wastes", "roguelite_desert_tomb", "roguelite_necropolis"]; expect(new Set(environmentIds).size).toBe(6); environmentIds.forEach((id) => expect(BATTLEFIELDS[id]?.terrainPlacements.length).toBeGreaterThan(5)); expect(BATTLEFIELDS.roguelite_desert_tomb?.terrainPlacements.some((entry) => entry.terrainType === "sand")).toBe(true); expect(BATTLEFIELDS.roguelite_ash_wastes?.terrainPlacements.some((entry) => entry.terrainType === "ash")).toBe(true); });
  it("uses explicit numerical buffs and debuffs for every theme", () => { for (const dungeon of Object.values(DUNGEONS)) { expect(Object.keys(dungeon.combatModifiers).length).toBeGreaterThan(0); Object.values(dungeon.combatModifiers).forEach((value) => expect(typeof value).toBe("number")); } });
});
