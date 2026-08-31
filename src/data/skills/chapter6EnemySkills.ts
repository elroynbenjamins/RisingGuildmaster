import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";
const mod=(stat:string,operation:SkillModifier["operation"],value:number,durationTurns:number):SkillModifier=>({stat,operation,value,durationTurns});
export const CHAPTER_6_ENEMY_SKILLS:Record<string,CombatSkillDefinition>={
 laurel_sword:{id:"laurel_sword",name:"Laurel Sword",type:"basic_attack",damageType:"physical",damageMultiplier:1.1,targetType:"single_enemy",cooldownTurns:0,range:1},
 formation_rebuke:{id:"formation_rebuke",name:"Formation Rebuke",type:"active",damageType:"physical",damageMultiplier:.9,targetType:"single_enemy",cooldownTurns:3,range:1,targetModifiers:[mod("attackRoll","flat",-2,2)]},
 writ_of_order:{id:"writ_of_order",name:"Writ of Order",type:"aura",aura:{target:"same_faction_allies",factionId:"bandits",excludeSelf:true,modifiers:[mod("armorClass","flat",1,-1)]}},
 laurel_bolt:{id:"laurel_bolt",name:"Laurel Bolt",type:"basic_attack",damageType:"physical",damageMultiplier:1.05,targetType:"single_enemy",cooldownTurns:0,range:7},
 pinning_volley:{id:"pinning_volley",name:"Pinning Volley",type:"active",damageType:"physical",damageMultiplier:.8,targetType:"all_enemies",cooldownTurns:4,range:6,targetModifiers:[mod("movementRange","flat",-1,2)]},
 oath_spark:{id:"oath_spark",name:"Oath Spark",type:"basic_attack",damageType:"magic",damageMultiplier:1.05,targetType:"single_enemy",cooldownTurns:0,range:5},
 binding_clause:{id:"binding_clause",name:"Binding Clause",type:"active",damageType:"magic",damageMultiplier:.65,targetType:"single_enemy",cooldownTurns:3,range:5,conditionApplications:[{conditionId:"rooted",chance:.45,durationTurns:1,resistanceKey:"root"}]},
 examiner_hammer:{id:"examiner_hammer",name:"Examiner's Hammer",type:"basic_attack",damageType:"physical",damageMultiplier:1.25,targetType:"single_enemy",cooldownTurns:0,range:1},
 unlawful_command:{id:"unlawful_command",name:"Unlawful Command",type:"active",damageType:"magic",damageMultiplier:.55,targetType:"all_enemies",cooldownTurns:4,range:5,targetModifiers:[mod("attackRoll","flat",-2,2)]},
 echo_touch:{id:"echo_touch",name:"Echo Touch",type:"basic_attack",damageType:"magic",damageMultiplier:1.15,targetType:"single_enemy",cooldownTurns:0,range:4},
 borrowed_face:{id:"borrowed_face",name:"Borrowed Face",type:"active",targetType:"self",cooldownTurns:3,selfModifiers:[mod("evasion","percentage",.25,2),mod("magicDefense","percentage",.15,2)]},
 cassian_blade:{id:"cassian_blade",name:"Master's Measure",type:"basic_attack",damageType:"physical",damageMultiplier:1.3,attackRollModifier:1,targetType:"single_enemy",cooldownTurns:0,range:1},
 crown_decree:{id:"crown_decree",name:"Crown Decree",type:"active",damageType:"magic",damageMultiplier:.8,targetType:"all_enemies",cooldownTurns:4,range:6,targetModifiers:[mod("attackRoll","flat",-2,2),mod("movementRange","flat",-1,2)]},
 perfected_authority:{id:"perfected_authority",name:"Perfected Authority",type:"passive",conditionalModifiers:[{conditions:{selfHpRatioMax:.6},modifiers:[mod("damage","percentage",.2,-1),mod("armorClass","flat",1,-1)]},{conditions:{selfHpRatioMax:.3},modifiers:[mod("speed","percentage",.2,-1),mod("magicDamage","percentage",.25,-1)]}]},
 sixth_denial:{id:"sixth_denial",name:"Denial of the Sixth",type:"active",damageType:"magic",damageMultiplier:1.25,targetType:"single_enemy",cooldownTurns:3,range:6,conditionApplications:[{conditionId:"silenced",chance:.4,durationTurns:1,resistanceKey:"silence"}]},
};
