import { describe, expect, it } from "vitest";
import { getHeroContractPresentation, getHeroDutyStatus, HERO_COMBAT_ROLES } from "../src/ui/heroPresentation";
import { testHero } from "./testHero";

const session = {
  id: "train-1",
  heroId: "hero-test",
  programId: "sparring_drills" as const,
  startDay: 10,
  completionDay: 13,
  goldCost: 25,
  xpReward: 20,
  growthReward: 1,
};

describe("hero presentation", () => {
  it("prioritizes fallen and training states before field readiness", () => {
    expect(getHeroDutyStatus({ ...testHero(), currentHP: 0 }, session, 11).label).toBe("FALLEN");
    expect(getHeroDutyStatus(testHero(), session, 11)).toMatchObject({ label: "TRAINING", tone: "blue" });
    expect(getHeroDutyStatus(testHero(), undefined, 11).label).toBe("FIELD READY");
  });

  it("surfaces expiring contracts", () => {
    const contract = { heroId: "hero-test", weeklySalary: 80, startDay: 1, endDay: 20, startLevel: 1, status: "active" as const, renewalIntent: "undecided" as const };
    expect(getHeroContractPresentation(contract, 10)).toMatchObject({ label: "CONTRACT 10D", tone: "gold", daysRemaining: 10 });
  });

  it("provides a tactical role for every class", () => {
    expect(HERO_COMBAT_ROLES.warrior).toBe("FRONTLINE FIGHTER");
    expect(HERO_COMBAT_ROLES.cleric).toContain("SUPPORT");
    expect(HERO_COMBAT_ROLES.bulwark).toContain("TANK");
  });
});
