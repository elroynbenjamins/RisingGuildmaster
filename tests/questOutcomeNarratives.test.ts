import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHOICE_OUTCOMES, QUEST_OUTCOME_NARRATIVES } from "../src/data/quests/questOutcomeNarratives";
import { QUESTS } from "../src/data/quests/quests";
import { CAMPAIGN_CHOICES } from "../src/data/campaign/campaignChoices";

describe("quest outcome presentation data", () => {
  it("provides story aftermath for every implemented quest", () => {
    for (const questId of Object.keys(QUESTS)) {
      expect(QUEST_OUTCOME_NARRATIVES[questId]?.victory.length, `${questId} victory`).toBeGreaterThan(30);
      expect(QUEST_OUTCOME_NARRATIVES[questId]?.defeat.length, `${questId} defeat`).toBeGreaterThan(30);
    }
  });

  it("provides follow-up narrative for every Chieftain decision", () => {
    for (const choiceId of ["spare_chieftain", "execute_chieftain", "imprison_chieftain"]) {
      expect(CAMPAIGN_CHOICES[choiceId]).toBeDefined();
      expect(CAMPAIGN_CHOICE_OUTCOMES[choiceId]?.length).toBeGreaterThan(30);
    }
  });
});
