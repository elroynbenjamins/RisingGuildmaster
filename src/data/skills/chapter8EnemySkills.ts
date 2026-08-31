import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";
const perm=(stat:string,operation:SkillModifier["operation"],value:number):SkillModifier=>({stat,operation,value,durationTurns:-1});
export const CHAPTER_8_ENEMY_SKILLS: Record<string, CombatSkillDefinition> = {
 salt_iron_cutlass:{id:"salt_iron_cutlass",name:"Salt-Iron Cutlass",type:"basic_attack",damageType:"physical",damageMultiplier:1.15,targetType:"single_enemy",cooldownTurns:0,range:1},
 boarding_hook:{id:"boarding_hook",name:"Boarding Hook",type:"active",damageType:"physical",damageMultiplier:.9,targetType:"single_enemy",cooldownTurns:3,range:3,targetModifiers:[{stat:"movementRange",operation:"flat",value:-2,durationTurns:1}]},
 drowned_discipline:{id:"drowned_discipline",name:"Drowned Discipline",type:"passive",selfModifiers:[perm("physicalDefense","percentage",.12),perm("magicDefense","percentage",.1)]},
 nullwake_bolt:{id:"nullwake_bolt",name:"Nullwake Bolt",type:"basic_attack",damageType:"physical",damageMultiplier:1.1,targetType:"single_enemy",cooldownTurns:0,range:6},
 black_squall_volley:{id:"black_squall_volley",name:"Black Squall Volley",type:"active",damageType:"physical",damageMultiplier:.72,targetType:"all_enemies",cooldownTurns:4,range:6,targetModifiers:[{stat:"attackRollModifier",operation:"flat",value:-1,durationTurns:2}]},
 devour_oath:{id:"devour_oath",name:"Devour Oath",type:"basic_attack",damageType:"magic",damageMultiplier:1.05,targetType:"single_enemy",cooldownTurns:0,range:5},
 hush_the_sixth:{id:"hush_the_sixth",name:"Hush the Sixth",type:"active",damageType:"magic",damageMultiplier:.65,targetType:"all_enemies",cooldownTurns:4,range:5,targetModifiers:[{stat:"magicDefenseScore",operation:"flat",value:-2,durationTurns:2},{stat:"attackRollModifier",operation:"flat",value:-1,durationTurns:2}]},
 borrowed_resolve:{id:"borrowed_resolve",name:"Borrowed Resolve",type:"passive",selfModifiers:[perm("magicDamage","percentage",.15),perm("magicDefenseScore","flat",1)]},
 reaver_blade:{id:"reaver_blade",name:"Reaver Blade",type:"basic_attack",damageType:"physical",damageMultiplier:1.3,targetType:"single_enemy",cooldownTurns:0,range:1},
 undertow_charge:{id:"undertow_charge",name:"Undertow Charge",type:"active",damageType:"physical",damageMultiplier:1.15,attackRollModifier:1,targetType:"single_enemy",cooldownTurns:3,range:3,targetModifiers:[{stat:"speed",operation:"percentage",value:-.2,durationTurns:2}]},
 leviathan_maul:{id:"leviathan_maul",name:"Leviathan Maul",type:"basic_attack",damageType:"physical",damageMultiplier:1.35,targetType:"single_enemy",cooldownTurns:0,range:2},
 abyssal_hide:{id:"abyssal_hide",name:"Abyssal Hide",type:"passive",selfModifiers:[perm("armorClass","flat",2),perm("maxHP","percentage",.15)]},
 admirals_sabre:{id:"admirals_sabre",name:"Admiral's Sabre",type:"basic_attack",damageType:"physical",damageMultiplier:1.4,targetType:"single_enemy",cooldownTurns:0,range:1},
 black_tide_broadside:{id:"black_tide_broadside",name:"Black Tide Broadside",type:"active",damageType:"magic",damageMultiplier:1.05,targetType:"all_enemies",cooldownTurns:3,range:7,targetModifiers:[{stat:"physicalDefense",operation:"percentage",value:-.15,durationTurns:2}]},
 no_harbor_aura:{id:"no_harbor_aura",name:"No Harbor",type:"aura",aura:{target:"same_faction_allies",factionId:"crownless",excludeSelf:true,modifiers:[perm("damage","percentage",.15),perm("speed","percentage",.1)]}},
 last_flag_phase:{id:"last_flag_phase",name:"The Last Flag",type:"passive",conditionalModifiers:[{conditions:{selfHpRatioMax:.6},modifiers:[perm("physicalDamage","percentage",.2),perm("armorClass","flat",1)]},{conditions:{selfHpRatioMax:.3},modifiers:[perm("physicalDamage","percentage",.2),perm("magicDamage","percentage",.2),perm("speed","percentage",.15)]}]},
};
