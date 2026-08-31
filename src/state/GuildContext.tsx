import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createGuild } from "../game/guild/guildService";
import type { GuildState } from "../game/guild/types";
import type { RecruitmentCandidate } from "../game/recruitment/recruitmentTypes";
import { freeRefreshRecruitment, initializeRecruitment, manualRefreshRecruitment, recruitCandidate as recruit, rejectCandidate as reject, reserveCandidate as reserve, scoutRecruitmentCandidate as scout, tutorialRefreshRecruitment } from "../game/recruitment/recruitmentService";
import { createSeededRandom, randomSeed } from "../utils/random";
import { loadGuild, saveGuild } from "../game/save/saveService";
import { collectRegionalScoutReport as collectScout, dispatchRegionalScout as dispatchScout, focusRegionalScoutClass as focusScout, speedUpRegionalScout as speedUpScout } from "../game/recruitment/regionalScoutingService";
import type { ClassId, RaceId } from "../game/heroes/types";
import { recordTutorialRecruit, recordTutorialRefresh } from "../game/onboarding/tutorialService";
import type { GameDifficultyId } from "../game/difficulty/difficultyTypes";
import { loadAccountContentEntitlements } from "../game/monetization/accountEntitlementService";
import { applyContentEntitlements } from "../game/monetization/contentUnlockService";

interface GuildContextValue { guild: GuildState; candidates: RecruitmentCandidate[]; isHydrated: boolean; hasSave: boolean; gameStarted: boolean; startNewGame(difficultyId?: GameDifficultyId): void; continueGame(): void; refreshCandidates(free?: boolean): string | null; dispatchRegionalScout(raceId: RaceId, classId?: ClassId | null): string | null; focusRegionalScoutClass(classId: ClassId): string | null; speedUpRegionalScout(): string | null; collectRegionalScoutReport(): string | null; recruitCandidate(candidateId: string): string | null; scoutCandidate(candidateId: string): string | null; reserveCandidate(candidateId: string): string | null; rejectCandidate(candidateId: string): string | null; updateGuild(guild: GuildState): void }
const GuildContext = createContext<GuildContextValue | null>(null);
const resultOf = (action: () => GuildState, setGuild: React.Dispatch<React.SetStateAction<GuildState>>): string | null => { try { setGuild(action()); return null; } catch (error) { return error instanceof Error ? error.message : "Action failed"; } };

export function GuildProvider({ children }: React.PropsWithChildren) {
  const [guild, setGuild] = useState(() => createGuild()); const [hydrated, setHydrated] = useState(false); const [hasSave, setHasSave] = useState(false); const [gameStarted, setGameStarted] = useState(false);
  useEffect(() => { void Promise.all([loadGuild(), loadAccountContentEntitlements()]).then(([saved, accountEntitlements]) => { const loaded = applyContentEntitlements(saved ?? createGuild(), accountEntitlements); setGuild(initializeRecruitment(loaded, createSeededRandom(randomSeed()))); setHasSave(Boolean(saved)); setHydrated(true); }).catch(() => { setGuild(initializeRecruitment(createGuild(), createSeededRandom(randomSeed()))); setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated && gameStarted) { setHasSave(true); void saveGuild(guild); } }, [guild, hydrated, gameStarted]);
  const value = useMemo<GuildContextValue>(() => ({
    guild, candidates: guild.recruitment.candidates, isHydrated: hydrated, hasSave, gameStarted,
    startNewGame: (difficultyId = "standard") => { const freshGuild = applyContentEntitlements(createGuild("The Wayfarers", difficultyId), guild.entitlements); setGuild(initializeRecruitment(freshGuild, createSeededRandom(randomSeed()))); setGameStarted(true); setHasSave(true); },
    continueGame: () => setGameStarted(true),
    refreshCandidates: (free = false) => resultOf(() => guild.tutorial.active && guild.tutorial.step === "refresh_board" ? recordTutorialRefresh(tutorialRefreshRecruitment(guild, createSeededRandom(randomSeed()))) : free ? freeRefreshRecruitment(guild, createSeededRandom(randomSeed())) : manualRefreshRecruitment(guild, createSeededRandom(randomSeed())), setGuild),
    dispatchRegionalScout: (raceId, classId = null) => resultOf(() => dispatchScout(guild, raceId, createSeededRandom(randomSeed()), classId), setGuild),
    focusRegionalScoutClass: (classId) => resultOf(() => focusScout(guild, classId), setGuild),
    speedUpRegionalScout: () => resultOf(() => speedUpScout(guild), setGuild),
    collectRegionalScoutReport: () => resultOf(() => collectScout(guild), setGuild),
    recruitCandidate: (id) => resultOf(() => recordTutorialRecruit(recruit(guild, id)), setGuild),
    scoutCandidate: (id) => resultOf(() => scout(guild, id), setGuild),
    reserveCandidate: (id) => resultOf(() => reserve(guild, id), setGuild),
    rejectCandidate: (id) => resultOf(() => reject(guild, id, createSeededRandom(randomSeed())), setGuild),
    updateGuild: setGuild,
  }), [guild, hydrated, hasSave, gameStarted]);
  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
}
export function useGuild(): GuildContextValue { const context = useContext(GuildContext); if (!context) throw new Error("useGuild must be inside GuildProvider"); return context; }
