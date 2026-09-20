import { describe, expect, it } from "vitest";
import { craftPotion, consumePotion } from "../src/game/alchemy/potionService";
import { createCombatState } from "../src/game/combat/combatEngine";
import { createGuild } from "../src/game/guild/guildService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

describe("potion workshop and combat inventory", () => {
  it("crafts a stored potion by spending explicit gold and materials", () => {
    const base = createGuild();
    const guild = { ...base, materials: { ...base.materials, spider_silk: 2, oak_timber: 1 } };
    const crafted = craftPotion(guild, "minor_healing_potion");
    expect(crafted.gold).toBe(guild.gold - 35);
    expect(crafted.materials).toMatchObject({ spider_silk: 1, oak_timber: 0 });
    expect(crafted.potions.minor_healing_potion).toBe(1);
    expect(guild.materials).toMatchObject({ spider_silk: 2, oak_timber: 1 });
  });

  it("uses the active hero's action, restores capped HP, and consumes one potion", () => {
    const hero = testHero();
    const initial = createCombatState("goblin_patrol", 0, [hero], createSeededRandom(9));
    const combatant = initial.heroes[0]!;
    const currentHP = Math.floor(combatant.instance.maxHP / 2);
    const state = {
      ...initial,
      combatStarted: true,
      awaitingHeroId: hero.id,
      heroes: [{ ...combatant, instance: { ...combatant.instance, currentHP }, unit: { ...combatant.unit, currentHP } }],
    };
    const baseGuild = createGuild();
    const guild = { ...baseGuild, heroes: [hero], potions: { ...baseGuild.potions, minor_healing_potion: 1 } };
    const result = consumePotion(guild, state, "minor_healing_potion");
    expect(result.guild.potions.minor_healing_potion).toBe(0);
    expect(result.state.heroes[0]!.instance.currentHP).toBe(Math.min(combatant.instance.maxHP, currentHP + Math.round(combatant.instance.maxHP * .30)));
    expect(result.state.actions).toMatchObject({ combatActionUsed: true, usedSkillId: "minor_healing_potion" });
    expect(() => consumePotion(result.guild, result.state, "minor_healing_potion")).toThrow();
  });
});
