import { describe, expect, it } from "vitest";
import { TUTORIAL_GUIDE_TOPICS } from "../src/game/onboarding/tutorialGuide";

describe("Guildmaster Handbook", () => {
  it("documents the current combat, calendar, deployment, and side-quest conventions", () => {
    const text = TUTORIAL_GUIDE_TOPICS.flatMap((topic) => topic.bullets).join(" ");
    expect(text).toContain("SOLID RED BORDER");
    expect(text).toContain("10% of maximum HP");
    expect(text).toContain("AUTO-FILL BALANCED");
    expect(text).toContain("Side Quests are tied to places and can only be cleared once");
  });

  it("keeps raids distinct from normal bosses", () => {
    const raid = TUTORIAL_GUIDE_TOPICS.find((topic) => topic.id === "dungeons_raids");
    expect(raid?.bullets.join(" ")).toContain("eight heroes");
    expect(raid?.bullets.join(" ")).toContain("do not use the Raid ruleset");
  });
});
