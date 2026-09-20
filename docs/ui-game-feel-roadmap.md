# Rising Guildmaster — pixel UI and game-feel roadmap

The current UI foundation is functional and readable, but much of it still presents like a dark mobile application: rounded cards, flat panels, long text blocks, and repeated list rows. The strongest visual direction is to keep the pixel style while making the interface feel like a guild-management game rather than a generic app.

## Recommended visual foundation

- Replace large rounded 10–14 px cards with reusable pixel-frame panels: stepped corners, 1–3 px borders, small corner ornaments, and optional 9-slice textures.
- Keep body copy highly readable. Use a pixel/display font only for short titles, buttons, labels, damage numbers, and banners.
- Add subtle pixel textures behind major areas: guild wood/stone, parchment quest board, map paper, forge metal, dungeon stone. Avoid noisy full-screen textures.
- Use three consistent panel tiers: primary screen frame, interactive card, compact status chip. This reduces visual clutter and makes tap targets obvious.
- Standardize icon + label resource chips and status badges instead of relying on text alone.

## Highest-impact screen improvements

### Guild / Command Center
Make this the visual home of the game. Use a guild-hall/quest-board presentation with 4–6 large action tiles and a compact attention strip: payroll soon, training complete, candidate leaving, new personal quest, regional threat, wounded heroes.

### Quests
Turn each quest into a more visual card: location marker, enemy/scene art, recommended level badge, risk, travel requirement, one-time Side Quest stamp, reward icons, and a single obvious primary action. Hide detailed lore behind an expandable panel.

### Heroes
Increase portrait importance. Show HP/readiness bars, level, class/race icon, loyalty band, current status, and one meaningful notification directly on the roster card. Move secondary numbers into the detail screen.

### World
Prefer map nodes and travel paths over text lists where possible. Settlements, side quests, threats, and locked routes should be visible as map-state changes.

### Calendar
The new 7-day planner should eventually use tiny pixel event icons and color-coded day frames so the player can scan a week without reading every line.

## Game-feel improvements beyond layout

- Reward reveal: coins count upward, XP bars visibly fill, loot cards reveal one at a time, and rare rewards get a stronger frame/sound.
- Level-up moment: short banner, portrait pulse, new-stat/skill callout, optional haptic.
- Quest completion: stamped `VICTORY` / `COMPLETED` panel instead of immediately becoming another results list.
- Combat feedback: short hit-stop, restrained screen shake on heavy attacks, clearer enemy intent icons, turn-start banner, better damage/heal numbers, and brief condition icons over units.
- Navigation feedback: selected bottom tab should have a stronger pixel frame/plate, not only opacity and text color.
- Screen transitions: short consistent fades/slides rather than abrupt swaps where practical.
- Audio/haptics: small UI tick for selection, coin sound for rewards, parchment/board sound for quest acceptance, heavier confirmation for bosses/level-ups. Keep all feedback short on mobile.

## Usability rules

- One dominant primary action per screen section.
- Minimum ~44 px touch targets even when the artwork looks smaller.
- Important state should be visible as icons/bars before explanatory text.
- Use progressive disclosure: summary first, details on tap.
- Avoid showing the same information in the global header, card header, and body simultaneously.
- Preserve the dark/gold palette, but use color mostly for state and importance, not decoration.

## Asset requirement for a full visual implementation pass

To implement this rather than only plan it, include the project's `assets/` directory, especially `assets/ui/`, `assets/artwork-v2/`, icon atlases, portraits, maps, and any fonts/audio already licensed for the project.

## No-asset implementation status

The first visual/game-feel pass can be implemented entirely in code and is now underway/completed for the shared UI foundation. Pixel-frame geometry, stronger selected navigation, compact status chips/meters, more scannable hero/quest cards, Command Center attention routing, and mission-result presentation do not require replacement art.

The next no-asset systems also fit this direction:
- Mission Intel turns discovered bestiary information into preparation gameplay rather than another static archive page.
- Roguelite Boons/Pacts create a visible temporary run build, giving dungeon rooms a stronger game-loop payoff without new artwork.
- Boss mechanics can use existing tactical-board primitives such as phases, summons, telegraphs, movement constraints, objectives, and status effects before bespoke boss art exists.
- Collection rewards can use existing icons/text frames first, then receive bespoke badges/trophies later when the asset folder is available.

