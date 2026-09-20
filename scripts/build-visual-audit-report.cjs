const fs=require('node:fs'),path=require('node:path');
const root=path.resolve('.'),out=path.join(root,'output/visual-audit');
const a=JSON.parse(fs.readFileSync(path.join(out,'asset-audit.json'))),r=JSON.parse(fs.readFileSync(path.join(out,'registry-audit.json'))),screens=JSON.parse(fs.readFileSync(path.join(out,'screens.json'))),runs=JSON.parse(fs.readFileSync(path.join(out,'screen-audit.json'))),details=JSON.parse(fs.readFileSync(path.join(out,'details-audit.json')));
const url=p=>path.join(root,p).replaceAll('\\','/');
const link=(label,p)=>`[${label}](<${url(p)}>)`;
const notes={
AlchemyScreen:'Potion art present. Increase material/cost label size; align potion framing with equipment.',
ArtworkReviewScreen:'Developer screen: incomplete preview coverage and stale “temporarily hidden” copy. Use the complete audit gallery for coverage.',
CampaignScreen:'Missing speaker mappings in later scenes; fix identity continuity before adding optional chapter banners.',
CombatScreen:'Initiative, normal battle and eight-hero raid sampled. Images load. Raid tokens and quick-skill labels become tiny; offer stronger selected-unit emphasis and clearer disabled reasons.',
ContentUnlockScreen:'Class/race unlock cards are text-only. Reuse representative hero portraits so players can see what they unlock.',
CraftingScreen:'Equipment images present; undiscovered-pattern question marks are intentional. Reuse blacksmith/tailor/jeweler NPC portraits and simplify the tall upgrade section.',
DungeonScreen:'Map/room graphics present. Strengthen room-type silhouettes and reward emphasis; no missing asset found.',
GatheringScreen:'Hero portraits present, but three-column cards truncate names. Prefer two columns or wider rows with complete identities.',
GemsSupportScreen:'Gem packs are text-only. Reuse gem/pouch imagery for recognition. Native billing unavailable in web preview is expected.',
FinancesScreen:'Calendar and ledger render. Small labels need enlargement; optional hero thumbnails in payroll rows. Horizontal calendar scrolling is intentional.',
GuildManagementScreen:'Text-only service/archive menu despite available UI icons. Add existing icons to improve scanning.',
GuildScreen:'Coherent war-table treatment. Compact the persistent resource/activity area and raise small labels; facilities require scrolling.',
ServicePlaceholderScreen:'Explicit future-service placeholder. This is not a missing image. Replace internal milestone/backend language before exposing it as a finished feature.',
GuildLegacyScreen:'Trophy placeholders correctly conceal undiscovered rewards. Distinct trophy silhouettes would make unlocked achievements feel more individual.',
GuildmasterSkillTreeScreen:'Nodes have no persistent names and locked art is very dim. Add names and explicit lock/cost badges, including in High Contrast.',
GuildOperationsScreen:'Mara portrait and hero selectors present. Disabled candidates are very dim; retain readable identity and unavailability reasons.',
HeroCodexScreen:'Race and class tabs checked. Complete portrait-led catalog; many class representatives share a very similar human face.',
HeroDetailScreen:'Sheet, Gear, Skills, Stats and Story checked. Full hero name truncates even at 390px and is severely shortened at 320px. Stack header on narrow screens. Empty gear X marks are intentional but neutral slot silhouettes would read better.',
HeroesScreen:'Summary, readiness tiles and filters consume most of the first viewport. Move hero cards up and collapse advanced filters. Empty state renders correctly.',
InventoryScreen:'Confirmed 320px header clipping: upgrade badge extends beyond the visible right edge. Title and badge need flexible wrapping/stacking. Enlarge tiny item metadata; empty state checked.',
ItemDetailScreen:'Item image, rarity, comparison and equip controls render clearly. Keep the useful emphasis on comparisons; reduce tiny supporting captions.',
LoreJournalScreen:'Some attributed character quotations omit portraits because aliases are incomplete. Archive/inscription sources do not need human portraits.',
MainMenuScreen:'Text-only title/save selector. Add the existing guild emblem and a restrained setting illustration; preserve prominent save actions.',
NewGameSetupScreen:'Difficulty cards and selected state are clear. Optional difficulty crests; no necessary new artwork.',
MonsterManualScreen:'All 83 enemy definitions have portrait mappings. Expanded Bandit entry checked. Good use of large art; preserve this treatment.',
PartySelectionScreen:'Empty and auto-filled squad checked. Selected portraits help, but names truncate and long readiness panels push candidate lists down.',
QuestDecisionScreen:'Aldren and Mira portraits display correctly. Decision layout is clear; unify rounded dialogue cards with the wider visual style if desired.',
QuestDetailScreen:'Text-heavy threat briefing. Reuse known enemy portraits in an intel strip without revealing undiscovered enemies.',
QuestBriefingScreen:'All 97 quest dialogue definitions resolve images, but several later speakers use borrowed or inconsistent identities. Generic Guild Clerk fallback is intentional.',
QuestExplorationScreen:'Text-only environmental check even when an illustrated NPC such as Warden Elowen is mentioned. Optional speaker portrait/scene vignette; improve the D20 silhouette.',
QuestResultScreen:'Victory art and hero outcomes present. Debrief/consequences push reward imagery far down. Place headline gold/loot/XP immediately after the outcome.',
QuestSelectionScreen:'Readable board structure, but story objective can appear above “No campaign available”. Clarify empty-list wording and use chapter/known-boss art sparingly.',
RaidScreen:'Text-only raid briefing with a skull glyph. Existing boss portraits should anchor raid cards and phase introductions.',
CandidateDetailScreen:'Large portrait and scouting information work. Good reference for portrait-led recruitment; retain readable names at narrow widths.',
RegionalScoutPanel:'Locked panel checked. No missing graphic in this state; unlocked search/result states still need a native interaction pass.',
RecruitmentScreen:'Summary, refresh and locked scouting cards push actual candidates below the first viewport; more pronounced at 320px. Move candidate list up, compact secondary controls.',
RegionMapScreen:'Map art is strong. Marker names are 7px and badges 5px; labels become difficult to read at 320px. Enlarge text/backplates and retain the detail list. Markers already have a 48px minimum height.',
SettingsScreen:'Default and High Contrast presentation checked. Remove future-development copy. High Contrast does not solve tiny labels or dim skill nodes elsewhere.',
SkillCodexScreen:'Icons render, but plain teal core skills and ornate generated skills visibly clash. Review 36 aliases where different actions share one icon.',
SkillTreeScreen:'No persistent skill names; locked nodes are almost invisible even under High Contrast. Different abilities share icons. Add labels and distinct symbols before additional decoration.',
StoryEventScreen:'Party portraits load. Events are predominantly prose; optional small environmental vignette, keeping choices visible.',
SubclassSelectionScreen:'Text-only permanent class choices. Reuse added-skill icons/class emblems to distinguish paths and preview the reward.',
TempleScreen:'Hero portraits, health and treatment states render. Prioritize wounded/fallen heroes so healthy disabled cards do not dominate the list.',
TrainingGroundsScreen:'Portraits and XP progress display; 320px layout wraps acceptably. Enlarge supporting labels and reduce repeated explanatory blocks.',
TutorialGuideScreen:'Mostly text. Add a small annotated combat example showing movement tiles, attack border and skill button; code/vector graphics suffice.',
TutorialScreen:'Text-only welcome. Existing registrar portrait or guild emblem would connect onboarding to the world.',
WorldMapScreen:'Detailed map and region markers present. Improve small labels and reduce the dashboard area above the map. Existing travel gestures remain useful; larger default labels are still needed.'
};
const missingNames=[...new Set(r.missingSpeakers.map(x=>x.speaker))];
const borrowed=r.explicitMappings.filter(x=>x.speaker!==x.portraitName);
const allRuns=[...runs,...details];
const report=`# Guildmaster visual audit

Audit date: 12 September 2026. Reviewed the current integrated workspace through Pass 21.

## Verdict

The asset library is complete at the file level, but the game has **real portrait coverage and identity gaps**, plus mobile readability issues. Keep most existing artwork. Fix speaker resolution and narrow layouts first, then make better use of existing art, then commission selected replacements.

## Coverage and limits

- **47/47 screen and panel files** rendered and reviewed at 390 × 844, with top/bottom captures and source inspection. This includes the developer artwork screen and future-service placeholder.
- **18 additional samples:** normal combat, eight-hero raid, all four alternate hero-detail tabs, class codex, auto-filled party, expanded monster entry, five 320px layouts, two empty states and two High Contrast samples.
- **1,349 image files** decoded and inspected in **33 contact sheets**, including all **616 hero variants** (7 races × 11 classes × 2 genders × 4 variants), 72 NPC portraits, all enemy and companion files, skills, equipment, materials, maps and legacy atlases.
- All **1,312 directly referenced images exist and decode**. No exact file-hash duplicates. All 616 expected hero keys, 72 registered NPCs, 83 enemy definitions and 348 hero/enemy skills resolve art. The 348 skills use 315 icon files plus aliases/reuse.
- Checked dialogue resolution for **97 quests** and **105 campaign/lore speaker occurrences**. Every quest dialogue image reference resolves; campaign/lore has 28 unmapped occurrences across 22 distinct source labels, of which two are non-character documents.
- All ${allRuns.length} preview samples completed with no page errors, image-load failures or error-boundary failures. Page-level overflow checks were clear, but visual review still found clipping inside the inventory scroll viewport; automated width checks alone are insufficient.
- This was an isolated **headless Edge/React Native Web preview**, not a physical Android/iOS test. It does not certify every dialogue branch, animation frame, modal, touch gesture, keyboard/font-scaling state, landscape layout or native billing view. Portraits were reviewed as contact sheets plus representative in-game sizes, not every image enlarged individually.
- Audit tooling and evidence were added. Production game code, artwork and real save files were not edited during this audit. Pre-existing integration/artwork changes remain in the workspace.

## Fix first

| Priority | Finding | Recommended change | Evidence |
|---|---|---|---|
| High | Characters disappear visually in later campaign/lore dialogue because no speaker mapping exists. | Use one shared speaker resolver across campaign, quest and lore; wire existing enemy portraits for Vaelith, Morrowveil, Solkar, Admiral Nhal Veyr, Serekh and Hollow Warden. Decide intended identities before aliasing similarly named bellkeepers. | ${link('Full mapping audit','output/visual-audit/registry-audit.json')} |
| High | Wrong or inconsistent identities: Grandmother Pell → male Greenveil Farmer; Postmistress Yara Quill → male Guild Clerk; Envoy Tharos → Ilyra in quests but male diplomatic envoy in campaign/lore. | Correct obvious assignments and give recurring later NPCs stable canonical portrait IDs. Add dedicated portraits where existing art cannot match the character. | ${link('Quest dialogue','src/data/quests/questDialogue.ts')}; ${link('Speaker aliases','src/data/characters/npcPortraits.ts')} |
| High | Inventory header clips at 320px; hero detail name truncates at 390px and is severely shortened at 320px. | Allow title/name wrapping; stack portrait/title/level on narrow widths; keep upgrade badge inside available width. | ${link('Inventory at 320px','output/visual-audit/screens/InventoryScreen--Narrow--320-top.png')}; ${link('Hero at 320px','output/visual-audit/screens/HeroDetailScreen--Narrow--320-top.png')} |
| High | Core navigation, map, resource and item information relies on very small type. Regional marker names are 7px and badges 5px. | Increase meaningful labels toward 12–14 logical pixels, use readable backplates, and simplify secondary metadata. Review the resulting layout on a real phone. | ${link('Regional map','output/visual-audit/screens/RegionMapScreen--Narrow--320-top.png')}; ${link('Map styles','src/screens/Region/RegionMapScreen.tsx')} |
| Medium | Heroes and candidates appear too far below summaries and controls. | Collapse advanced filters and scouting/refresh panels; aim to show useful portrait cards in the initial viewport. | ${link('Roster','output/visual-audit/screens/HeroesScreen-top.png')}; ${link('Recruitment','output/visual-audit/screens/RecruitmentScreen--Narrow--320-top.png')} |
| Medium | Skill trees rely on unlabeled icons; locked art remains very dim in High Contrast. | Show short names and explicit lock/cost states without requiring a tap; keep icon silhouettes readable. | ${link('Skill tree, High Contrast','output/visual-audit/screens/SkillTreeScreen--HighContrast-top.png')} |
| Medium | 36 skill aliases reuse other actions’ images. Some suggest the wrong action: Chain Lightning uses Fireball; Mist Step uses Frost Bolt; multiple ranger skills use Hunter’s Focus. | Create distinct symbols for semantically different skills first, then unify the plain-teal and ornate styles. | ${link('Alias registry','src/data/skills/generatedSkillIconArt.ts')}; ${link('Skill codex','output/visual-audit/screens/SkillCodexScreen-bottom.png')} |

## Portraits: what to update

**Heroes:** all 616 slots are present. No widespread replacement or upscaling is justified; 512px sources are ample for current display sizes. Several variant sets differ mainly in hair/beard while retaining similar face shape, lighting and pose. Improve selected sets with stronger age, silhouette, facial-feature and costume differences, checking at 32, 52 and 84px. Summoner portraits have more conspicuous pixel edges/cyan outlines than many other classes; choose a consistent pixel density for future additions.

**NPCs:** the existing 72-image set is coherent. The expansion cast has outgrown its mappings. The following explicit quest assignments reuse a generic or another named portrait. Reuse is not automatically a defect; the name/identity mismatches highlighted above are the immediate fixes. Avoid inferring a character’s gender from their name alone; check the narrative brief for the remaining replacements.

| Speaker | Current portrait | Registry gender | Example quest |
|---|---|---|---|
${borrowed.map(x=>`| ${x.speaker} | ${x.portraitName} | ${x.gender} | ${x.quest} |`).join('\n')}

**Campaign/lore sources without portraits:** ${missingNames.join('; ')}. Observatory Inscription and Iron Laurel Archive should remain document sources or receive a document symbol, not invented faces. The other 20 labels are character speakers; some already have suitable enemy artwork and only need wiring. The full JSON includes every occurrence and exact content location.

**Enemies:** all 83 definitions resolve to 78 referenced enemy image files, with deliberate shared images for some definitions; 85 files exist in the enemy folders including alternatives. Strong large portraits become hard to distinguish on raid tiles. First improve token crop/contrast and selected-unit emphasis. Preserve full portraits for inspection. No missing enemy portrait file was found.

**Companions:** all three active companions have art. The active ${link('registry','src/data/companions/companionArt.ts')} uses the ornate set in assets/images/companions/complete; a second set exists in assets/artwork-v2/companions. Their framing and rendering differ substantially. Choose the intended family deliberately; do not treat the second set as missing or automatically overwrite the active one.

## Other art and presentation

| Area | Assessment | Improvement |
|---|---|---|
| 315 skill images | Complete, but mixed framing, detail and backgrounds; 36 aliases. | Establish a small-icon silhouette rule and common framing. Prioritize icons that currently imply the wrong action. |
| 156 equipment images | Present and cohesive. Ornate baked-in frames can compete with rarity borders. | Let UI borders carry rarity and reduce decorative frames where they confuse common/rare distinction. |
| 36 UI icons | Present, but many have more detail than a 16–28px display can show. | Simplify tiny resource/navigation variants while retaining larger illustrated service icons. |
| Materials and potions | 32 material-folder files, 22 referenced; potion art also present. | Harmonize framing and scale. Larger cost labels help more than extra textures. |
| World and regional maps | Strong existing setting art. | Improve label scale, backplates and map placement. No wholesale map repaint needed. |
| Combat terrain and dungeon art | Images load; board and rooms are usable. | Give gameplay overlays and tokens visual priority over the terrain detail. |
| Main menu and onboarding | Primarily text. | Reuse the guild emblem/registrar portrait and one restrained setting crop. |
| Unlocks, subclasses and raids | Visually sparse despite available assets. | Reuse representative heroes, added-skill icons and raid boss portraits. |
| Guild management and services | Many text-only menu entries. | Reuse service icons and the existing craftspeople portraits. |
| Quest result | Reward imagery appears late in a long scroll. | Put gold, loot and XP near the outcome heading, with narrative detail below. |
| Tutorials | Instructions describe visual states in prose. | Add small annotated combat examples using existing art/code graphics. |

37 image files are not found by the static TS/TSX require scan. This includes old atlases and alternative sets, but also configuration-level art such as app icons; **this is not a deletion list**. The old artwork audit still assumes 1254 × 1254 sources and the developer preview has stale coverage/copy. The new audit covers actual current sizes and all expected hero keys.

## Every screen

“Checked” means the baseline screen was visually reviewed; additional states are stated explicitly. No row implies every possible state was exercised.

| Screen / panel | Findings | Capture |
|---|---|---|
${screens.map(s=>`| ${link(s.name,s.file)} | ${notes[s.name]||'Reviewed; no missing image found.'} | ${link('Top',`output/visual-audit/screens/${s.name}-top.png`)} · ${link('Bottom',`output/visual-audit/screens/${s.name}-bottom.png`)} |`).join('\n')}

## Suggested next visual pass

1. Repair canonical speaker mapping, obvious incorrect assignments, inventory clipping and hero-name layout.
2. Improve map/metadata text size, roster/recruitment hierarchy and skill-tree labels/contrast.
3. Reuse existing art on the main menu, unlocks, subclasses, raids and services.
4. Produce dedicated expansion NPC portraits and distinct skill icons where needed; selectively improve confusing hero variants.
5. Verify on Android at narrow/typical widths, increased system font size and both combat camera modes, including menus, dialogs and transitions.

## Evidence and reproduction

${link('Browse screenshot and artwork gallery','output/visual-audit/index.html')} · ${link('Asset inventory','output/visual-audit/asset-audit.json')} · ${link('Baseline measurements','output/visual-audit/screen-audit.json')} · ${link('Additional samples','output/visual-audit/details-audit.json')}.

Audit tools: scripts/visual-audit-assets.cjs, scripts/visual-audit-registries.cjs, scripts/generate-visual-preview.cjs, scripts/capture-visual-audit.cjs and scripts/build-visual-audit-report.cjs. The generated scripts/visual-audit-entry.tsx is fixture-only and is never imported by the production app. These scripts currently use the local bundled Playwright/Sharp runtime paths.

Run the asset and registry scripts with Node. Generate the preview entry, start Expo Web on port 8098, then run capture-visual-audit.cjs. Its temporary proxy uses 8099. Pass comma-separated Screen--Action--Width names for additional scenarios; details are saved separately from baseline results. Finally run build-visual-audit-report.cjs. Capture browser storage is isolated from the installed game.
`;
fs.writeFileSync(path.join(root,'docs/visual-audit.md'),report);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const screenCards=allRuns.map(s=>`<article data-search="${esc(s.name.toLowerCase())}"><h3>${esc(s.name)}</h3><p>${esc(notes[s.name.split('--')[0]]||'Additional state')}</p><div class="pair">${['top','bottom'].map(pos=>`<a href="screens/${s.name}-${pos}.png" target="_blank"><img loading="lazy" src="screens/${s.name}-${pos}.png" alt="${esc(s.name)} ${pos}"><span>${pos}</span></a>`).join('')}</div></article>`).join('');
const sheetCards=a.sheets.map(s=>`<article data-search="${esc((s.name+' '+s.assets.join(' ')).toLowerCase())}"><h3>${esc(s.name)} · ${s.assets.length} images</h3><a href="sheets/${s.name}" target="_blank"><img loading="lazy" src="sheets/${s.name}" alt="${esc(s.name)} contact sheet"></a><details><summary>Source images</summary>${s.assets.map(p=>`<a href="../../${esc(p)}" target="_blank">${esc(p)}</a>`).join('<br>')}</details></article>`).join('');
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Guildmaster visual audit</title><style>body{margin:0;background:#101416;color:#f3eee3;font:16px/1.5 system-ui}header,main{max-width:1450px;margin:auto;padding:24px}h1{color:#e0b765}h2{margin-top:40px}a{color:#94d3e9}input{padding:14px;width:min(90%,600px);font:inherit;color:white;background:#1a2123;border:1px solid #81928c}nav{display:flex;gap:24px;margin:20px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:20px}article{border:1px solid #354044;background:#1a2123;padding:16px;min-width:0}article[hidden]{display:none}h3{overflow-wrap:anywhere}p{color:#c2c9c5}img{display:block;width:100%;height:auto}.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pair span{display:block;text-align:center}details{font-size:12px;overflow-wrap:anywhere;margin-top:10px}.summary{border-left:4px solid #e0b765;padding-left:20px}</style><header><h1>Guildmaster · Visual audit</h1><p>12 September 2026 · 47 screens · 18 extra states · 1,349 image files · 616 hero variants</p><div class="summary"><strong>Files are complete. Speaker coverage and small-screen readability need work.</strong><p>Campaign/lore omit portraits for 20 character speaker labels; several quest identities use mismatched art. Inventory clips at 320px. Most existing artwork can be retained.</p></div><nav><a href="../../docs/visual-audit.md">Full report</a><a href="#screens">Screens</a><a href="#art">All artwork</a><a href="registry-audit.json">Portrait mappings</a></nav><label>Filter screens or artwork<br><input id="search" placeholder="Try hero, combat, dwarf, npc, skill…"></label><p>Click images to inspect full captures. Browser preview with isolated fixtures; not a native-device certification. Contact sheets cover every image file, including alternatives and historical atlases.</p></header><main><h2 id="screens">Screen review</h2><div class="grid">${screenCards}</div><h2 id="art">Complete artwork contact sheets</h2><div class="grid">${sheetCards}</div></main><script>document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim();document.querySelectorAll('article').forEach(a=>a.hidden=!a.dataset.search.includes(q))})</script></html>`);
console.log(`Created report with ${screens.length} screen notes, ${allRuns.length} preview samples and ${a.sheets.length} artwork sheets.`);
