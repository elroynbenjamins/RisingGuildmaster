export type GuildCrestId = "crownroad" | "oakshield" | "wardflame" | "moonstag" | "ironwing" | "riverbell" | "sunhammer" | "nightfox";

export interface GuildCrestDefinition {
  id: GuildCrestId;
  name: string;
  symbol: string;
  motto: string;
  accent: string;
}

export const GUILD_CRESTS: Record<GuildCrestId, GuildCrestDefinition> = {
  crownroad: { id:"crownroad", name:"Crownroad Star", symbol:"✦", motto:"Every road remembers", accent:"#d8ad5c" },
  oakshield: { id:"oakshield", name:"Oak Shield", symbol:"◆", motto:"Stand where roots hold", accent:"#7fa35d" },
  wardflame: { id:"wardflame", name:"Ward Flame", symbol:"▲", motto:"Keep the light", accent:"#d66f4c" },
  moonstag: { id:"moonstag", name:"Moon Stag", symbol:"◇", motto:"Walk the hidden path", accent:"#9aaee0" },
  ironwing: { id:"ironwing", name:"Iron Wing", symbol:"V", motto:"Rise through the storm", accent:"#9ea7aa" },
  riverbell: { id:"riverbell", name:"River Bell", symbol:"◉", motto:"Answer when called", accent:"#68a7b6" },
  sunhammer: { id:"sunhammer", name:"Sun Hammer", symbol:"✚", motto:"Forge the dawn", accent:"#e0a34d" },
  nightfox: { id:"nightfox", name:"Night Fox", symbol:"✧", motto:"Know before striking", accent:"#a778c2" },
};

export const STARTER_GUILD_CREST_IDS: GuildCrestId[] = Object.keys(GUILD_CRESTS) as GuildCrestId[];
