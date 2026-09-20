import type { ClassId } from "../../heroes/types";
import type { Modifier } from "../../modifiers/types";
export interface MasteryDefinition { id: string; name: string; baseClassId: ClassId; levelRequirement: number; addedSkillIds: string[]; modifiers: Modifier[]; description: string }
