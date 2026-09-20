import { describe, expect, it } from "vitest";
import { getGuildPlannerDayPresentation, getGuildPlannerEventPresentation } from "../src/game/economy/guildPlannerPresentationService";
import type { GuildPlannerDay } from "../src/game/economy/economyTypes";

const day = (events: GuildPlannerDay["events"], arrearsAdded = 0): GuildPlannerDay => ({
  day: 8,
  daysAway: 1,
  events,
  payrollDue: 0,
  payrollPaid: 0,
  arrearsAdded,
  projectedGold: 900,
});

describe("guild planner presentation", () => {
  it("maps milestone events to readable game icons", () => {
    expect(getGuildPlannerEventPresentation({ type: "training_complete", text: "Mira completed training." })).toMatchObject({ label: "TRAINING", iconId: "training", tone: "good" });
    expect(getGuildPlannerEventPresentation({ type: "regional_threat", text: "Greenveil threat increased." })).toMatchObject({ label: "THREAT", iconId: "boss", tone: "warning" });
  });

  it("marks payroll arrears as the most urgent day state", () => {
    const result = getGuildPlannerDayPresentation(day([
      { type: "training_complete", text: "Mira completed training." },
      { type: "salary_arrears", text: "Payroll could not be fully covered." },
    ], 120));
    expect(result.tone).toBe("danger");
    expect(result.statusLabel).toBe("ACTION NEEDED");
    expect(result.iconIds).toContain("gold");
  });

  it("uses a quiet calendar state when nothing special is scheduled", () => {
    expect(getGuildPlannerDayPresentation(day([]))).toMatchObject({ tone: "quiet", statusLabel: "ROUTINE", iconIds: ["calendar"] });
  });
});
