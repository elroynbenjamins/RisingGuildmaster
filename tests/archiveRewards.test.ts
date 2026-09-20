import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { claimArchiveReward, getArchiveRewardProgress } from "../src/game/archives/archiveRewardService";
import { createGuild } from "../src/game/guild/guildService";

describe("archive collection rewards", () => {
  it("builds bestiary milestones and faction dossiers from live enemy data", () => {
    const guild = createGuild();
    const rewards = getArchiveRewardProgress(guild, "bestiary");
    expect(rewards.some((reward) => reward.id === "bestiary_complete")).toBe(true);
    expect(rewards.some((reward) => reward.id === "bestiary_faction_goblins")).toBe(true);
    expect(rewards.find((reward) => reward.id === "bestiary_complete")?.target).toBe(Object.keys(ENEMIES).length);
  });

  it("only allows a completed dossier to be claimed once", () => {
    const guild = createGuild();
    expect(() => claimArchiveReward(guild, "bestiary_faction_goblins")).toThrow(/not complete/i);
    const goblinIds = Object.values(ENEMIES).filter((enemy) => enemy.factionId === "goblins").map((enemy) => enemy.id);
    const completed = { ...guild, discoveredEnemyIds: goblinIds };
    const reward = getArchiveRewardProgress(completed, "bestiary").find((entry) => entry.id === "bestiary_faction_goblins")!;
    expect(reward.complete).toBe(true);
    const claimed = claimArchiveReward(completed, reward.id);
    expect(claimed.reputation).toBe(completed.reputation + reward.reward.reputation);
    expect(getArchiveRewardProgress(claimed, "bestiary").find((entry) => entry.id === reward.id)?.claimed).toBe(true);
    expect(() => claimArchiveReward(claimed, reward.id)).toThrow(/already been claimed/i);
  });

  it("tracks tactical discovery from unique abilities on encountered creatures", () => {
    const enemy = Object.values(ENEMIES).find((entry) => entry.skillIds.length > 0)!;
    const guild = { ...createGuild(), discoveredEnemyIds: [enemy.id] };
    const first = getArchiveRewardProgress(guild, "tactics")[0]!;
    expect(first.current).toBe(new Set(enemy.skillIds).size);
    expect(first.target).toBeGreaterThan(0);
  });
});
