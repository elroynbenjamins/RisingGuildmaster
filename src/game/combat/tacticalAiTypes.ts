export type TargetPriority = "nearest" | "lowest_hp" | "highest_damage" | "random";

export interface TacticalBehavior {
  preferredRange: number;
  retreatRange?: number;
  targetPriority: TargetPriority;
}
