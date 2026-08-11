export type RelationshipBand = "rival" | "dislike" | "neutral" | "friend" | "close_friend";
export interface HeroRelationship { heroIdA: string; heroIdB: string; score: number }
