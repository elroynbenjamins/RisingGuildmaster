export type GuildRankId = "unknown_charter" | "local_company" | "regional_guild" | "crownroad_authority" | "eldorian_vanguard" | "legendary_order";
export interface GuildRankBenefits { contractGoldModifier: number; tavernIncomeModifier: number; trophyDisplaySlots: number; questReputationModifier: number }
export interface GuildRankDefinition { id: GuildRankId; name: string; reputationRequired: number; description: string; unlocks: string[]; benefits: GuildRankBenefits }
export type TrophyBonusTarget = "tavern_income" | "ration_bundle" | "gathering_xp";
export interface GuildTrophyDefinition { id: string; name: string; description: string; sourceQuestId: string; bonus: { target: TrophyBonusTarget; value: number; label: string } }
export interface GuildLegacyState { displayedTrophyIds: string[] }
