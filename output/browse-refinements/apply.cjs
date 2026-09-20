const fs=require('fs');function edit(p,f){fs.copyFileSync(p,'output/browse-refinements/'+p.replaceAll('/','__')+'.before');const s=f(fs.readFileSync(p,'utf8'));fs.writeFileSync(p+'.tmp',s);fs.renameSync(p+'.tmp',p)}
function st(s,k,changes){const re=new RegExp('('+k+': \\{)([^}]*)(\\})');if(!re.test(s))throw Error(k);return s.replace(re,(_,a,b,c)=>{for(const key of Object.keys(changes))b=b.replace(new RegExp('\\b'+key+': [^,}]+,? ?','g'),'');b=b.trim().replace(/,$/,'');return a+(b?b+', ':' ')+Object.entries(changes).map(([k,v])=>k+': '+v).join(', ')+c})}
fs.writeFileSync('src/ui/selectionStyle.ts',`import type { ViewStyle } from "react-native";
import type { ThemePalette } from "../theme/theme";
/** A quiet surface and gold lower edge; the reserved edge prevents layout shifts. */
export function selectionStyle(colors: Pick<ThemePalette, "gold" | "panel2">, selected: boolean): ViewStyle {
  return { borderBottomWidth: 2, borderBottomColor: selected ? colors.gold : "transparent", ...(selected ? { backgroundColor: colors.panel2 } : {}) };
}
`);
edit('src/screens/Heroes/HeroesScreen.tsx',s=>{s=s.replace('import { ScrollView,','import { Pressable, ScrollView,');s=s.replace('  const [query, setQuery]','  const [showSort, setShowSort] = useState(false);\n  const [showSummary, setShowSummary] = useState(false);\n  const [query, setQuery]');
const a=s.indexOf('    <View style={[styles.rosterBanner'),b=s.indexOf('    <View style={styles.overview}>',a);s=s.slice(0,a)+`    <View style={styles.rosterBanner}>
      <Text style={[styles.title, { color: themeColors.text }]}>Adventurers</Text>
      <View style={styles.compactRow}>
        <Text style={[styles.count, { color: themeColors.muted, flex: 1 }]}>{guild.heroes.length} / {RECRUITMENT_CONFIG.heroCapacity} roster slots</Text>
        {capacityReached ? <Text style={{ color: themeColors.muted }}>Roster full</Text> : <SecondaryButton label="Recruit" onPress={recruit} />}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Roster summary" accessibilityState={{ expanded: showSummary }} onPress={() => setShowSummary(value => !value)} style={styles.summaryToggle}>
        <Text style={{ color: themeColors.muted }}>{availableCount} ready · {attentionCount} need attention</Text><Text style={{ color: themeColors.muted }}>{showSummary ? '−' : '+'}</Text>
      </Pressable>
    </View>

`+s.slice(b);
s=s.replace('    <View style={styles.overview}>','    {showSummary && <View style={styles.overview}>');const end=s.indexOf('    {fallenCount > 0');const before=s.slice(0,end);s=before.replace(/    <\/View>\s*$/,'    </View>}\n\n')+s.slice(end);
const fa=s.indexOf('    {fallenCount > 0'),fb=s.indexOf('    <Panel style={styles.rosterTools}>',fa);s=s.slice(0,fa)+`    {fallenCount > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Show fallen heroes" onPress={() => setFilter("Fallen")} style={[styles.memorial, { backgroundColor: themeColors.panel }]}><Text style={{ color: themeColors.danger }}>{fallenCount} fallen · View heroes needing revival ›</Text></Pressable>}

`+s.slice(fb);
const ta=s.indexOf('      <View style={styles.toolHeading}>'),tb=s.indexOf('    {heroes.map',ta);s=s.slice(0,ta)+`      <View style={styles.compactRow}>
        <TextInput accessibilityLabel="Search hero roster" value={query} onChangeText={setQuery} placeholder="Search heroes" placeholderTextColor={themeColors.muted} style={[styles.search, { flex: 1, minWidth: 0, backgroundColor: themeColors.panel2, color: themeColors.text }]} />
        <Pressable accessibilityRole="button" accessibilityLabel="Sort heroes" accessibilityState={{ expanded: showSort }} onPress={() => setShowSort(value => !value)} style={styles.sortToggle}><Text style={{ color: themeColors.muted }}>Sort: {sort} {showSort ? '−' : '+'}</Text></Pressable>
      </View>
      <SegmentedTabs values={FILTERS} value={filter} onChange={setFilter} />
      {showSort && <SegmentedTabs values={SORTS} value={sort} onChange={value => { setSort(value); setShowSort(false); }} />}
    </Panel>
    <Text style={[styles.cardHeader, { color: themeColors.muted }]}>{heroes.length} {heroes.length === 1 ? "hero" : "heroes"} shown · Tap to inspect</Text>

`+s.slice(tb);
s=st(s,'rosterBanner',{padding:'0',minHeight:'0',gap:'2',marginBottom:'4'});s=st(s,'title',{fontSize:'25',lineHeight:'31'});s=st(s,'rosterTools',{padding:'0',borderWidth:'0',backgroundColor:'"transparent"',marginBottom:'0'});s=st(s,'memorial',{minHeight:'44',justifyContent:'"center"',padding:'10',marginBottom:'8'});s=st(s,'search',{marginBottom:'0',minHeight:'44'});s=s.replace('const styles = StyleSheet.create({','const styles = StyleSheet.create({\n  compactRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },\n  summaryToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 44 },\n  sortToggle: { minHeight: 44, justifyContent: "center", paddingHorizontal: 6 },');return s});
edit('src/screens/Recruitment/RegionalScoutPanel.tsx',s=>{const a=s.indexOf('  if (!regionalUnlocked) return'),b=s.indexOf('\n\n  const selected',a);s=s.slice(0,a)+`  if (!regionalUnlocked) return <Panel style={styles.lockedPanel}>
    <Pressable accessibilityRole="button" accessibilityLabel="Regional scouting unlock requirements" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={styles.lockedToggle}>
      <Text style={{ color: colors.muted, flex: 1 }}>Regional scouting · Locked</Text><Text style={{ color: colors.muted }}>{expanded ? '−' : '+'}</Text>
    </Pressable>
    {expanded && <View style={{ gap: 8, paddingBottom: 10 }}><Text style={styles.description}>Reach Guildmaster Level 2 and learn Regional Network in Guild Hall → Manage → Guildmaster Skills. Regular recruitment remains available.</Text><Text style={styles.unlockRequirement}>Requires level 2 · 1 skill point</Text></View>}
  </Panel>;`+s.slice(b);s=st(s,'lockedPanel',{paddingVertical:'0',borderWidth:'0',backgroundColor:'"transparent"',marginBottom:'8'});s=s.replace('const styles = StyleSheet.create({','const styles = StyleSheet.create({\n  lockedToggle: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12 },');return s});
