# Softer interface pass

Reduced framing in shared panels, buttons, segmented tabs, status chips and hero cards. Navigation now uses one bar with rounded selection and a short gold underline; resource counters have no individual boxes. Guild facilities are open icon actions. Guild, Heroes, Recruitment and Inventory use fewer nested stat and decorative frames. Inventory rarity and hero class accents remain visible, as do warning colors.

Existing artwork dimensions, transparent icons and optional recruitment comparison are preserved. No gameplay logic changed.

Validation: npx tsc --noEmit passed. Five web phone previews (Guild at 320px and high contrast 390px; Heroes, Recruitment and Inventory at 320px) loaded with zero runtime or image errors. Top and bottom captures reviewed. Preview fixtures are isolated from player saves. No new native build was made.

Review: output/soft-ui/index.html and output/soft-ui/details-audit.json.
