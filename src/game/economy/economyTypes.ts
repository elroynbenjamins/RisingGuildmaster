export type GuildGoldTransactionType = "salary" | "salary_arrears" | "tavern_income" | "equipment_sale";

export interface GuildGoldTransaction {
  id: string;
  type: GuildGoldTransactionType;
  day: number;
  amount: number;
  heroId?: string;
  note: string;
}

export interface TavernUpgradeState { targetLevel: number; startDay: number; completionDay: number; goldCost: number }
export interface GuildFinanceState {
  salaryArrearsByHeroId: Record<string, number>;
  totalSalaryPaid: number;
  transactions: GuildGoldTransaction[];
  tavernLevel: number;
  tavernUpgrade: TavernUpgradeState | null;
  totalTavernIncome: number;
}

export interface GuildDayEvent {
  type: "salary_paid" | "salary_arrears" | "tavern_income" | "stamina_recovered" | "workshop_complete" | "training_complete" | "training_upgrade_complete" | "gathering_ready" | "scout_ready" | "condition_recovered" | "candidate_expired" | "contract_status" | "contract_departure" | "former_member_return" | "tavern_upgrade_complete" | "regional_threat";
  text: string;
  amount?: number;
}

export interface GuildDayResolution {
  day: number;
  payrollDue: number;
  payrollPaid: number;
  arrearsAdded: number;
  events: GuildDayEvent[];
}

export interface GuildTimeAdvanceResult {
  guild: import("../guild/types").GuildState;
  days: GuildDayResolution[];
}

export interface GuildDayPreview {
  targetDay: number;
  payrollDue: number;
  currentArrears: number;
  workshopNames: string[];
  gatheringMissionIds: string[];
  trainingHeroNames: string[];
  trainingUpgradeCompletes: boolean;
  scoutReturns: boolean;
  recoveringHeroNames: string[];
  expiringCandidateCount: number;
  contractChanges: number;
  threatIncreaseRegionIds: string[];
}

export const createGuildFinanceState = (): GuildFinanceState => ({ salaryArrearsByHeroId: {}, totalSalaryPaid: 0, transactions: [], tavernLevel: 1, tavernUpgrade: null, totalTavernIncome: 0 });
