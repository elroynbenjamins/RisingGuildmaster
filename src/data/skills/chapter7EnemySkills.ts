import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";
const perm=(stat:string,operation:SkillModifier["operation"],value:number):SkillModifier=>({stat,operation,value,durationTurns:-1});
export const CHAPTER_7_ENEMY_SKILLS:Record<string,CombatSkillDefinition>={
 brass_halberd:{id:"brass_halberd",name:"Brass Halberd",type:"basic_attack",damageType:"physical",damageMultiplier:1.15,targetType:"single_enemy",cooldownTurns:0,range:2},
 embassy_interdict:{id:"embassy_interdict",name:"Embassy Interdict",type:"active",damageType:"magic",damageMultiplier:.7,targetType:"all_enemies",cooldownTurns:4,range:3,targetModifiers:[{stat:"movementRange",operation:"flat",value:-1,durationTurns:2}]},
 hollow_protocol:{id:"hollow_protocol",name:"Hollow Protocol",type:"passive",selfModifiers:[perm("armorClass","flat",1),perm("magicDefenseScore","flat",1)]},
 crown_pick:{id:"crown_pick",name:"Crown Pick",type:"basic_attack",damageType:"physical",damageMultiplier:1.05,targetType:"single_enemy",cooldownTurns:0,range:1},
 sever_anchor:{id:"sever_anchor",name:"Sever Anchor",type:"active",damageType:"physical",damageMultiplier:1.2,attackRollModifier:-1,targetType:"single_enemy",cooldownTurns:3,range:1,targetModifiers:[{stat:"physicalDefense",operation:"percentage",value:-.15,durationTurns:2}]},
 storm_beak:{id:"storm_beak",name:"Storm Beak",type:"basic_attack",damageType:"magic",damageMultiplier:.95,targetType:"single_enemy",cooldownTurns:0,range:4},
 mimic_cry:{id:"mimic_cry",name:"Mimic Cry",type:"active",damageType:"magic",damageMultiplier:.55,targetType:"all_enemies",cooldownTurns:4,range:4,targetModifiers:[{stat:"attackRollModifier",operation:"flat",value:-2,durationTurns:2}]},
 gale_wings:{id:"gale_wings",name:"Gale Wings",type:"passive",selfModifiers:[perm("evasion","percentage",.12),perm("speed","percentage",.1)]},
 drake_fang_brass:{id:"drake_fang_brass",name:"Brass Fang",type:"basic_attack",damageType:"physical",damageMultiplier:1.25,targetType:"single_enemy",cooldownTurns:0,range:1},
 thunder_sweep:{id:"thunder_sweep",name:"Thunder Sweep",type:"active",damageType:"magic",damageMultiplier:.75,targetType:"all_enemies",cooldownTurns:3,range:3,targetModifiers:[{stat:"speed",operation:"percentage",value:-.2,durationTurns:2}]},
 beacon_spark:{id:"beacon_spark",name:"Beacon Spark",type:"basic_attack",damageType:"magic",damageMultiplier:1.05,targetType:"single_enemy",cooldownTurns:0,range:6},
 crown_refraction:{id:"crown_refraction",name:"Crown Refraction",type:"active",damageType:"magic",damageMultiplier:.8,targetType:"all_enemies",cooldownTurns:4,range:5,targetModifiers:[{stat:"magicDefenseScore",operation:"flat",value:-2,durationTurns:2}]},
 gilded_bite:{id:"gilded_bite",name:"Gilded Bite",type:"basic_attack",damageType:"physical",damageMultiplier:1.35,targetType:"single_enemy",cooldownTurns:0,range:1},
 rupture_breath:{id:"rupture_breath",name:"Rupture Breath",type:"active",damageType:"magic",damageMultiplier:1.05,targetType:"all_enemies",cooldownTurns:3,range:5,targetModifiers:[{stat:"magicDefenseScore",operation:"flat",value:-2,durationTurns:2}]},
 stolen_concord:{id:"stolen_concord",name:"Stolen Concord",type:"aura",aura:{target:"same_faction_allies",factionId:"constructs",excludeSelf:true,modifiers:[perm("damage","percentage",.15),perm("armorClass","flat",1)]}},
 storm_rupture:{id:"storm_rupture",name:"Storm Rupture",type:"passive",conditionalModifiers:[{conditions:{selfHpRatioMax:.6},modifiers:[perm("magicDamage","percentage",.2),perm("speed","percentage",.1)]},{conditions:{selfHpRatioMax:.3},modifiers:[perm("physicalDamage","percentage",.2),perm("magicDamage","percentage",.2),perm("armorClass","flat",1)]}]},
};
