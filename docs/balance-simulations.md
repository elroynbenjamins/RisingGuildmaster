# Balance simulations

Run the deterministic balance suite with:

```powershell
npm.cmd run simulate:balance
```

The combat simulation uses the production combat engine: generated heroes, D20 attacks, initiative, terrain/pathfinding, conditions, cooldowns, enemy tactical AI, difficulty scaling, and recovery between quest encounters. Its automated party uses a deliberately simple competent-player policy: use an available learned skill, otherwise use the class basic attack, move toward the nearest wounded enemy when out of range, and end the turn. It does not optimize positioning, consumables, focus-fire plans, or equipment builds, so a strong human player should generally perform at least as well.

The economy simulation uses production tavern income, difficulty multipliers, weekly contracts/payroll, quest reward rolls, and salary arrears. Its baseline is four level-1 heroes using the production salary formula, a 28-day window, and 55 gold of field expense per quest: 20 travel, 20 healing, 10 rations, and 5 repairs. Quest frequency is varied from one to three completions per week, while `goldAfterFacilityReserve` protects 720 gold for the first Blacksmith.

## Reading the report

For ordinary encounters, a healthy Standard target is roughly 85–95% wins for a correctly levelled party. For bosses, 60–80% is a better initial target before optional equipment and consumables. Veteran and Iron Guild should reduce win rate—not merely add rounds—and should create meaningfully lower remaining HP.

Economy should remain solvent at the intended activity level without letting passive income erase decisions. `breakEvenQuestsPerWeek` estimates how many copies of the selected quest are needed to cover payroll after tavern income. The simulation intentionally excludes one-off campaign rewards, crafting costs, recruitment fees, gear repair, healing, and gem conversion; add dedicated scenarios before tuning those sinks.

## Current baseline (seeded audit)

- The first balance pass adds one outer-guard scout and one boss-room scout, improves enemy accuracy on every difficulty, and widens HP/damage scaling between Standard, Veteran, and Iron Guild. Re-run the seeded audit whenever combat data changes; the simple simulation party does not use potions or optimized equipment.
- A two-hero level-1 Goblin Patrol was also won in every sampled Standard run with about 92% HP remaining. It works as a tutorial fight, but should not be presented as a demanding contract.
- The level-5 Chainbreaker and level-6 Vaelith fights were won in every sampled Standard run. Remaining HP fell to roughly 80% and 73%, so later bosses trend better but are still forgiving for balanced four-hero parties.
- The tavern now earns 280 gold per Standard week before upgrades, below the 300-gold reference payroll. Quests therefore fund field costs and expansion. Veteran earns 224 and Iron Guild 196 per week. Iron Guild reduces passive safety rather than gutting earned quest rewards, so skilled active play remains sustainable. Starting capital remains 5,000 gold so two tutorial recruits and the first 720-gold Blacksmith remain attainable without ads or gem conversion.

Do not balance from win rate alone. Re-run after changes and compare win rate, surviving heroes, remaining HP, rounds, arrears, and net gold together.
