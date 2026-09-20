import { describe, expect, it } from "vitest";
import { CLASSES } from "../src/data/classes/classes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { MASTERIES, ADVANCED_CLASS_NAMES } from "../src/data/masteries/masteries";
import { CLASS_SKILL_TREES } from "../src/data/skills/classSkillTrees";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { SUBCLASSES } from "../src/data/subclasses/subclasses";
import { getSkillIconArt } from "../src/data/skills/skillArt";
import { createGuild } from "../src/game/guild/guildService";
import { unlockPremiumContent } from "../src/game/monetization/contentUnlockService";

describe("Spellbow and Bulwark premium classes", () => {
  it("provides complete class, skill, subclass and mastery progression", () => {
    for (const classId of ["spellbow", "bulwark"] as const) {
      const tree = CLASS_SKILL_TREES[classId];
      expect(HERO_SKILLS[tree.basicSkillId]).toBeDefined();
      expect(tree.nodes).toHaveLength(9);
      expect(tree.nodes.every((node) => HERO_SKILLS[node.skillId])).toBe(true);
      expect(Object.values(SUBCLASSES).filter((entry) => entry.baseClassId === classId)).toHaveLength(2);
      expect(Object.values(MASTERIES).filter((entry) => entry.baseClassId === classId)).toHaveLength(2);
      expect(getSkillIconArt(tree.basicSkillId).atlas).toBe("spellbowBulwark");
    }
    expect(Object.keys(ADVANCED_CLASS_NAMES).filter((key) => key.startsWith("elemental_archer:") || key.startsWith("hexstalker:"))).toHaveLength(4);
    expect(Object.keys(ADVANCED_CLASS_NAMES).filter((key) => key.startsWith("bastion:") || key.startsWith("shield_vanguard:"))).toHaveLength(4);
  });

  it("keeps Ranger physical and Spellbow magical", () => {
    expect(CLASSES.ranger.tactical.physicalDamageModifier).toBeGreaterThan(0);
    expect(HERO_SKILLS.ranger_bow_shot?.damageType).toBe("physical");
    expect(HERO_SKILLS.spellbow_arcane_arrow?.damageType).toBe("magic");
  });

  it("unlocks each class for 50 gems and includes class equipment", () => {
    let guild = { ...createGuild(), gems: 100 };
    guild = unlockPremiumContent(guild, "spellbow");
    guild = unlockPremiumContent(guild, "bulwark");
    expect(guild.gems).toBe(0);
    expect(guild.entitlements.unlockedClassIds).toEqual(expect.arrayContaining(["spellbow", "bulwark"]));
    expect(EQUIPMENT["runewood-shortbow"]?.classRestrictions).toEqual(["spellbow"]);
    expect(EQUIPMENT["watch-shield"]?.classRestrictions).toEqual(["bulwark"]);
  });
});
