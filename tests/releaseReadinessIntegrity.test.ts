import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CAMPAIGN_CHOICES } from "../src/data/campaign/campaignChoices";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { STORY_SCENES } from "../src/data/story/guildOrigin";
import { REGIONS } from "../src/data/world/regions";
import { SETTLEMENTS } from "../src/data/world/settlements";
import { getCampaignNodeLocationRequirement } from "../src/game/campaign/campaignLocationService";
import { completeCampaignNode, getAvailableCampaignNodes, getLatestCampaignChapter } from "../src/game/campaign/campaignService";
import { createWorldState } from "../src/game/world/worldState";
import { getQuestStartBlocker } from "../src/game/quests/questAvailability";
import { testHero } from "./testHero";
import { unlockRegionalThreats } from "../src/game/world/regionalThreatService";

function hasUnlockedPath(fromRegionId: string, destinationRegionId: string, unlockedRegionIds: readonly string[]): boolean {
  if (fromRegionId === destinationRegionId) return true;
  const allowed = new Set(unlockedRegionIds);
  if (!allowed.has(fromRegionId) || !allowed.has(destinationRegionId)) return false;
  const queue = [fromRegionId];
  const visited = new Set(queue);
  while (queue.length) {
    const current = queue.shift()!;
    for (const next of REGIONS[current]?.connectedRegionIds ?? []) {
      if (!allowed.has(next) || visited.has(next)) continue;
      if (next === destinationRegionId) return true;
      visited.add(next);
      queue.push(next);
    }
  }
  return false;
}

