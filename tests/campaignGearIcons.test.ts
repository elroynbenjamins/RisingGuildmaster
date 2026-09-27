import { describe, expect, it } from "vitest";
import { CAMPAIGN_RECIPE_EQUIPMENT } from "../src/data/equipment/campaignRecipeEquipment";
import { CAMPAIGN_GEAR_ICON_CELLS, getCampaignGearIconCell } from "../src/data/equipment/campaignGearIcons";
import { EQUIPMENT_ICON_ART } from "../src/data/equipment/equipmentIconArt";

describe("campaign gear artwork", () => {
  it("provides artwork for every campaign recipe item while preserving unique legacy atlas cells", () => {
    for (const id of Object.keys(CAMPAIGN_RECIPE_EQUIPMENT)) expect(getCampaignGearIconCell(id) ?? EQUIPMENT_ICON_ART[id], id).toBeDefined();
    const cells = Object.values(CAMPAIGN_GEAR_ICON_CELLS).map((cell)=>`${cell.atlas ?? "legacy"}:${cell.column}:${cell.row}`);
    expect(new Set(cells).size).toBe(cells.length);
  });
  it("resolves durable inventory keys", () => { expect(getCampaignGearIconCell("truthglass-signet@@71")).toEqual({column:1,row:2}); });
});