edit('src/components/navigation/NotificationDot.tsx',s=>s.replace('borderRadius: 1','borderRadius: 5').replace('width: 9, height: 9','width: 10, height: 10'));
edit('src/components/navigation/NotificationBadge.tsx',s=>s.replace('fontSize: 8, fontWeight: "900", lineHeight: 10','fontSize: 10, fontWeight: "700", lineHeight: 13'));
edit('src/screens/QuestSelectionScreen.tsx',s=>s.replace('categoryUnlocked ? remoteQuests.length ? `${tab} available elsewhere` : `No ${tab.toLowerCase()} available`','categoryUnlocked ? remoteQuests.length ? `${tab} available elsewhere` : tab === "Campaign" && nextCampaignNode && openCampaign ? "No additional local missions" : `No ${tab.toLowerCase()} available`').replace(': "Progress the campaign, unlock more regions, or check another category."',': tab === "Campaign" && nextCampaignNode && openCampaign ? "Your next story objective is shown above. Continue there, or browse side quests and bosses." : "Progress the campaign, unlock more regions, or check another category."'));
edit('src/components/ui.tsx',s=>s.replace('import React from "react";','import React from "react";\nimport { selectionStyle } from "../ui/selectionStyle";').replace('item === value && { borderColor: c.gold }','selectionStyle(c, item === value)').replace('paddingVertical: 10, borderBottomWidth: 2, minHeight: 44','paddingVertical: 10, borderRadius: 8, borderBottomWidth: 2, minHeight: 44'));
edit('src/screens/Inventory/ItemDetailScreen.tsx',s=>s.replace('import React,','import { selectionStyle } from "../../ui/selectionStyle";\nimport React,').replace('<Pressable key={entry.id} onPress={() => setSelectedId(entry.id)}>','<Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Select ${entry.name} for equipment comparison`} accessibilityState={{ selected: selectedId === entry.id }} onPress={() => setSelectedId(entry.id)}>').replace('selectedId === entry.id && styles.selected','selectionStyle(colors, selectedId === entry.id)'));
edit('src/screens/Inventory/InventoryScreen.tsx',s=>s.replace('import React,','import { selectionStyle } from "../../ui/selectionStyle";\nimport React,').replace('accessibilityRole="button" onPress={() => setUpgradesOnly','accessibilityRole="button" accessibilityLabel="Filter upgrades" accessibilityState={{ selected: upgradesOnly }} onPress={() => setUpgradesOnly').replace('upgradesOnly && styles.filterButtonActive','selectionStyle(colors, upgradesOnly)'));
edit('src/screens/WorldMap/WorldMapScreen.tsx',s=>{s=s.replace('import React,','import { selectionStyle } from "../../ui/selectionStyle";\nimport React,');s=s.replace('selectedRegion && styles.selectedMarker','selectionStyle(colors, selectedRegion)');s=s.replace('<Text style={styles.nodeState}>{status}</Text>','');s=s.replace('{selectedRegion && <Text style={styles.nodeHint}>DOUBLE TAP · OPEN</Text>}','');s=s.replace('{(guild.world.regionThreat?.[region.id] ?? 0) > 0 && <Text style={styles.threatBadge}>THREAT {guild.world.regionThreat?.[region.id]}</Text>}','');s=s.replace('{settlementDiscovered && (selectedRegion || isCurrent) && <View style={styles.settlementRow}><GameIcon id="settlement" size={13} framed={false} /><Text style={styles.settlement}>{SETTLEMENTS[region.settlementIds[0]!]?.name}</Text></View>}','');s=s.replace('            const settlementDiscovered = region.settlementIds.some((id) => guild.world.discoveredSettlementIds.includes(id));','');s=s.replace('<Panel style={styles.routePanel}>','<Panel style={[styles.routePanel, selectionStyle(colors, true)]}>');s=st(s,'marker',{borderRadius:'8',height:'34',width:'34'});s=st(s,'node',{minHeight:'56'});return s});
