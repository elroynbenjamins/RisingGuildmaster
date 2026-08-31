import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CHAPTER_7_NODES } from "../src/data/campaign/chapter7";
import { MONSTER_LORE } from "../src/data/enemies/monsterLore";
import { getQuestDialogue } from "../src/data/quests/questDialogue";
import { QUEST_OUTCOME_NARRATIVES } from "../src/data/quests/questOutcomeNarratives";
import { QUESTS } from "../src/data/quests/quests";
import { STORY_SCENES } from "../src/data/story/guildOrigin";
import { LORE_ENTRIES } from "../src/data/world/lore";

describe("campaign story continuity", () => {
  it("keeps Chapters 1-7 in a strict playable sequence", () => {
    const chapters = Object.values(CAMPAIGN_CHAPTERS).sort((a, b) => a.chapterNumber - b.chapterNumber);

    for (const [chapterIndex, chapter] of chapters.entries()) {
      expect(chapter.chapterNumber).toBe(chapterIndex + 1);
      expect(chapter.recommendedLevelMin).toBeDefined();
      expect(chapter.recommendedLevelMax).toBeDefined();
      expect(chapter.recommendedLevelMin!).toBeLessThanOrEqual(chapter.recommendedLevelMax!);

      for (const [nodeIndex, nodeId] of chapter.nodeIds.entries()) {
        const node = CAMPAIGN_NODES[nodeId];
        expect(node, nodeId).toBeTruthy();
        expect(node!.chapterId).toBe(chapter.id);

        if (nodeIndex > 0) expect(node!.prerequisiteNodeIds).toContain(chapter.nodeIds[nodeIndex - 1]!);
        if (node?.questId) {
          expect(QUESTS[node.questId], node.questId).toBeTruthy();
          if (QUESTS[node.questId]!.campaignChapter !== undefined) {
            expect(QUESTS[node.questId]!.campaignChapter).toBe(chapter.chapterNumber);
          }
        }
      }

      if (chapterIndex > 0) {
        const previous = chapters[chapterIndex - 1]!;
        const firstNode = CAMPAIGN_NODES[chapter.nodeIds[0]!]!;
        expect(firstNode.prerequisiteNodeIds).toContain(previous.nodeIds.at(-1));
        expect(chapter.recommendedLevelMin!).toBeLessThanOrEqual(previous.recommendedLevelMax! + 1);
      }
    }
  });

  it("keeps the Chapter 7 counterfeit reveal internally consistent", () => {
    const answer = STORY_SCENES.the_answer_in_brass!;
    const evidence = STORY_SCENES.the_scale_and_the_signature!;
    const embassyDialogue = getQuestDialogue("embassy_of_empty_armor");
    const ending = QUEST_OUTCOME_NARRATIVES.varkesh_gilded_rupture_boss!;

    expect(answer.paragraphs.join(" ")).toMatch(/copy|imitate/i);
    expect(evidence.paragraphs.join(" ")).toMatch(/counterfeit Crown command/i);
    expect(embassyDialogue.victory.map((line) => line.text).join(" ")).toMatch(/not the First Crown's living signature/i);
    expect(CHAPTER_7_NODES.varkesh_boss!.setWorldFlags).toMatchObject({ crownless_signature_forgery_exposed: true });
    expect(CHAPTER_7_NODES.varkesh_boss!.setWorldFlags).not.toHaveProperty("first_crown_cult_exposed");
    expect(MONSTER_LORE.varkesh_gilded_rupture).toMatch(/Crownless beacon.*stolen fragment/i);
    expect(ending.journalUpdate).toMatch(/western sea/i);
    expect(LORE_ENTRIES.crownless_host!.text).toMatch(/western sea/i);
  });
});
