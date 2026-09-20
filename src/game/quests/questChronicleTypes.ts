import type { ClassId, RaceId } from "../heroes/types";
import type { LorePerspective } from "../world/worldTypes";
import type { CampConversationRecord } from "../relationships/campConversationTypes";

export type QuestRecordTone = "positive" | "negative" | "neutral";
export interface QuestConsequenceRecord { id: string; text: string; tone: QuestRecordTone }
export interface QuestLoreRecord { id: string; title: string; category: string; text: string; perspectives?: LorePerspective[] }
export interface QuestHeroMoment { heroId: string; name: string; raceId: RaceId; classId: ClassId; gender: "female" | "male"; portraitVariant: 0 | 1 | 2 | 3 | 4; title: string; description: string; tone: QuestRecordTone }
export interface QuestHeroOutcomeRecord { heroId: string; name: string; raceId: RaceId; classId: ClassId; gender: "female" | "male"; portraitVariant: 0 | 1 | 2 | 3 | 4; levelBefore: number; levelAfter: number; /** Optional for legacy result fixtures created before Pass 14. */ xpBefore?: number; xpAfter?: number; xpEarned?: number; currentHP: number; maxHP: number; conditionIds: string[]; availableSkillPoints: number; availableSkillPointsBefore?: number; availableSkillPointsAfter?: number; fellInBattle: boolean; newlyInjured: boolean }
export interface QuestRelationshipChange { heroIdA: string; heroNameA: string; heroIdB: string; heroNameB: string; previousScore: number; newScore: number; delta: number; previousBand: string; newBand: string; reason: string }
export interface QuestChronicleEntry { id: string; day: number; questId: string; questName: string; status: "victory" | "defeat"; aftermath: string; consequences: QuestConsequenceRecord[]; loreDiscoveries: QuestLoreRecord[]; heroMoments: QuestHeroMoment[]; relationshipChanges: QuestRelationshipChange[]; campConversation?: CampConversationRecord; selectedChoiceId?: string }
