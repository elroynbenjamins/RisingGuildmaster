import { describe, expect, it } from "vitest";
import { emptyPotionInventory } from "../src/game/alchemy/potionTypes";
import { MASTERIES } from "../src/data/masteries/masteries";
import { QUESTS } from "../src/data/quests/quests";
import { CLASS_SKILL_TREES } from "../src/data/skills/classSkillTrees";
import { SUBCLASSES } from "../src/data/subclasses/subclasses";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import type { ClassId, Hero } from "../src/game/heroes/types";
import { createGuild } from "../src/game/guild/guildService";
import { buildRecommendedQuestParty, getQuestDeploymentSummary } from "../src/game/party/questDeploymentService";
import { suggestPartyForQuest } from "../src/game/party/partyRecommendationService";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";
import { createRecruitmentState, recruitCandidate } from "../src/game/recruitment/recruitmentService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

const secondaryGear = {
  helmet: "veyr-memory-helm",
  boots: "abysswalker-boots",
  accessory1: "echopearl-ring",
  accessory2: "seventh-seal-charm",
} as const;

function completedHero(id: string, classId: ClassId, level: number): Hero {
  const tree = CLASS_SKILL_TREES[classId];
  const subclassId = Object.values(SUBCLASSES).find((entry) => entry.baseClassId === classId)?.id ?? null;
  const masteryId = Object.values(MASTERIES).find((entry) => entry.baseClassId === classId)?.id ?? null;
  const learnedSkillIds = tree.recommendedPaths[0]!.skillIds.filter(
    (skillId) => (tree.nodes.find((node) => node.skillId === skillId)?.requiredLevel ?? Infinity) <= level,
  );
  const weapon = classId === "ranger"
    ? "deepward-longbow"
    : classId === "mage" || classId === "cleric"
      ? "deepward-crozier"
      : "deepward-longsword";
  const base: Hero = {
    ...testHero(),
    id,
    name: id,
    classId,
    level,
    learnedSkillIds,
    subclassId,
    masteryId,
    isAvailable: true,
    equipment: {
      ...testHero().equipment,
      weapon,
      armor: "deepward-fieldcoat",
      ...secondaryGear,
    },
  };
  return { ...base, currentHP: calculateHero(base).stats.maxHP };
}

describe("late recruit readiness lifecycle", () => {
  it("keeps a fresh late recruit advisory-only until the player finishes their build and secondary gear", () => {
    const quest = QUESTS.serekh_chartmaker_boss!;
    const candidate = generateRecruitmentCandidate(
      createSeededRandom(44_016),
      20,
      80,
      "standard",
      "human",
      "warrior",
      undefined,
      undefined,
      { standard: { min: 16, max: 16 } },
    );

    expect(candidate.heroPreview.level).toBe(16);
    expect(candidate.heroPreview.equipment.weapon).toBe("deepward-longsword");
    expect(candidate.heroPreview.equipment.armor).toBe("deepward-fieldcoat");
    expect(candidate.heroPreview.equipment.helmet).toBeNull();
    expect(candidate.heroPreview.subclassId).toBeNull();
    expect(candidate.heroPreview.learnedSkillIds).toHaveLength(0);

    const guild = createGuild();
    const veteran = completedHero("veteran-warrior", "warrior", 15);
    guild.heroes = [
      veteran,
      completedHero("ready-cleric", "cleric", 16),
      completedHero("ready-ranger", "ranger", 16),
      completedHero("ready-mage", "mage", 16),
    ];
    guild.gold = 20_000;
    guild.recruitment = createRecruitmentState(guild.currentDay, [candidate]);

    const recruited = recruitCandidate(guild, candidate.candidateId);
    const fresh = recruited.heroes.find((hero) => hero.id === candidate.heroPreview.id)!;
    const freshSummary = getQuestDeploymentSummary(
      quest,
      [
        fresh,
        recruited.heroes.find((hero) => hero.id === "ready-cleric")!,
        recruited.heroes.find((hero) => hero.id === "ready-ranger")!,
        recruited.heroes.find((hero) => hero.id === "ready-mage")!,
      ],
      [],
      emptyPotionInventory(),
    );

    expect(freshSummary.status).toBe("watch");
    expect(freshSummary.warnings.map((warning) => warning.id)).toEqual(expect.arrayContaining([
      "unspent_progression",
      "sparse_loadout",
    ]));
    expect(suggestPartyForQuest(recruited, quest)).toContain(veteran.id);
    expect(suggestPartyForQuest(recruited, quest)).not.toContain(fresh.id);
    expect(buildRecommendedQuestParty(quest, recruited.heroes)).toContain(veteran.id);
    expect(buildRecommendedQuestParty(quest, recruited.heroes)).not.toContain(fresh.id);

    const readyFresh = completedHero(fresh.id, "warrior", 16);
    const recoveredGuild = {
      ...recruited,
      heroes: recruited.heroes.map((hero) => hero.id === fresh.id ? readyFresh : hero),
    };
    const recoveredSummary = getQuestDeploymentSummary(
      quest,
      [
        readyFresh,
        recoveredGuild.heroes.find((hero) => hero.id === "ready-cleric")!,
        recoveredGuild.heroes.find((hero) => hero.id === "ready-ranger")!,
        recoveredGuild.heroes.find((hero) => hero.id === "ready-mage")!,
      ],
      [],
      emptyPotionInventory(),
    );

    expect(recoveredSummary.warnings.map((warning) => warning.id)).not.toContain("unspent_progression");
    expect(recoveredSummary.warnings.map((warning) => warning.id)).not.toContain("sparse_loadout");
    expect(suggestPartyForQuest(recoveredGuild, quest)).toContain(readyFresh.id);
    expect(suggestPartyForQuest(recoveredGuild, quest)).not.toContain(veteran.id);
    expect(buildRecommendedQuestParty(quest, recoveredGuild.heroes)).toContain(readyFresh.id);
    expect(buildRecommendedQuestParty(quest, recoveredGuild.heroes)).not.toContain(veteran.id);
  });
});
