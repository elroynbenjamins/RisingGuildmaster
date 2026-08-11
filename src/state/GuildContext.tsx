import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createGuild } from "../game/guild/guildService";
import type { GuildState } from "../game/guild/types";
import type { RecruitmentCandidate } from "../game/recruitment/recruitmentTypes";
import { freeRefreshRecruitment, initializeRecruitment, manualRefreshRecruitment, recruitCandidate as recruit, rejectCandidate as reject, reserveCandidate as reserve, scoutRecruitmentCandidate as scout } from "../game/recruitment/recruitmentService";
import { createSeededRandom, randomSeed } from "../utils/random";
import { loadGuild, saveGuild } from "../game/save/saveService";
import { collectRegionalScoutReport as collectScout, dispatchRegionalScout as dispatchScout, focusRegionalScoutClass as focusScout, speedUpRegionalScout as speedUpScout } from "../game/recruitment/regionalScoutingService";
import type { ClassId, RaceId } from "../game/heroes/types";

interface GuildContextValue { guild: GuildState; candidates: RecruitmentCandidate[]; isHydrated: boolean; refreshCandidates(free?: boolean): string | null; dispatchRegionalScout(raceId: RaceId, classId?: ClassId | null): string | null; focusRegionalScoutClass(classId: ClassId): string | null; speedUpRegionalScout(): string | null; collectRegionalScoutReport(): string | null; recruitCandidate(candidateId: string): string | null; scoutCandidate(candidateId: string): string | null; reserveCandidate(candidateId: string): string | null; rejectCandidate(candidateId: string): string | null; updateGuild(guild: GuildState): void }
const GuildContext = createContext<GuildContextValue | null>(null);
const resultOf = (action: () => GuildState, setGuild: React.Dispatch<React.SetStateAction<GuildState>>): string | null => { try { setGuild(action()); return null; } catch (error) { return error instanceof Error ? error.message : "Action failed"; } };

export function GuildProvider({ children }: React.PropsWithChildren) {
  const [guild, setGuild] = useState(() => createGuild()); const [hydrated, setHydrated] = useState(false);
  useEffect(() => { void loadGuild().then((saved) => { const loaded = saved ?? createGuild(); setGuild(initializeRecruitment(loaded, createSeededRandom(randomSeed()))); setHydrated(true); }).catch(() => { setGuild(initializeRecruitment(createGuild(), createSeededRandom(randomSeed()))); setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated) void saveGuild(guild); }, [guild, hydrated]);
  const value = useMemo<GuildContextValue>(() => ({
    guild, candidates: guild.recruitment.candidates, isHydrated: hydrated,
    refreshCandidates: (free = false) => resultOf(() => free ? freeRefreshRecruitment(guild, createSeededRandom(randomSeed())) : manualRefreshRecruitment(guild, createSeededRandom(randomSeed())), setGuild),
    dispatchRegionalScout: (raceId, classId = null) => resultOf(() => dispatchScout(guild, raceId, createSeededRandom(randomSeed()), classId), setGuild),
    focusRegionalScoutClass: (classId) => resultOf(() => focusScout(guild, classId), setGuild),
    speedUpRegionalScout: () => resultOf(() => speedUpScout(guild), setGuild),
    collectRegionalScoutReport: () => resultOf(() => collectScout(guild), setGuild),
    recruitCandidate: (id) => resultOf(() => recruit(guild, id), setGuild),
    scoutCandidate: (id) => resultOf(() => scout(guild, id), setGuild),
    reserveCandidate: (id) => resultOf(() => reserve(guild, id), setGuild),
    rejectCandidate: (id) => resultOf(() => reject(guild, id, createSeededRandom(randomSeed())), setGuild),
    updateGuild: setGuild,
  }), [guild, hydrated]);
  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
}
export function useGuild(): GuildContextValue { const context = useContext(GuildContext); if (!context) throw new Error("useGuild must be inside GuildProvider"); return context; }
