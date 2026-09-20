import { describe, expect, it } from "vitest";
import { CHAPTER_6, CHAPTER_6_NODES } from "../src/data/campaign/chapter6";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { QUESTS } from "../src/data/quests/quests";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { completeCampaignNode, getAvailableCampaignNodes } from "../src/game/campaign/campaignService";
import { createWorldState } from "../src/game/world/worldState";

describe("Chapter 6 — The Sixth Voice", () => {
  it("continues directly from the Ash Herald and stays on the level 10–11 curve", () => {
    expect(CHAPTER_6).toMatchObject({ chapterNumber: 6, recommendedLevelMin: 10, recommendedLevelMax: 11, sideQuestIds: ["the_empty_banner", "supper_at_the_last_lantern"] });
    expect(CHAPTER_6_NODES.home_to_a_lowered_banner?.prerequisiteNodeIds).toEqual(["ash_herald_boss"]);
    const world = { ...createWorldState(), campaignChapter: 6, completedCampaignNodeIds: ["ash_herald_boss"] };
    expect(getAvailableCampaignNodes(world).map((node) => node.id)).toEqual(["home_to_a_lowered_banner"]);
  });

  it("enforces the full campaign sequence and Chapter 7 transition", () => {
    let world = { ...createWorldState(), campaignChapter: 6, completedCampaignNodeIds: ["ash_herald_boss"] };
    for (const id of CHAPTER_6.nodeIds) world = completeCampaignNode(world, id).worldState;
    expect(world.campaignChapter).toBe(7); expect(world.worldFlags).toMatchObject({ chapter_6_complete: true, guildhaven_liberated: true, ancient_dragon_council_foreshadowed: true });
  });

  it("builds a three-biome pursuit and a two-stage rival-guild finale", () => {
    expect(QUESTS.the_five_roads_run?.encounterIds).toEqual(["five_roads_frost", "five_roads_fen", "five_roads_ember"]);
    expect(QUESTS.cassian_vane_boss?.encounterIds).toEqual(["cassian_honor_guard", "cassian_crown_echo_final"]);
    expect(["five_roads_frost","five_roads_fen","five_roads_ember"].map((id) => BATTLEFIELDS[QUEST_ENCOUNTERS[id]!.battlefieldId]!.boardSizeId)).toEqual(["warfront","warfront","warfront"]);
    expect(BATTLEFIELDS.cassian_crown_chamber?.terrainPlacements.map((entry) => entry.terrainType)).toEqual(expect.arrayContaining(["ash","snow","shallow_water","forest"]));
  });

  it("registers new enemies, tactical skills, and Cassian's health phases", () => {
    for (const id of ["laurel_vanguard","laurel_arbalest","laurel_oathmage","oath_examiner","lying_crown_echo","cassian_vane"]) expect(ENEMIES[id]).toBeDefined();
    expect(ENEMY_SKILLS.perfected_authority?.conditionalModifiers).toHaveLength(2);
    expect(ENEMY_SKILLS.crown_decree).toMatchObject({ targetType: "all_enemies", cooldownTurns: 4 });
  });

  it("gives both side stories D20 checks and unique recipe rewards", () => {
    for (const questId of CHAPTER_6.sideQuestIds!) { const quest = QUESTS[questId]!; expect(quest.explorationStageIds?.length).toBeGreaterThanOrEqual(2); expect(quest.explorationStageIds?.every((id) => QUEST_EXPLORATION_STAGES[id]?.skillId)).toBe(true); expect(quest.recipeUnlockIdsOnVictory).toHaveLength(1); }
    expect(CRAFTING_RECIPES.tailor_free_oath_coat?.outputEquipmentId).toBe("free-oath-coat"); expect(EQUIPMENT["free-oath-coat"]).toBeDefined();
    expect(CRAFTING_RECIPES.jewel_truthglass_signet?.outputEquipmentId).toBe("truthglass-signet"); expect(EQUIPMENT["truthglass-signet"]).toBeDefined();
  });

  it("keeps every encounter position inside its battlefield", () => {
    for (const quest of Object.values(QUESTS).filter((entry) => entry.campaignChapter === 6)) for (const encounterId of quest.encounterIds) { const encounter = QUEST_ENCOUNTERS[encounterId]!; const map = BATTLEFIELDS[encounter.battlefieldId]!; const size = map.boardSizeId === "warfront" ? { width:15,height:11 } : map.boardSizeId === "grand_battlefield" ? { width:11,height:9 } : { width:9,height:7 }; for (const position of [...encounter.heroSpawnPositions,...encounter.enemies.flatMap((group)=>group.spawnPositions)]) expect(position.x>=0&&position.y>=0&&position.x<size.width&&position.y<size.height,`${encounterId} ${position.x},${position.y}`).toBe(true); }
  });
});
