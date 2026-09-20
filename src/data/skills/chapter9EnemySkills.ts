import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";
const perm=(stat:string,operation:SkillModifier["operation"],value:number):SkillModifier=>({stat,operation,value,durationTurns:-1});
export const CHAPTER_9_ENEMY_SKILLS: Record<string, CombatSkillDefinition> = {
 drowned_halberd:{id:"drowned_halberd",name:"Drowned Halberd",type:"basic_attack",damageType:"physical",damageMultiplier:1.2,targetType:"single_enemy",cooldownTurns:0,range:2},
 undertow_guard:{id:"undertow_guard",name:"Undertow Guard",type:"passive",selfModifiers:[perm("armorClass","flat",1),perm("physicalDefense","percentage",.12)]},
 lantern_ray:{id:"lantern_ray",name:"Abyssal Lantern Ray",type:"basic_attack",damageType:"magic",damageMultiplier:1.1,targetType:"single_enemy",cooldownTurns:0,range:6},
 borrowed_light:{id:"borrowed_light",name:"Borrowed Light",type:"active",targetType:"all_allies",cooldownTurns:4,range:4,targetModifiers:[{stat:"attackRollModifier",operation:"flat",value:2,durationTurns:2}]},
 eat_the_name:{id:"eat_the_name",name:"Eat the Name",type:"basic_attack",damageType:"magic",damageMultiplier:.9,targetType:"single_enemy",cooldownTurns:0,range:4,targetModifiers:[{stat:"attackRollModifier",operation:"flat",value:-2,durationTurns:2}]},
 swarm_of_doubt:{id:"swarm_of_doubt",name:"Swarm of Doubt",type:"active",damageType:"magic",damageMultiplier:.65,targetType:"all_enemies",cooldownTurns:4,range:4,conditionApplications:[{conditionId:"frightened",chance:.25,durationTurns:1}]},
 tideglass_claw:{id:"tideglass_claw",name:"Tideglass Claw",type:"basic_attack",damageType:"physical",damageMultiplier:1.25,targetType:"single_enemy",cooldownTurns:0,range:1},
 mirror_step:{id:"mirror_step",name:"Mirror Step",type:"passive",selfModifiers:[perm("evasion","percentage",.15),perm("speed","percentage",.12)]},
 gate_fist:{id:"gate_fist",name:"Seventh Gate Fist",type:"basic_attack",damageType:"physical",damageMultiplier:1.4,targetType:"single_enemy",cooldownTurns:0,range:2},
 civic_bulwark:{id:"civic_bulwark",name:"Civic Bulwark",type:"passive",selfModifiers:[perm("armorClass","flat",2),perm("magicDefenseScore","flat",2)]},
 chartmakers_blade:{id:"chartmakers_blade",name:"Chartmaker's Blade",type:"basic_attack",damageType:"physical",damageMultiplier:1.45,targetType:"single_enemy",cooldownTurns:0,range:2},
 redraw_battlefield:{id:"redraw_battlefield",name:"Redraw the Battlefield",type:"active",damageType:"magic",damageMultiplier:.85,targetType:"all_enemies",cooldownTurns:4,range:7,targetModifiers:[{stat:"movementRange",operation:"flat",value:-1,durationTurns:2}]},
 law_of_the_drowned:{id:"law_of_the_drowned",name:"Law of the Drowned",type:"aura",aura:{target:"same_faction_allies",factionId:"crownless",excludeSelf:true,modifiers:[perm("damage","percentage",.15),perm("magicDefenseScore","flat",1)]}},
 below_the_chart:{id:"below_the_chart",name:"Below the Chart",type:"passive",conditionalModifiers:[{conditions:{selfHpRatioMax:.65},modifiers:[perm("magicDamage","percentage",.2),perm("speed","percentage",.1)]},{conditions:{selfHpRatioMax:.3},modifiers:[perm("physicalDamage","percentage",.25),perm("armorClass","flat",2)]}]},
 tidal_sentence:{id:"tidal_sentence",name:"Tidal Sentence",type:"active",damageType:"magic",damageMultiplier:1.15,targetType:"single_enemy",cooldownTurns:3,range:6,conditionApplications:[{conditionId:"stunned",chance:.25,durationTurns:1}]},
 chained_voice:{id:"chained_voice",name:"The Chained Voice",type:"active",damageType:"magic",damageMultiplier:.95,targetType:"all_enemies",cooldownTurns:5,range:8,targetModifiers:[{stat:"magicDefenseScore",operation:"flat",value:-2,durationTurns:2}]},
};
