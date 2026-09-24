import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createGuild } from "../game/guild/guildService";
import type { GuildState } from "../game/guild/types";
import type { RecruitmentCandidate } from "../game/recruitment/recruitmentTypes";
import { freeRefreshRecruitment, initializeRecruitment, manualRefreshRecruitment, recruitCandidate as recruit, rejectCandidate as reject, reserveCandidate as reserve, scoutRecruitmentCandidate as scout, tutorialRefreshRecruitment } from "../game/recruitment/recruitmentService";
import { createSeededRandom, randomSeed } from "../utils/random";
import { deleteGuildSave, listSaveSlots, loadGuild, saveGuild, type SaveSlotId, type SaveSlotSummary } from "../game/save/saveService";
import { collectRegionalScoutReport as collectScout, dispatchRegionalScout as dispatchScout, focusRegionalScoutClass as focusScout, speedUpRegionalScout as speedUpScout } from "../game/recruitment/regionalScoutingService";
import type { ClassId, RaceId } from "../game/heroes/types";
import { recordTutorialRecruit, recordTutorialRefresh } from "../game/onboarding/tutorialService";
import type { GameDifficultyId } from "../game/difficulty/difficultyTypes";
import type { GuildCrestId } from "../data/guild/guildCrests";
import { loadAccountContentEntitlements } from "../game/monetization/accountEntitlementService";
import { applyContentEntitlements } from "../game/monetization/contentUnlockService";
import { accountGemWalletFromGuild, applyAccountGemWallet, loadAccountGemWallet, saveAccountGemWallet } from "../game/monetization/accountGemWalletService";

interface GuildContextValue {
  guild: GuildState;
  candidates: RecruitmentCandidate[];
  isHydrated: boolean;
  hasSave: boolean;
  gameStarted: boolean;
  saveError: string | null;
  activeSlotId: SaveSlotId | null;
  activeSaveSlot: SaveSlotId | null;
  returnToMainMenu(): Promise<void>;
  saveSlots: SaveSlotSummary[];
  startNewGame(slotId: SaveSlotId, difficultyId?: GameDifficultyId, guildName?: string, crestId?: GuildCrestId): void;
  continueGame(slotId: SaveSlotId): Promise<string | null>;
  deleteSaveSlot(slotId: SaveSlotId): Promise<void>;
  refreshCandidates(free?: boolean): string | null;
  dispatchRegionalScout(raceId: RaceId, classId?: ClassId | null): string | null;
  focusRegionalScoutClass(classId: ClassId): string | null;
  speedUpRegionalScout(): string | null;
  collectRegionalScoutReport(): string | null;
  recruitCandidate(candidateId: string): string | null;
  scoutCandidate(candidateId: string): string | null;
  reserveCandidate(candidateId: string): string | null;
  rejectCandidate(candidateId: string): string | null;
  updateGuild: React.Dispatch<React.SetStateAction<GuildState>>;
}
const GuildContext = createContext<GuildContextValue | null>(null);
const resultOf = (action: () => GuildState, setGuild: React.Dispatch<React.SetStateAction<GuildState>>): string | null => { try { setGuild(action()); return null; } catch (error) { return error instanceof Error ? error.message : "Action failed"; } };

export function GuildProvider({ children }: React.PropsWithChildren) {
  const [guild, setGuild] = useState(() => createGuild());
  const [hydrated, setHydrated] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSlotId, setActiveSlotId] = useState<SaveSlotId | null>(null);
  const [saveSlots, setSaveSlots] = useState<SaveSlotSummary[]>([{slotId:1,exists:false},{slotId:2,exists:false}]);

  useEffect(() => {
    void Promise.all([listSaveSlots(), loadAccountContentEntitlements()])
      .then(async ([slots, accountEntitlements]) => {
        setSaveSlots(slots);
        const wallet = await loadAccountGemWallet();
        const entitlementAwareGuild = applyContentEntitlements(createGuild(), accountEntitlements);
        const accountAwareGuild = wallet ? applyAccountGemWallet(entitlementAwareGuild, wallet) : entitlementAwareGuild;
        setGuild(initializeRecruitment(accountAwareGuild, createSeededRandom(randomSeed())));
        setHydrated(true);
      })
      .catch(() => {
        setGuild(initializeRecruitment(createGuild(), createSeededRandom(randomSeed())));
        setHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated || !gameStarted || activeSlotId === null) return;
    void saveGuild(guild, activeSlotId).then(() => { setSaveError(null); return listSaveSlots(); }).then(setSaveSlots).catch((error: unknown) => setSaveError(error instanceof Error ? error.message : "Your guild could not be saved."));
  }, [guild, hydrated, gameStarted, activeSlotId]);

  useEffect(() => {
    if (!hydrated || !gameStarted) return;
    void saveAccountGemWallet(accountGemWalletFromGuild(guild)).catch((error: unknown) =>
      setSaveError(error instanceof Error ? error.message : "Your account-wide Gem wallet could not be saved."),
    );
  }, [guild.gems, guild.gemTransactions, hydrated, gameStarted]);

  const value = useMemo<GuildContextValue>(() => ({
    guild,
    candidates: guild.recruitment.candidates,
    isHydrated: hydrated,
    hasSave: saveSlots.some((slot) => slot.exists),
    gameStarted,
    saveError,
    activeSlotId,
    activeSaveSlot: activeSlotId,
    returnToMainMenu: async () => { if (activeSlotId !== null) await saveGuild(guild, activeSlotId); await saveAccountGemWallet(accountGemWalletFromGuild(guild)); setSaveSlots(await listSaveSlots()); setGameStarted(false); setActiveSlotId(null); },
    saveSlots,
    startNewGame: (slotId, difficultyId = "standard", guildName = "The Wayfarers", crestId = "crownroad") => {
      const freshGuild = applyAccountGemWallet(applyContentEntitlements(createGuild(guildName.trim() || "The Wayfarers", difficultyId, crestId), guild.entitlements), { gems: guild.gems, gemTransactions: guild.gemTransactions });
      setActiveSlotId(slotId);
      setGuild(initializeRecruitment(freshGuild, createSeededRandom(randomSeed())));
      setGameStarted(true);
    },
    continueGame: async (slotId) => {
      try {
        const saved = await loadGuild(slotId);
        if (!saved) return "Save slot is empty.";
        const accountEntitlements = await loadAccountContentEntitlements();
        const accountWallet = await loadAccountGemWallet();
        const entitlementAwareSaved = applyContentEntitlements(saved, accountEntitlements);
        const accountAwareSaved = accountWallet ? applyAccountGemWallet(entitlementAwareSaved, accountWallet) : entitlementAwareSaved;
        if (!accountWallet) await saveAccountGemWallet(accountGemWalletFromGuild(accountAwareSaved));
        setActiveSlotId(slotId);
        setGuild(initializeRecruitment(accountAwareSaved, createSeededRandom(randomSeed())));
        setGameStarted(true);
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : "Save slot could not be loaded.";
      }
    },
    deleteSaveSlot: async (slotId) => {
      await deleteGuildSave(slotId);
      setSaveSlots(await listSaveSlots());
      if (activeSlotId === slotId) {
        setActiveSlotId(null);
        setGameStarted(false);
      }
    },
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
  }), [guild, hydrated, saveSlots, gameStarted, activeSlotId, saveError]);
  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
}
export function useGuild(): GuildContextValue { const context = useContext(GuildContext); if (!context) throw new Error("useGuild must be inside GuildProvider"); return context; }