The large `assets/` folder is only required when replacing or adding actual portraits, map art, scene art, pixel textures, icon atlases, fonts, audio, or bespoke animated effects. Code-first UI and gameplay passes can continue independently.

## Implemented combat readability cue

Basic attacks now use a dedicated no-asset affordance: when no Quick Skill is selected, an enemy tile gains a solid bright-red border whenever the active hero can immediately basic-attack that enemy. The red border is reserved for the double-tap basic-attack shortcut; selected-skill targeting retains its separate dashed/highlighted treatment.

## Command Center implementation — Pass 8

The Guild screen now follows the game-like direction without requiring new art. It behaves as a **War Table** rather than a generic dashboard:
- a framed guild banner and resource strip;
- one dominant Current Order;
- a ranked Guild Orders board with red/gold/green/blue action states;
- direct routing to the subsystem that needs attention;
- facilities presented as game tiles rather than a plain menu row;
- Calendar Watch integrated into the home screen;
- post-Chieftain level gaps route toward one-time Side Quests when those are the intended catch-up path.

This establishes the layout language to reuse on Quests and Heroes next: **banner → primary objective → actionable cards → secondary systems**, with less repeated explanatory copy.

## Hero Roster implementation — Pass 10

The Heroes screen now follows the game-first UI hierarchy rather than a database/list hierarchy. Each adventurer is represented by a portrait-led card with a class accent, Level plate, visible field condition, HP/readiness/XP meters, loyalty, contract state, potential, and skill-choice notification. Training/injury/fallen states are readable before opening the detail sheet, while secondary character-sheet information remains behind Inspect. The roster header also exposes recruitment and a compact command summary so this screen functions as a party-management hub rather than a passive index.

## Combat implementation — Pass 11

The combat screen now follows the same game-first UI language as the War Table, Quest Board, and Hero Roster. The upper combat HUD exposes round/survivor pressure immediately, initiative is shown as compact ally/foe plates, the acting unit gets a portrait-led command banner, and Move/Action readiness is visible without opening tactical details. Board tokens now carry miniature HP bars and critical-health markers. Heavy/critical/finishing hits use restrained code-only shake, border flash, and stronger floating numbers, while the Reduce Combat Effects and operating-system Reduce Motion settings suppress the extra motion. This is intentionally a readability/game-feel pass rather than an animation-heavy replacement-art pass.

## World / Travel implementation — Pass 12

The World layer now follows the same game-first language as the War Table, Quest Board, Hero Roster, and Combat HUD. The continent screen is a **Field Command map** with the guild's current position and supplies always visible. Selecting a region opens a Region Dossier and Route Plan before travel, including travel time, ration cost, arrival day, rations remaining, field-party level risk, threat, and payroll crossed on the road. Regional maps now act as **Local Route Boards**: current-position markers, order badges, service chips, local walking previews, and compact Local Order cards replace the previous text-heavy location panel. This is entirely code-driven and continues to use the existing map artwork.

## Hero Character Sheet implementation — Pass 13

The individual hero view now completes the game-first hierarchy started by the roster. A portrait-led Adventurer Character Sheet exposes tactical role, condition, HP/readiness, XP, six-slot equipment summary, progression choices, loyalty, and contract urgency before secondary numbers. Detailed equipment, skills, raw attributes, and personal history are separated into Gear, Skills, Stats, and Story tabs. Class accents and duty/contract states are shared with the roster so the two screens read as one coherent RPG party-management system rather than separate app pages.

## Reward / Progression implementation — Pass 14

Quest completion now uses the same game-first hierarchy as the War Table, Quest Board, Hero Roster, Combat HUD, World Map, and Character Sheet. Victory opens a framed **Reward Chest** presentation with Gold, Reputation, Guildmaster XP, and hero XP separated into readable reward plates. Loot reveals use rarity-weighted pixel frames, crafting patterns are presented as unlocks, and one-clear Side Quest materials explicitly communicate that the reward was secured once. Each participating hero receives an XP/progression card with an animated meter, Level Up banner, new class-skill point callout, and Level-5/Level-10 class-path milestones. The first post-battle management action is promoted to a dominant Recommended Next Order so the result screen ends with a clear gameplay decision rather than another passive list.

## Guild Calendar implementation — Pass 15

