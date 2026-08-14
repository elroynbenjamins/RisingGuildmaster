import { describe, expect, it } from "vitest";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUESTS } from "../src/data/quests/quests";
import { combatUnit, sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";
import { resolveHeroAction } from "../src/game/combat/heroActionService";
import { resolveSkill } from "../src/game/combat/skillResolver";
import type { CombatSkillDefinition } from "../src/game/combat/skillTypes";
import type { HeroCombatInstance } from "../src/game/combat/combatTypes";
import { getHeroReactiveDefenseModifiers } from "../src/game/equipment/equipmentSpecialEffectService";
import { createEnchantedEquipmentKey, resolveEquipmentDefinition } from "../src/game/equipment/equipmentResolver";
import { createGuild } from "../src/game/guild/guildService";
import { resolveQuestVictory } from "../src/game/quests/questResolver";
import { startQuest } from "../src/game/quests/questService";

const instance = (heroId = "hero-test"): HeroCombatInstance => ({ heroId, currentHP: 212, maxHP: 212, currentMana: 100, maxMana: 100, currentStamina: 100, maxStamina: 100, activeConditions: [], activeCooldowns: {}, isAlive: true, position: { x: 1, y: 2 }, movementRange: 3 });

describe("basic equipment and crafting expansion", () => {
  it("adds twenty craftable common and uncommon items", () => {
    const expansionIds = [
      "militia-handaxe", "yew-shortbow", "pilgrim-rod", "quilted-travel-coat", "iron-skullcap", "soft-leather-boots", "simple-iron-band", "brass-focus-charm",
      "venomsteel-spear", "cinder-edge-axe", "emberglass-wand", "frostwood-bow", "barbed-war-pick", "sapphire-lamellar", "runeguard-robes", "mirrorsteel-helm", "ward-thread-boots", "antivenom-band", "cinderheart-charm", "vigilant-trail-coat",
    ];
    expect(expansionIds.filter((id) => EQUIPMENT[id]?.rarity === "common")).toHaveLength(8);
    expect(expansionIds.filter((id) => EQUIPMENT[id]?.rarity === "uncommon")).toHaveLength(12);
    for (const id of expansionIds) expect(Object.values(CRAFTING_RECIPES).some((recipe) => recipe.outputEquipmentId === id), id).toBe(true);
  });

  it("keeps side-quest patterns locked until their quest is won", () => {
    const quest = QUESTS.smoke_without_fire!;
    expect(quest.recipeUnlockIdsOnVictory).toEqual(["forge_cinder_edge_axe"]);
    expect(CRAFTING_RECIPES.forge_cinder_edge_axe?.unlockSource).toBe("side_quest");
    const heroes = [testHero(), ...["h2", "h3"].map((id) => ({ ...testHero(), id, name: id }))];
    const guild = { ...createGuild(), heroes };
    const party = { id: "party", heroIds: heroes.map((hero) => hero.id) };
    const result = resolveQuestVictory(startQuest(quest, party), party, guild, heroes.map((hero) => instance(hero.id)), sequenceRandom([]));
    expect(result.guild.unlockedRecipeIds).toContain("forge_cinder_edge_axe");
  });

  it("applies a weapon's status effect through the normal hero action pipeline", () => {
    const hero = { ...testHero(), equipment: { ...testHero().equipment, weapon: "cinder-edge-axe" } };
    const actor = combatUnit(hero.id, "heroes");
    const enemy = combatUnit("enemy", "enemies", { currentHP: 500, maxHP: 500 });
    const result = resolveHeroAction(hero, instance(), actor, [enemy], "warrior_sword_strike", sequenceRandom([.5, .1]));
    expect(result.targets[0]?.activeConditions).toContainEqual({ conditionId: "burning", remainingTurns: 2 });
  });

  it("reduces only the next damaging attack after receiving magic damage", () => {
    const hero = { ...testHero(), equipment: { ...testHero().equipment, armor: "sapphire-lamellar" } };
    const defender = combatUnit(hero.id, "heroes", { currentHP: 500, maxHP: 500 });
    const attacker = combatUnit("enemy", "enemies");
    const magic: CombatSkillDefinition = { id: "test_magic", name: "Test Magic", type: "active", damageType: "magic", damageMultiplier: 1, targetType: "single_enemy" };
    const physical: CombatSkillDefinition = { id: "test_physical", name: "Test Physical", type: "active", damageType: "physical", damageMultiplier: 1, targetType: "single_enemy" };
    const afterMagic = resolveSkill(attacker, [defender], magic, sequenceRandom([.5]), { reactiveDefenseModifiers: (_target, damageType) => getHeroReactiveDefenseModifiers(hero, damageType) }).targets[0]!;
    expect(afterMagic.activeModifiers).toContainEqual(expect.objectContaining({ stat: "nextIncomingDamage", value: -.10 }));
    const baseline = resolveSkill(attacker, [{ ...afterMagic, activeModifiers: [] }], physical, sequenceRandom([.5])).resolution.hits[0]!.damage;
    const protectedHit = resolveSkill(attacker, [afterMagic], physical, sequenceRandom([.5]));
    expect(protectedHit.resolution.hits[0]!.damage).toBe(Math.max(1, Math.round(baseline * .9)));
    expect(protectedHit.targets[0]!.activeModifiers.some((modifier) => modifier.stat === "nextIncomingDamage")).toBe(false);
  });

  it("lets ordinary enchantments add combat effects without mutating base equipment", () => {
    const base = EQUIPMENT["militia-handaxe"]!;
    const enchanted = resolveEquipmentDefinition(createEnchantedEquipmentKey(base.id, "ember_edge"))!;
    expect(enchanted.specialEffectIds).toContain("ember_coating_12");
    expect(base.specialEffectIds).not.toContain("ember_coating_12");
  });
});
