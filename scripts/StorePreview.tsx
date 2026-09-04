// Isolated store capture fixture: never imported by the production entry point.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GuildProvider, useGuild } from '../src/state/GuildContext';
import { ThemeProvider } from '../src/theme/theme';
import { GameDialogProvider } from '../src/components/dialogs/GameDialog';
import { createGuild } from '../src/game/guild/guildService';
import { generateHero } from '../src/game/heroes/heroGenerator';
import { createSeededRandom } from '../src/utils/random';
import { WorldMapScreen } from '../src/screens/WorldMap/WorldMapScreen';
import { DungeonScreen } from '../src/screens/Dungeon/DungeonScreen';
import { CombatScreen } from '../src/screens/CombatScreen';
import { ManagementShell } from '../src/components/navigation/ManagementShell';
import { startDungeonRun, markDungeonNodeResolved } from '../src/game/dungeons/dungeonService';
import { createHeroCombatInstance } from '../src/game/combat/heroCombatFactory';
import { REGIONS } from '../src/data/world/regions';
import { SETTLEMENTS } from '../src/data/world/settlements';

const noop = () => {};
const random = createSeededRandom(4932);
const fixture = createGuild('The Wayfarers');
fixture.currentDay = 126;
fixture.gold = 3240;
fixture.gems = 35;
fixture.reputation = 180;
fixture.rations = 48;
fixture.world.campaignChapter = 7;
fixture.world.unlockedRegionIds = Object.keys(REGIONS);
fixture.world.discoveredSettlementIds = Object.keys(SETTLEMENTS);
fixture.heroes = (['warrior', 'paladin', 'cleric', 'ranger', 'berserker', 'mage', 'cleric', 'ranger'] as const).map((classId, i) => generateHero(random, {classId, raceId: (['human','dwarf','elf','orc'] as const)[i % 4], gender: i % 2 ? 'female' : 'male', level: 12}));
fixture.activeDungeonRun = markDungeonNodeResolved(startDungeonRun('wardstone_depths', [], fixture.heroes.slice(0,4).map(h=>h.id), fixture.heroes.slice(0,4).map(createHeroCombatInstance), random), 'The sealed stair opens. Choose your route into the crypt.');

function Preview() {
  const {isHydrated, updateGuild, guild} = useGuild();
  const [ready, setReady] = useState(false);
  useEffect(() => {if(isHydrated) {updateGuild(fixture);setReady(true);}}, [isHydrated]);
  if (!ready) return null;
  const screen = new URLSearchParams(window.location.search).get('screen');
  if (screen === 'raid') return <CombatScreen questId="raid_white_maw_unbound" heroes={guild.heroes} combatSetup={{encounterIds:['raid_white_maw_final'],label:'White Maw Caldera',heroInitiativeModifier:0,enemyInitiativeModifier:0,heroArmorClassModifier:0,heroOpeningAttackRollModifier:0,enemyOpeningAttackRollModifier:0}} onQuestEnd={noop}/>;
  if (screen === 'dungeon') return <DungeonScreen guild={guild} random={random} updateGuild={updateGuild} onBack={noop} startCombat={noop}/>;
  return <ManagementShell guild={guild} active="World" onSelect={noop} onOpenGems={noop}><WorldMapScreen guild={guild} random={random} updateGuild={updateGuild} openQuest={noop} openRegion={noop} openCampaign={noop} openEvent={noop}/></ManagementShell>;
}
export default function StorePreview(){return <SafeAreaProvider><ThemeProvider themeId="guild_dark"><GuildProvider><GameDialogProvider><View style={{flex:1,backgroundColor:'#101416'}}><Preview/></View></GameDialogProvider></GuildProvider></ThemeProvider></SafeAreaProvider>;}
