# Next ten visual and usability refinements

1. Recruitment candidates appear earlier: smaller title/intro, compact refresh row and expandable party-role coverage. Missing-role warnings remain visible.
2. Hiring explains its unavailable state: roster full, tutorial step, required refresh or insufficient gold. Existing eligibility rules are preserved.
3. A shared search field adds a 44px clear control, a single focus border, consistent input sizing and appropriate keyboard behavior in Heroes and Inventory.
4. Empty filtered results offer Clear filters, resetting the query and relevant filters without touching inventory or roster data.
5. The equipment-upgrade summary opens the upgrade filter and exposes selected state.
6. Disabled primary and secondary buttons use readable neutral colors, with explicit disabled semantics.
7. Large resource totals use compact amounts in the global header and Guild summary. Full exact amounts remain in accessibility labels. Eight numeric checks cover thresholds, carry rounding, negative values and billions.
8. The activity strip has readable 11px/10px text, 44px touch targets and navigation chevrons, without a tiny duplicate heading.
9. Special activities use a compact expanded/collapsed control while retaining the dungeon, operation and raid actions.
10. World and regional maps share a softer 12px frame, a lighter border and more readable legends.

Validation: TypeScript checked; nine phone configurations exercised, including empty, high contrast and large-balance fixtures. Forty-one interaction assertions cover existing and new behavior. Final screenshot records reject runtime errors, failed requests, unloaded images and page-level horizontal overflow. Search focus and large treasury presentation received follow-up visual checks. This pass uses web previews; no native release build was produced.

Review: output/next-ten/index.html
Evidence: output/next-ten/verified-screens.json and amount-checks.json
Reproduction: output/next-ten/check-and-capture.cjs with scripts/next-ten-preview-entry.tsx

Existing portrait/icon assets and resize settings remain intact. Recruitment comparison remains optional. No economy calculations or progression rules changed.
