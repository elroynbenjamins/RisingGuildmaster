import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createGuild, recruitHero as recruit } from "../game/guild/guildService";
import type { GuildState } from "../game/guild/types";
import type { Hero } from "../game/heroes/types";
import { generateCandidates } from "../game/heroes/heroGenerator";
import { createSeededRandom, randomSeed } from "../utils/random";
import { loadGuild, saveGuild } from "../game/save/saveService";

interface GuildContextValue { guild: GuildState; candidates: Hero[]; refreshCandidates(): void; recruitHero(hero: Hero): string | null; updateGuild(guild: GuildState): void }
const GuildContext = createContext<GuildContextValue | null>(null);

export function GuildProvider({ children }: React.PropsWithChildren) {
  const [guild, setGuild] = useState(() => createGuild());
  const [hydrated, setHydrated] = useState(false);
  const [candidates, setCandidates] = useState(() => generateCandidates(createSeededRandom(randomSeed())));
  useEffect(() => { void loadGuild().then((saved) => { if (saved) setGuild(saved); setHydrated(true); }).catch(() => setHydrated(true)); }, []);
  useEffect(() => { if (hydrated) void saveGuild(guild); }, [guild, hydrated]);
  const value = useMemo<GuildContextValue>(() => ({
    guild, candidates,
    refreshCandidates: () => setCandidates(generateCandidates(createSeededRandom(randomSeed()))),
    recruitHero: (hero) => {
      try {
        const updatedGuild = recruit(guild, hero);
        setGuild(updatedGuild);
        setCandidates((current) => current.filter((item) => item.id !== hero.id));
        return null;
      } catch (error) { return error instanceof Error ? error.message : "Recruitment failed"; }
    },
    updateGuild: setGuild,
  }), [guild, candidates]);
  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
}

export function useGuild(): GuildContextValue {
  const context = useContext(GuildContext);
  if (!context) throw new Error("useGuild must be inside GuildProvider");
  return context;
}
