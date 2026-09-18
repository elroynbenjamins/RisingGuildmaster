import { QUEST_ENCOUNTERS } from "../../data/encounters/questEncounters";
import { getEnemyDefinition } from "../../data/enemies";
import { ENEMY_BEHAVIORS } from "../../data/enemyBehaviors/enemyBehaviors";
import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import type { QuestDefinition } from "./questTypes";
import type { QuestCombatSetup } from "../combat/combatTypes";

export interface QuestCombatProfile{physicalThreat:number;magicThreat:number;recommendedDamage:"physical"|"magic"|"mixed";conditionIds:string[];summary:string}
export function getQuestCombatProfile(quest:QuestDefinition):QuestCombatProfile{let physical=0,magic=0,physicalDefense=0,magicDefense=0,total=0;const conditions=new Set<string>();for(const encounterId of quest.encounterIds)for(const group of QUEST_ENCOUNTERS[encounterId]?.enemies??[]){const enemy=getEnemyDefinition(group.enemyDefinitionId);const behavior=ENEMY_BEHAVIORS[enemy.behaviorId];const skills=[behavior?.basicAttackSkillId,...(behavior?.rules.map((rule)=>rule.skillId)??[])].filter((id):id is string=>Boolean(id));for(const id of skills){const skill=ENEMY_SKILLS[id];if(skill?.damageType==="physical")physical+=group.count;if(skill?.damageType==="magic")magic+=group.count;skill?.conditionApplications?.forEach((entry)=>conditions.add(entry.conditionId));}physicalDefense+=(1+enemy.physicalDefenseModifier)*group.count;magicDefense+=(1+enemy.magicDefenseModifier)*group.count;total+=group.count;}const recommendedDamage=Math.abs(physicalDefense-magicDefense)<Math.max(1,total*.08)?"mixed":physicalDefense<magicDefense?"physical":"magic";const threatTotal=Math.max(1,physical+magic);const physicalThreat=physical/threatTotal,magicThreat=magic/threatTotal;const summary=physicalThreat>.7?"Primarily physical damage":magicThreat>.7?"Primarily magical damage":"Mixed physical and magical damage";return{physicalThreat,magicThreat,recommendedDamage,conditionIds:[...conditions],summary};}


export function applyQuestDifficultyCombatSetup(quest: QuestDefinition, setup?: QuestCombatSetup): QuestCombatSetup | undefined {
  if (quest.questType !== "side" || quest.hiddenFromQuestBoard) return setup;
  return {
    encounterIds: setup?.encounterIds ?? quest.encounterIds,
    label: setup?.label ?? "Side Quest · Hardened Opposition",
    heroInitiativeModifier: setup?.heroInitiativeModifier ?? 0,
    enemyInitiativeModifier: setup?.enemyInitiativeModifier ?? 0,
    heroArmorClassModifier: setup?.heroArmorClassModifier ?? 0,
    heroOpeningAttackRollModifier: setup?.heroOpeningAttackRollModifier ?? 0,
    enemyOpeningAttackRollModifier: setup?.enemyOpeningAttackRollModifier ?? 0,
    enemyAttackRollModifier: (setup?.enemyAttackRollModifier ?? 0) + 1,
    enemyPhysicalDamageModifier: setup?.enemyPhysicalDamageModifier ?? 0,
    enemyDamageModifier: (setup?.enemyDamageModifier ?? 0) + .05,
    heroHealingPowerModifier: setup?.heroHealingPowerModifier ?? 0,
    heroMovementRangeModifier: setup?.heroMovementRangeModifier ?? 0,
    enemyMovementRangeModifier: setup?.enemyMovementRangeModifier ?? 0,
  };
}
