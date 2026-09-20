# Browsing and selection refinements

Implemented all six requested improvements:

- Roster: compact heading, expandable summary and sorting, direct Fallen filter from the revival warning. First hero starts above 550px in both tested populated phone layouts (320px and 390px), with a complete card visible at 320px.
- Locked regional scouting: collapsed 44px disclosure row; unlock requirements remain available on expansion. Active scouting mission behavior is unchanged.
- Notifications: round 10px dots and more readable numbered badges.
- World map: region names and status icons remain; repetitive state, threat, settlement and double-tap labels removed from each marker. Threat, travel status and settlement detail remain in the selected region dossier; common gesture guidance remains beneath the map.
- Quest empty states: an available story objective is distinguished from a lack of additional local quest postings. Other category/remote/locked messaging remains intact.
- Selection: shared quiet surface and gold lower edge for tabs, upgrade filtering, equipment comparison and map selection. Reserved edge avoids selection layout shifts. Explicit ARIA states complement native accessibility states, including navigation tabs.

Validation: TypeScript passed. Nine web phone configurations and 24 interaction assertions passed (summary/sort disclosures, choosing Name sort, Fallen filter shortcut, locked scouting disclosure, story/local empty state, region selection, equipment comparison selection, upgrade filter). No runtime errors, failed requests, unloaded images or page-level horizontal overflow. High contrast and empty fixtures included. No new native release build in this pass.

Gallery: output/browse-refinements/index.html
Detailed evidence: output/browse-refinements/preview/details-audit.json
Reproducible interaction capture: output/browse-refinements/check-and-capture.cjs

No gameplay or economy calculations changed. Existing artwork, its resize settings, and optional recruitment comparison are preserved.
