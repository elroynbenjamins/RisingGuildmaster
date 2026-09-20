export type TargetPriority = "nearest" | "lowest_hp" | "highest_damage" | "random";

export interface TacticalBehavior {
  preferredRange: number;
  retreatRange?: number;
  targetPriority: TargetPriority;
  /** Higher values make this enemy less willing to leave a hero's melee reach. */
  reactionRiskWeight?: number;
}
