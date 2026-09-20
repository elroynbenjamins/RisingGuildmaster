export interface RegionalThreatDefinition {
  regionId: string;
  resolutionQuestId: string;
  threatenedSettlementId: string;
  daysPerThreat: number;
  maximumThreat: number;
  activationWorldFlag?: string;
}

/** Regional crises advance with the guild calendar until their resolution quest is completed. */
export const REGIONAL_THREATS: Record<string, RegionalThreatDefinition> = {
  shadowfen: {
    regionId: "shadowfen",
    resolutionQuestId: "hunt_spider_queen",
    threatenedSettlementId: "blackwater",
    daysPerThreat: 20,
    maximumThreat: 4,
  },
  frostmarch: {
    regionId: "frostmarch",
    resolutionQuestId: "the_aurora_that_fell",
    threatenedSettlementId: "northwatch",
    daysPerThreat: 5,
    maximumThreat: 4,
    activationWorldFlag: "frostmarch_aurora_crisis",
  },
};
