import { describe, expect, it } from "vitest";
import { resolveLocationObjective, resolveObjectiveFocus, resolveQuestObjective } from "../src/game/navigation/objectiveNavigation";
import type { WorldState } from "../src/game/world/worldTypes";

const worldAt = (regionId: string, settlementId?: string) => ({ currentRegionId: regionId, currentSettlementId: settlementId } as WorldState);

describe("smart objective navigation", () => {
  it("opens an accessible quest directly at the matching settlement", () => {
    expect(resolveQuestObjective(worldAt("greenveil", "brambleford"), "brambleway_caravan"))
      .toEqual({ screen: "quest", questId: "brambleway_caravan" });
  });
  it("selects the correct settlement and quest within the current region", () => {
    expect(resolveQuestObjective(worldAt("greenveil", "guildhaven"), "brambleway_caravan"))
      .toEqual({ screen: "region", regionId: "greenveil", settlementId: "brambleford", questId: "brambleway_caravan" });
  });
  it("focuses the destination region before inter-region travel", () => {
    expect(resolveQuestObjective(worldAt("frostmarch"), "brambleway_caravan"))
      .toEqual({ screen: "world", regionId: "greenveil", questId: "brambleway_caravan" });
  });
  it("focuses settlement-only and region-only objective cards", () => {
    expect(resolveObjectiveFocus(worldAt("greenveil"), { regionId: "greenveil", settlementId: "brambleford" }))
      .toEqual({ screen: "region", regionId: "greenveil", settlementId: "brambleford", questId: undefined });
    expect(resolveLocationObjective(worldAt("greenveil"), "frostmarch"))
      .toEqual({ screen: "world", regionId: "frostmarch", questId: undefined });
  });
  it("ignores an unknown quest id without sending the player somewhere random", () => {
    expect(resolveQuestObjective(worldAt("greenveil"), "missing_quest")).toBeNull();
  });
});
