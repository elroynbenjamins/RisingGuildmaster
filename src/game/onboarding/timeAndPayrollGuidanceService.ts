import { dailyTavernIncome, payrollDueOnDay } from "../economy/guildCalendarService";
import type { GuildState } from "../guild/types";

export const CALENDAR_BASICS_GUIDANCE_FLAG = "calendar_basics_guidance_seen";
export const PAYROLL_GUIDANCE_FLAG = "payroll_guidance_seen";

export interface PayrollScheduleEntry {
  day: number;
  amount: number;
}

export interface TimeAdvanceGuidance {
  days: number;
  targetDay: number;
  payroll: PayrollScheduleEntry[];
  totalPayroll: number;
  projectedShortfall: number;
  showCalendarPrimer: boolean;
  showPayrollPrimer: boolean;
}

export function getTimeAdvanceGuidance(guild: GuildState, days: number): TimeAdvanceGuidance {
  if (!Number.isInteger(days) || days < 1) throw new Error("Days must be a positive integer");
  const payroll: PayrollScheduleEntry[] = [];
  let projectedGold = guild.gold;
  let projectedShortfall = 0;
  const tavernIncome = dailyTavernIncome(guild);

  for (let offset = 1; offset <= days; offset++) {
    const day = guild.currentDay + offset;
    projectedGold += tavernIncome;
    const amount = payrollDueOnDay(guild, day);
    if (amount <= 0) continue;
    payroll.push({ day, amount });
    const paid = Math.min(projectedGold, amount);
    projectedGold -= paid;
    projectedShortfall += amount - paid;
  }

  return {
    days,
    targetDay: guild.currentDay + days,
    payroll,
    totalPayroll: payroll.reduce((sum, entry) => sum + entry.amount, 0),
    projectedShortfall,
    showCalendarPrimer: guild.world.worldFlags[CALENDAR_BASICS_GUIDANCE_FLAG] !== true,
    showPayrollPrimer: payroll.length > 0 && guild.world.worldFlags[PAYROLL_GUIDANCE_FLAG] !== true,
  };
}

export function acknowledgeTimeAdvanceGuidance(guild: GuildState, guidance: Pick<TimeAdvanceGuidance, "showCalendarPrimer" | "showPayrollPrimer">): GuildState {
  if (!guidance.showCalendarPrimer && !guidance.showPayrollPrimer) return guild;
  return {
    ...guild,
    world: {
      ...guild.world,
      worldFlags: {
        ...guild.world.worldFlags,
        ...(guidance.showCalendarPrimer ? { [CALENDAR_BASICS_GUIDANCE_FLAG]: true } : {}),
        ...(guidance.showPayrollPrimer ? { [PAYROLL_GUIDANCE_FLAG]: true } : {}),
      },
    },
  };
}

export function payrollWarningLine(guidance: TimeAdvanceGuidance, includeProjectedShortfall = true): string | null {
  if (!guidance.payroll.length) return null;
  const schedule = guidance.payroll.map((entry) => `Day ${entry.day}: ${entry.amount} gold`).join(" · ");
  return `Payroll crossed: ${schedule}${includeProjectedShortfall && guidance.projectedShortfall > 0 ? `\nProjected unpaid wages: ${guidance.projectedShortfall} gold` : ""}`;
}
