import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const preparedParty = {
  partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
  skillPathIndices: [1, 0, 0, 0] as const,
  gearProfile: "prepared_minus_two" as const,
  progressionProfile: "subclass_ready" as const,
  tacticsProfile: "skilled" as const,
};

const chapters = [
  { chapter: 1, id: "chieftain", questId: "goblin_chieftain_boss", heroLevel: 2, seed: 91_100 },
  { chapter: 2, id: "warden", questId: "hollow_warden_boss", heroLevel: 5, seed: 92_100 },
  { chapter: 3, id: "vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 93_100 },
  { chapter: 4, id: "morrowveil", questId: "morrowveil_drowned_archivist_boss", heroLevel: 7, seed: 94_100 },
  { chapter: 5, id: "solkar", questId: "solkar_ash_herald_boss", heroLevel: 9, seed: 95_100 },
  { chapter: 6, id: "cassian", questId: "cassian_vane_boss", heroLevel: 11, seed: 96_100 },
  { chapter: 7, id: "varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 97_100 },
  { chapter: 8, id: "nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 98_100 },
  { chapter: 9, id: "serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 99_100 },
] as const;

function runBand(minChapter: number, maxChapter: number) {
  const scenarios = chapters.filter((entry) => entry.chapter >= minChapter && entry.chapter <= maxChapter);
  return scenarios.flatMap((entry) =>
    (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateCombatScenario({
        id: `chapter-${entry.chapter}-${entry.id}-${difficultyId}`,
        questId: entry.questId,
        heroLevel: entry.heroLevel,
        ...preparedParty,
        difficultyId,
        runs: 3,
        seed: entry.seed,
      }),
    ),
  );
}

function assertBasicCurve(results: ReturnType<typeof runBand>) {
  expect(results.every((result) => result.stalled === 0)).toBe(true);
  for (const entry of chapters) {
    const standard = results.find((result) => result.scenarioId === `chapter-${entry.chapter}-${entry.id}-standard`);
    if (!standard) continue;
    const veteran = results.find((result) => result.scenarioId === `chapter-${entry.chapter}-${entry.id}-veteran`)!;
    const iron = results.find((result) => result.scenarioId === `chapter-${entry.chapter}-${entry.id}-iron_guild`)!;
    expect(standard.winRate, `Chapter ${entry.chapter} Standard ordering`).toBeGreaterThanOrEqual(veteran.winRate);
    expect(veteran.winRate, `Chapter ${entry.chapter} Veteran ordering`).toBeGreaterThanOrEqual(iron.winRate);
  }
}

describe("whole-campaign prepared-party benchmark", () => {
  it("measures Chapters 1-3 under one prepared benchmark", () => {
    const results = runBand(1, 3);
    console.table(results);
    assertBasicCurve(results);
  }, 300_000);

  it("measures Chapters 4-6 under one prepared benchmark", () => {
    const results = runBand(4, 6);
    console.table(results);
    assertBasicCurve(results);
  }, 300_000);

  it("measures Chapters 7-9 under one prepared benchmark", () => {
    const results = runBand(7, 9);
    console.table(results);
    assertBasicCurve(results);
  }, 300_000);
});