describe("release readiness content integrity", () => {
  it("walks the full nine-chapter campaign without an unlock or travel dead end", () => {
    let world = createWorldState();
    const chapters = Object.values(CAMPAIGN_CHAPTERS).sort((a, b) => a.chapterNumber - b.chapterNumber);

    for (const chapter of chapters) {
      expect(world.campaignChapter, `before ${chapter.id}`).toBe(chapter.chapterNumber);
      for (const nodeId of chapter.nodeIds) {
        if (nodeId === "goblin_chieftain") world = { ...world, worldFlags: { ...world.worldFlags, starter_brambleway_road_ambush_complete: true, starter_brambleford_side_quest_complete: true, starter_fourth_hero_ready: true } };
        const availableIds = getAvailableCampaignNodes(world).map((node) => node.id);
        expect(availableIds, `available before ${nodeId}`).toContain(nodeId);

        const requirement = getCampaignNodeLocationRequirement(nodeId);
        if (requirement) {
          expect(REGIONS[requirement.regionId], `${nodeId} region ${requirement.regionId}`).toBeDefined();
          expect(world.unlockedRegionIds, `${nodeId} must unlock ${requirement.regionId} before travel`).toContain(requirement.regionId);
          expect(hasUnlockedPath(world.currentRegionId, requirement.regionId, world.unlockedRegionIds), `${nodeId} road from ${world.currentRegionId} to ${requirement.regionId}`).toBe(true);
          for (const settlementId of requirement.settlementIds) {
            expect(SETTLEMENTS[settlementId], `${nodeId} settlement ${settlementId}`).toBeDefined();
            expect(SETTLEMENTS[settlementId]?.regionId).toBe(requirement.regionId);
          }
          world = {
            ...world,
            currentRegionId: requirement.regionId,
            currentSettlementId: requirement.settlementIds[0] ?? null,
            discoveredSettlementIds: requirement.settlementIds[0]
              ? [...new Set([...world.discoveredSettlementIds, requirement.settlementIds[0]])]
              : world.discoveredSettlementIds,
          };
        }

        world = completeCampaignNode(world, nodeId).worldState;
      }
    }

    expect(getLatestCampaignChapter().chapterNumber).toBe(9);
    expect(world.campaignChapter).toBe(10);
    expect(getAvailableCampaignNodes(world)).toEqual([]);
  });

  it("blocks every direct quest-start bypass until the same progression rules are met", () => {
    let world = createWorldState();
    const levelOne = [{ ...testHero(), id: "one", level: 1 }, { ...testHero(), id: "two", level: 1 }];

    expect(getQuestStartBlocker(QUESTS.goblin_patrol!, world, levelOne)).toMatch(/prerequisites/i);
    expect(getQuestStartBlocker(QUESTS.orchard_road_patrol!, world, levelOne)).toMatch(/Level 2/i);
    expect(getQuestStartBlocker(QUESTS.goblin_chieftain_boss!, world, levelOne)).toMatch(/Chapter 1/i);

    world = completeCampaignNode(world, "founding_the_guild").worldState;
    expect(getQuestStartBlocker(QUESTS.guildhaven_cellar_slimes!, world, levelOne)).toBeNull();

    const levelThree = levelOne.map((hero) => ({ ...hero, level: 3 }));
    const remoteWorld = { ...world, unlockedRegionIds: [...new Set([...world.unlockedRegionIds, "iron_hills"])] };
    expect(getQuestStartBlocker(QUESTS.highcourt_silent_charter!, remoteWorld, levelThree)).toMatch(/prerequisites|Travel/i);

    let crisisWorld = unlockRegionalThreats(createWorldState());
    crisisWorld = { ...crisisWorld, currentRegionId: "shadowfen", currentSettlementId: "blackwater", unlockedRegionIds: [...new Set([...crisisWorld.unlockedRegionIds, "shadowfen"])], regionThreat: { shadowfen: 4 }, regionCrisisDays: { shadowfen: 80 } };
    const blackwaterQuest = { ...QUESTS.highcourt_silent_charter!, regionId: "shadowfen", settlementIds: ["blackwater"] };
    expect(getQuestStartBlocker(blackwaterQuest, crisisWorld, levelThree)).toMatch(/closed.*regional crisis/i);
  });

  it("keeps every campaign node and chapter reference valid", () => {
    for (const chapter of Object.values(CAMPAIGN_CHAPTERS)) {
      expect(chapter.nodeIds.length).toBeGreaterThan(0);
      for (const nodeId of chapter.nodeIds) {
        const node = CAMPAIGN_NODES[nodeId];
        expect(node, `missing node ${nodeId}`).toBeDefined();
        expect(node?.chapterId).toBe(chapter.id);
        for (const prerequisiteId of node?.prerequisiteNodeIds ?? []) expect(CAMPAIGN_NODES[prerequisiteId], `${nodeId} prerequisite ${prerequisiteId}`).toBeDefined();
        if (node?.questId) expect(QUESTS[node.questId], `${nodeId} quest ${node.questId}`).toBeDefined();
        if (node?.storySceneId) expect(STORY_SCENES[node.storySceneId], `${nodeId} scene ${node.storySceneId}`).toBeDefined();
        for (const choiceId of node?.choiceIds ?? []) expect(CAMPAIGN_CHOICES[choiceId], `${nodeId} choice ${choiceId}`).toBeDefined();
      }
      for (const sideQuestId of chapter.sideQuestIds ?? []) expect(QUESTS[sideQuestId], `${chapter.id} side quest ${sideQuestId}`).toBeDefined();
    }
  });

  it("keeps every quest connected to valid world and combat content", () => {
    for (const quest of Object.values(QUESTS)) {
      expect(REGIONS[quest.regionId], `${quest.id} region ${quest.regionId}`).toBeDefined();
      for (const settlementId of quest.settlementIds ?? []) {
        expect(SETTLEMENTS[settlementId], `${quest.id} settlement ${settlementId}`).toBeDefined();
        expect(SETTLEMENTS[settlementId]?.regionId, `${quest.id} settlement region`).toBe(quest.regionId);
      }
      for (const encounterId of quest.encounterIds) expect(QUEST_ENCOUNTERS[encounterId], `${quest.id} encounter ${encounterId}`).toBeDefined();
      expect(QUEST_LOOT_TABLES[quest.lootTableId], `${quest.id} loot table ${quest.lootTableId}`).toBeDefined();
      for (const prerequisiteQuestId of quest.prerequisiteQuestIds ?? []) expect(QUESTS[prerequisiteQuestId], `${quest.id} prerequisite quest ${prerequisiteQuestId}`).toBeDefined();
      for (const prerequisiteNodeId of quest.prerequisiteCampaignNodeIds ?? []) expect(CAMPAIGN_NODES[prerequisiteNodeId], `${quest.id} prerequisite node ${prerequisiteNodeId}`).toBeDefined();
    }
  });

  it("keeps every regional quest-pool reference valid and local", () => {
    for (const region of Object.values(REGIONS)) {
      for (const questId of region.questPoolIds) {
        const quest = QUESTS[questId];
        expect(quest, `${region.id} quest pool ${questId}`).toBeDefined();
        expect(quest?.regionId, `${questId} belongs to ${region.id}`).toBe(region.id);
      }
      for (const settlementId of region.settlementIds) {
        expect(SETTLEMENTS[settlementId], `${region.id} settlement ${settlementId}`).toBeDefined();
        expect(SETTLEMENTS[settlementId]?.regionId).toBe(region.id);
      }
    }
  });
});
