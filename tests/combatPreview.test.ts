import { describe, expect, it } from "vitest";
import { getCombatAttackPreview } from "../src/game/combat/combatPreviewService";
import type { CombatSkillDefinition } from "../src/game/combat/skillTypes";
import { combatUnit } from "./combatTestUtils";

const physicalStrike: CombatSkillDefinition = { id: "preview_strike", name: "Preview Strike", type: "active", damageType: "physical", damageMultiplier: 1, range: 1 };
const magicBolt: CombatSkillDefinition = { id: "preview_bolt", name: "Preview Bolt", type: "active", damageType: "magic", damageMultiplier: 1, range: 4 };

describe("combat attack preview", () => {
  it("calculates exact d20 hit odds against armor class", () => {
    const preview = getCombatAttackPreview(combatUnit("hero"), combatUnit("enemy", "enemies", { stats: { ...combatUnit("base").stats, armorClass: 14 } }), physicalStrike);
    expect(preview?.hitChance).toBe(.6);
    expect(preview?.targetDefense).toBe(14);
    expect(preview?.normalDamage).toBeGreaterThan(0);
    expect(preview?.criticalDamage).toBeGreaterThan(preview?.normalDamage ?? 0);
  });

  it("uses magic defense score and identifies the softer defense", () => {
    const target = combatUnit("enemy", "enemies", { stats: { ...combatUnit("base").stats, armorClass: 20, physicalDefense: 80, magicDefenseScore: 18, magicDefense: 10 } });
    const preview = getCombatAttackPreview(combatUnit("mage"), target, magicBolt);
    expect(preview?.hitChance).toBe(.4);
    expect(preview?.favoredDamageType).toBe("magic");
  });

  it("does not invent a damage preview for support skills", () => {
    expect(getCombatAttackPreview(combatUnit("cleric"), combatUnit("ally"), { id: "blessing", name: "Blessing", type: "active", targetType: "single_ally" })).toBeNull();
  });
});
