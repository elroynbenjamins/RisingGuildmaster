import type { ClassId } from "../../heroes/types";
import type { Modifier } from "../../modifiers/types";
export interface RequirementDefinition { type: "level" | "world_flag" | "achievement" | "item"; value: string | number }
export interface SubclassDefinition { id: string; name: string; baseClassId: ClassId; levelRequirement: number; addedSkillIds: string[]; modifiers: Modifier[]; description: string; unlockRequirements?: RequirementDefinition[] }
