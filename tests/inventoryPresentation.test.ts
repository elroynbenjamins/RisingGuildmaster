import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { resolveEquipmentDefinition } from "../src/game/equipment/equipmentResolver";
import { getInventoryItemPresentation } from "../src/game/equipment/inventoryPresentationService";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";

describe("inventory presentation", () => {
  it("marks an empty compatible slot as an upgrade", () => {
    const hero = generateHero(createSeededRandom(19), { classId: "warrior" });
    const itemBase = Object.values(EQUIPMENT).find((entry) => !entry.classRestrictions.length || entry.classRestrictions.includes(hero.classId));
    expect(itemBase).toBeTruthy();
    const item = resolveEquipmentDefinition(itemBase!.id)!;
    const stripped = { ...hero, equipment: { ...hero.equipment, [item.slot]: null } };
    const presentation = getInventoryItemPresentation(item, [stripped]);
    expect(presentation.compatibleCount).toBe(1);
    expect(presentation.upgradeCount).toBe(1);
    expect(presentation.bestFit).toBe("upgrade");
  });

  it("exposes durability urgency", () => {
    const base = Object.values(EQUIPMENT)[0]!;
    const item = resolveEquipmentDefinition(`${base.id}@@20`)!;
    const presentation = getInventoryItemPresentation(item, []);
    expect(presentation.durabilityLabel).toBe("DAMAGED");
    expect(presentation.durabilityTone).toBe("danger");
  });
});
