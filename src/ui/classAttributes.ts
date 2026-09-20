import { CLASSES } from "../data/classes/classes";
import type { AttributeKey } from "../game/attributes/types";
import type { ClassId } from "../game/heroes/types";

export function isClassAttribute(classId: ClassId, attribute: AttributeKey): boolean {
  return CLASSES[classId].favoredAttributeIds.includes(attribute);
}
