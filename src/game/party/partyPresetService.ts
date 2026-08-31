import type { GuildState, PartyPreset } from "../guild/types";

export function savePartyPreset(guild:GuildState,heroIds:readonly string[],slot?:number):GuildState{
  const valid=[...new Set(heroIds)].filter((id)=>guild.heroes.some((hero)=>hero.id===id));
  if(!valid.length)throw new Error("Select at least one hero before saving a squad.");
  const target=slot??Math.min(guild.partyPresets.length,2);const preset:PartyPreset={id:`squad-${target+1}`,name:`Squad ${target+1}`,heroIds:valid};
  const presets=[...guild.partyPresets];presets[target]=preset;
  return {...guild,partyPresets:presets.slice(0,3)};
}

export function loadPartyPreset(guild:GuildState,presetId:string,maxPartySize:number,staminaCost:number):string[]{
  const preset=guild.partyPresets.find((entry)=>entry.id===presetId);if(!preset)return [];
  return preset.heroIds.filter((id)=>{const hero=guild.heroes.find((entry)=>entry.id===id);return Boolean(hero?.isAvailable&&hero.currentHP>0&&hero.adventureStamina>=staminaCost);}).slice(0,maxPartySize);
}
