const fs=require('fs');
function edit(p,fn){const s=fs.readFileSync(p,'utf8'); fs.writeFileSync('output/facility-refinements/'+p.split('/').pop()+'.before',s);const n=fn(s);fs.writeFileSync(p+'.tmp',n);fs.renameSync(p+'.tmp',p)}
function rep(s,a,b){if(!s.includes(a))throw Error('Missing '+a);return s.replace(a,b)}
edit('src/screens/Temple/TempleScreen.tsx',s=>{
s=rep(s,'BackButton, EmptyState','ActionButton, SecondaryButton, BackButton, EmptyState');
s=rep(s,'const [message, setMessage]', 'const [needsCareOnly, setNeedsCareOnly] = useState(true);\n  const [message, setMessage]');
s=rep(s,'const fallen =', 'const needsCare = living.filter((hero) => getFullTreatmentCost(hero) > 0);\n  const treatmentHeroes = needsCareOnly ? needsCare : living;\n  const fallen =');
s=rep(s,'<View style={styles.wallet}>','<View style={styles.wallet}>');
s=rep(s,'<Panel style={styles.message}>','<Panel accessibilityLiveRegion="polite" style={styles.message}>'); // Panel might not accept prop; check tsc
s=rep(s,'<Pressable onPress={() => setMessage(null)}>','<Pressable accessibilityRole="button" accessibilityLabel="Dismiss treatment message" style={{ minWidth: 60, minHeight: 44, justifyContent: "center" }} onPress={() => setMessage(null)}>');
s=rep(s,'{tab === "Treatment" ? (living.length ? living.map((hero) => {','{tab === "Treatment" && <View style={styles.careFilter}><Text style={styles.careSummary}>{needsCare.length} need care · {fallen.length} fallen</Text><Pressable accessibilityRole="button" accessibilityState={{ checked: needsCareOnly }} aria-pressed={needsCareOnly} onPress={() => setNeedsCareOnly(!needsCareOnly)} style={styles.careToggle}><Text style={styles.dismiss}>{needsCareOnly ? "Show all heroes" : "Show those needing care"}</Text></Pressable></View>}\n    {tab === "Treatment" ? (treatmentHeroes.length ? treatmentHeroes.map((hero) => {');
s=rep(s,'label={`Heal · ◆${healingCost}`}','label={!healingCost ? "Health full" : guild.gold < healingCost ? `Need ${healingCost - guild.gold} gold` : `Heal · ◆${healingCost}`}');
s=rep(s,'label={`Cure · ◆${conditionCost}`}','label={!conditionCost ? "No ailments" : guild.gold < conditionCost ? `Need ${conditionCost - guild.gold} gold` : `Cure · ◆${conditionCost}`}');
s=rep(s,'label={`Full treatment · ◆${fullCost}`}','label={!fullCost ? "No treatment needed" : guild.gold < fullCost ? `Need ${fullCost - guild.gold} more gold` : `Full treatment · ◆${fullCost}`}');
s=rep(s,'<EmptyState title="No heroes to treat" message="Recruit heroes or return after an expedition." />','<EmptyState title={living.length ? "Everyone is healthy" : "No heroes to treat"} message={living.length ? "Your living heroes need no healing or condition treatment." : "Recruit heroes or return after an expedition."} />');
const start=s.indexOf('function TempleAction('),end=s.indexOf('\nconst styles',start);
s=s.slice(0,start)+'function TempleAction({ label, onPress, disabled = false, primary = false }: { label: string; onPress(): void; disabled?: boolean; primary?: boolean }) { const Button = primary ? ActionButton : SecondaryButton; return <View style={{ flexGrow: 1, flexBasis: 110 }}><Button label={label} onPress={onPress} disabled={disabled} /></View>; }\n'+s.slice(end);
s=rep(s,'flexBasis: 110','minWidth: 0'); // do not inflate standalone vertical full action
s=rep(s,'wallet: { flexDirection: "row",','careFilter: { marginBottom: 12 }, careSummary: { color: colors.muted, fontSize: 12, marginTop: 10 }, careToggle: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }, wallet: { flexDirection: "row", flexWrap: "wrap",');
s=rep(s,'fontSize: 30, fontWeight: "900"','fontSize: 26, fontWeight: "700"');
s=rep(s,'fontSize: 19, fontWeight: "900"','fontSize: 19, fontWeight: "700"');
return s;
});
edit('src/screens/Training/TrainingGroundsScreen.tsx',s=>{
s=rep(s,'Training is controlled catch-up XP for heroes who are staying home. It never grants permanent attributes and it is intentionally weaker than actively clearing suitable quests.','Train reserves while the field team adventures. Earn XP up to the campaign and roster cap; attributes stay unchanged.');
s=rep(s,'<Pressable key={entry.id} onPress={() => setHeroId(entry.id)}>','<Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Select ${entry.name} for training`} accessibilityState={{ selected: heroId === entry.id }} aria-pressed={heroId === entry.id} onPress={() => setHeroId(entry.id)}>');
s=rep(s,'<Text numberOfLines={1} style={[styles.heroName','<Text style={[styles.heroName');
s=rep(s,'<Pressable key={entry.id} disabled={locked}','<Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`${entry.name}${locked ? ` · Requires training hall level ${entry.trainingGroundLevel}` : ""}`} accessibilityState={{ selected: programId === entry.id, disabled: locked }} aria-pressed={programId === entry.id} aria-disabled={locked} disabled={locked}');
s=rep(s,'locked: { opacity: .45 }','locked: { borderColor: colors.border }');
s=rep(s,'selected: { backgroundColor: colors.panel2, borderColor: colors.gold, borderWidth: 2 }','selected: { backgroundColor: colors.panel2, borderColor: colors.gold, borderWidth: 1 }');
s=rep(s,'heroName: { fontSize: 14, fontWeight: "900", marginTop: 5, maxWidth: 110 }','heroName: { fontSize: 14, lineHeight: 19, textAlign: "center", fontWeight: "600", marginTop: 5, maxWidth: 110 }');
// Keep small supporting text readable throughout the order, hero selector and facility.
s=s.replace(/fontSize: [789],/g,'fontSize: 11,').replace(/fontWeight: "900"/g,'fontWeight: "600"');
s=rep(s,'title: { color: colors.text, fontSize: 29, fontWeight: "600"','title: { color: colors.text, fontSize: 26, fontWeight: "700"');
s=rep(s,'borderWidth: 2, minWidth: 78','borderWidth: 0, borderRadius: 10, minWidth: 78');
s=rep(s,'projection: { backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1,','projection: { borderBottomColor: colors.border, borderBottomWidth: 1,');
s=rep(s,'programFooter: { flexDirection: "row",','programFooter: { flexDirection: "row", flexWrap: "wrap",');
s=rep(s,'programStat: { backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1,','programStat: {');
s=rep(s,'programTag: { backgroundColor: colors.panel2, borderColor: colors.blue, borderWidth: 1,','programTag: {');
s=rep(s,'upgradeBox: { backgroundColor: colors.panel2,','upgradeBox: { borderRadius: 10, backgroundColor: colors.panel2,');
return s;
});
edit('src/screens/Crafting/CraftingScreen.tsx',s=>{
s=rep(s,'<Pressable key={value} onPress={() => { setTab(value);','<Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: tab === value }} aria-selected={tab === value} onPress={() => { setTab(value);');
s=rep(s,'<Pressable key={value} onPress={() => setFilter(value)}','<Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: filter === value }} aria-pressed={filter === value} onPress={() => setFilter(value)}');
s=rep(s,'{value.toUpperCase()}</Text><Text style={styles.workshopTabMeta}>','{value.charAt(0).toUpperCase() + value.slice(1)}</Text><Text style={styles.workshopTabMeta}>');
s=rep(s,'workshopTab: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 2,','workshopTab: { alignItems: "center", borderRadius: 10, borderBottomColor: "transparent", borderBottomWidth: 2,');
s=rep(s,'workshopTabSelected: { backgroundColor: colors.panel2, borderColor: colors.gold }','workshopTabSelected: { backgroundColor: colors.panel2, borderBottomColor: colors.gold }');
s=rep(s,'filter: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1,','filter: { alignItems: "center", borderRadius: 10, borderBottomWidth: 2, borderBottomColor: "transparent",');
s=rep(s,'filterSelected: { backgroundColor: colors.panel2, borderColor: colors.gold, borderWidth: 2 }','filterSelected: { backgroundColor: colors.panel2, borderBottomColor: colors.gold }');
s=rep(s,'statPlate: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1,','statPlate: { alignItems: "center",');
s=rep(s,'materialRow: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1,','materialRow: { alignItems: "center", borderRadius: 8, borderLeftWidth: 2, borderLeftColor: "transparent",');
s=rep(s,'materialMissing: { borderColor: colors.danger }','materialMissing: { borderLeftColor: colors.danger, backgroundColor: colors.panel2 }');
s=rep(s,'minHeight: 43','minHeight: 48');
s=rep(s,'disabled: { opacity: .55 }','disabled: { borderColor: colors.border }');
s=rep(s,'undiscovered: { borderColor: colors.border, opacity: .8 }','undiscovered: { borderColor: colors.border }');
s=s.replace(/fontSize: [89],/g,'fontSize: 11,').replace(/fontWeight: "900"/g,'fontWeight: "600"');
s=rep(s,'project: { backgroundColor','project: { borderRadius: 10, backgroundColor');
s=rep(s,'unknownIcon: { alignItems','unknownIcon: { borderRadius: 10, alignItems');
return s;
});
