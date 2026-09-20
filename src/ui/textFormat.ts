const DISPLAY_ACRONYMS: Readonly<Record<string, string>> = {
  ac: "AC",
  ai: "AI",
  dc: "DC",
  d20: "D20",
  hp: "HP",
  mds: "MDS",
  npc: "NPC",
  xp: "XP",
};

/** Converts a persisted code identifier into player-facing title case. */
export function formatGameId(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((word) => {
      const acronym = DISPLAY_ACRONYMS[word.toLowerCase()];
      if (acronym) return acronym;
      const spaced = word.replace(/([A-Za-z])(\d+)/g, "$1 $2");
      return spaced[0]!.toUpperCase() + spaced.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatGameIdUpper(value: string): string {
  return formatGameId(value).toUpperCase();
}
