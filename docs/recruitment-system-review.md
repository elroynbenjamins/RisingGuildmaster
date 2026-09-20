# Recruitment system review

Recruitment now owns a persistent, save-backed candidate pool rather than regenerating heroes when the screen mounts. Candidate definitions wrap real `Hero` previews and keep hidden true potential separate from scouting estimates.

All true potential is constrained to 50–100. Generation squares the centralized random roll, biasing results toward the lower bound; high and exceptional potential remain possible but progressively rarer. Existing saves are migrated into the same range.

Prospect, standard, veteran, and elite archetypes control age, level, trait count, costs, estimate uncertainty, and potential ranges. Candidate levels are produced by applying the existing class-weighted attribute growth pipeline rather than inventing final stats. Guild reputation increases potential and elite probability within explicit caps.

The recruitment service owns refresh timing and cost, expiration, reservation, scouting payments, rejection, capacity validation, recruitment resolution, history entries, and contract creation. The UI calls these services and never accesses `truePotential`.

Financial presentation initially shows ranges for the upfront fee and weekly salary demand. Basic scouting narrows financial uncertainty to ±10%, Advanced to ±5%, and Expert reveals exact terms, in parallel with potential scouting. Contract salary liability and total cost are presented as ranges until those terms become exact. Recruitment affordability intentionally checks only the upfront fee.