The calendar now uses the same game-first hierarchy as the War Table and quest board. The 7-day forecast is represented as selectable day tiles with icon-first milestone markers and Routine / Milestone / Watch / Action Needed urgency states. Selecting a day expands it into a command preview showing scheduled events, projected treasury, payroll coverage, and the always-on 10% max-HP healing/readiness/tavern routine before the player commits to advancing time. The screen therefore reads like a guild-management calendar rather than a finance report, while keeping the existing underlying planner simulation and confirmation safeguards intact.

## Navigation / active-order implementation — Pass 16

The global shell now follows the same game-first hierarchy as the individual screens. Bottom navigation uses stronger pixel plates and numeric urgency badges rather than behaving like a generic app tab bar. Alerts are categorized by the subsystem where they can be resolved, with Quests capable of routing directly to Side Quests when campaign readiness specifically calls for catch-up work. A separate **Active Orders** strip shows work already in motion (training, gathering parties, regional scouts, active dungeon runs), so the player can tell at a glance both what needs attention and what the guild is currently doing. Header shortcuts and active-order links preserve the originating main tab when the player backs out, which makes the whole interface feel like one connected game space rather than a stack of unrelated menus.

## Quest Deployment implementation — Pass 17

Quest preparation now bridges the Notice Board and tactical combat as a proper **Field Deployment** screen. The selected squad is presented before the roster, balanced auto-fill creates a frontline/support/ranged core for ordinary quests, and every selected hero exposes current HP/readiness plus predicted readiness after the mission cost. A single Deployment Check combines party level, role coverage, equipment durability, Monster Manual intel, field-potion stock, skill checks, chemistry, return day, and payroll risk into Ready / Watch / High Risk / Not Ready states. This keeps preparation readable like an RPG deployment screen rather than requiring the player to mentally combine information from several menus.

## Recruitment / Tutorial implementation — Pass 18

Recruitment now reads like a fantasy guild tavern rather than a data table. The board shows the guild's roster shape and payroll before the candidates, and every adventurer card answers the important RPG questions first: **what role do they play, do we need that role, how promising are they, what do they cost now, what will they add to weekly payroll, and how long before they leave?** Candidate inspection uses an Adventurer Dossier with Guild Fit, scouting uncertainty, and contract forecasting so long-term economy is part of the decision instead of an afterthought.

Tutorials were upgraded alongside the newer UI rather than left behind. The first-run recruitment tutorial now teaches role balance, contracts, and batch refreshes; first-time War Table, Deployment Check, and Guild Planner primers explain the renewed management interfaces; combat guidance already uses the yellow-move / solid-red-basic-attack convention; and a permanent **Guildmaster Handbook** in Settings records the current rules for Side Quests, End Day healing, Mission Intel, rewards, travel, archives, dungeons, and Raids. The intent is for contextual onboarding to stay brief while all details remain reviewable later.

## Pass 19 — Armory / Equipment
The inventory now follows the same game-like presentation as Heroes, Quests, World, and the Guild War Table. Gear is presented as loot with rarity frames, but the UI explicitly separates rarity from actual build value. The player can quickly identify possible upgrades, inspect tradeoffs per hero, see durability loss, repair from the item dossier, and choose Equip / Sell / Salvage with clearer consequences.

## Workshops / Crafting implementation — Pass 20

Crafting now follows the same game-first hierarchy as the Armory. Workshops are presented as actual guild facilities rather than one recipe list: each has a visible level, construction state, unlock preview, and capability count. Recipes answer four questions before the player presses anything: **is the pattern known, can this workshop make it, do I own the materials/gold, and would the item actually improve anyone?** Material chips route back into exploration and the Monster Manual through source hints, creating a clearer loop from missing material → hunt/travel → reward → craft → equip. Repair and enchanting remain separate workshop disciplines so Blacksmith and Jeweler upgrades retain identity.

## Training Yard implementation — Pass 21

Training now reads like assigning adventurers to a real guild facility rather than starting invisible timers. Capacity is represented by occupied/empty slots, active sessions expose progress and return state, and the selected order previews the real cost of taking a hero out of field duty. The system also communicates its intended balance role: Training is controlled XP catch-up for reserves and downtime, while one-clear Side Quests remain the active answer when the main four fall below campaign recommendations. This keeps the calendar, roster rotation, Side Quests, and Training Hall in one management loop instead of allowing passive waiting to replace adventuring.
