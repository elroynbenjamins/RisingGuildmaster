import type { ClassId, RaceId } from "../heroes/types";
import type { LorePerspective } from "../world/worldTypes";

export type QuestRecordTone = "positive" | "negative" | "neutral";
export interface QuestConsequenceRecord { id: string; text: string; tone: QuestRecordTone }
export interface QuestLoreRecord { id: string; title: string; category: string; text: string; perspectives?: LorePerspective[] }
export interface QuestHeroMoment { heroId: string; name: string; raceId: RaceId; classId: ClassId; gender: "female" | "male"; portraitVariant: 0 | 1 | 2; title: string; description: string; tone: QuestRecordTone }
export interface QuestHeroOutcomeRecord { heroId: string; name: string; raceId: RaceId; classId: ClassId; gender: "female" | "male"; portraitVariant: 0 | 1 | 2; levelBefore: number; levelAfter: number; currentHP: number; maxHP: number; conditionIds: string[]; availableSkillPoints: number; fellInBattle: boolean; newlyInjured: boolean }
export interface QuestRelationshipChange { heroIdA: string; heroNameA: string; heroIdB: string; heroNameB: string; previousScore: number; newScore: number; delta: number; previousBand: string; newBand: string; reason: string }
export interface QuestChronicleEntry { id: string; day: number; questId: string; questName: string; status: "victory" | "defeat"; aftermath: string; consequences: QuestConsequenceRecord[]; loreDiscoveries: QuestLoreRecord[]; heroMoments: QuestHeroMoment[]; relationshipChanges: QuestRelationshipChange[]; selectedChoiceId?: string }
