import { describe, expect, it } from "vitest";
import { NPC_PORTRAITS } from "../src/data/characters/npcPortraits";
import { getEnemyDefinition } from "../src/data/enemies";
import { getQuestDialogue } from "../src/data/quests/questDialogue";
import { QUESTS } from "../src/data/quests/quests";

describe("quest dialogue", () => {
  it("provides a briefing and both debrief outcomes for every quest", () => {
    for (const quest of Object.values(QUESTS)) {
      const dialogue = getQuestDialogue(quest.id);
      expect(dialogue.briefingTitle.length).toBeGreaterThan(0);
      expect(dialogue.briefing.length, quest.id).toBeGreaterThan(0);
      expect(dialogue.victory.length, quest.id).toBeGreaterThan(0);
      expect(dialogue.defeat.length, quest.id).toBeGreaterThan(0);
    }
  });

  it("uses valid authored portrait references", () => {
    for (const quest of Object.values(QUESTS)) for (const line of [...getQuestDialogue(quest.id).briefing, ...getQuestDialogue(quest.id).victory, ...getQuestDialogue(quest.id).defeat]) {
      if (line.portraitId) expect(NPC_PORTRAITS[line.portraitId], `${quest.id}: ${line.portraitId}`).toBeDefined();
      if (line.enemyId) expect(getEnemyDefinition(line.enemyId), `${quest.id}: ${line.enemyId}`).toBeDefined();
    }
  });
});
