import { describe, expect, it } from "vitest";
import { CAMPAIGN_RECIPE_EQUIPMENT } from "../src/data/equipment/campaignRecipeEquipment";
import { CAMPAIGN_GEAR_ICON_CELLS, getCampaignGearIconCell } from "../src/data/equipment/campaignGearIcons";

describe("campaign gear artwork", () => {
  it("assigns every campaign recipe item a unique atlas cell", () => {
    expect(Object.keys(CAMPAIGN_GEAR_ICON_CELLS).sort()).toEqual(Object.keys(CAMPAIGN_RECIPE_EQUIPMENT).sort());
    expect(new Set(Object.values(CAMPAIGN_GEAR_ICON_CELLS).map((cell)=>`${cell.atlas ?? "legacy"}:${cell.column}:${cell.row}`)).size).toBe(Object.keys(CAMPAIGN_RECIPE_EQUIPMENT).length);
  });
  it("resolves durable inventory keys", () => { expect(getCampaignGearIconCell("truthglass-signet@@71")).toEqual({column:1,row:2}); });
});
