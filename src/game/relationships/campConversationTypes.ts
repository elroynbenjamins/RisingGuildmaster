export type CampConversationTrigger = "victory" | "defeat" | "shared_ideal" | "shared_bond" | "friction" | "friendship" | "rivalry" | "fallen_companion" | "shared_race" | "shared_class" | "shared_background" | "injured_companion";
export interface CampConversationLineDefinition { speaker: "a" | "b" | "narrator"; text: string }
export interface CampConversationDefinition { id: string; title: string; trigger: CampConversationTrigger; priority: number; relationshipDelta: number; lines: CampConversationLineDefinition[] }
export interface CampConversationRecord { id: string; definitionId: string; title: string; heroIdA: string; heroNameA: string; heroIdB: string; heroNameB: string; lines: { speaker: string; text: string }[]; relationshipDelta: number; reason: string }
