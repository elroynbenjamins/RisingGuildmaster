# Facility visual refinements

1. **Temple care filter:** The Temple opens on heroes who need treatment. Show all heroes remains available, with care and fallen counts.
2. **Clear treatment availability:** Healthy heroes show Health full or No ailments; insufficient funds show the gold shortfall. Shared buttons replace faded custom controls.
3. **Accessible treatment feedback:** Treatment messages announce updates and have a 44-pixel dismiss target. Revival still requires confirmation.
4. **Full trainee names:** Training hero names wrap instead of truncating. Selected trainees expose their selected state to assistive technology.
5. **Readable locked training:** Locked programs keep readable descriptions and costs, with explicit level requirements and disabled state.
6. **Lighter training projections:** Level, XP, readiness and cost use open columns with dividers; program rewards lose their individual box borders.
7. **Training typography:** Small training labels are raised to 11 pixels, supporting type is lighter, and the introduction is shorter.
8. **Workshop navigation:** Workshop tabs and recipe filters use softer backgrounds and gold underlines, with selected-state accessibility. Summary totals are unboxed.
9. **Material source rows:** Material rows use larger touch targets, descriptive accessible labels and a simple warning rail for missing materials.
10. **Recipe readability:** Unavailable recipe and enchantment details retain full contrast. Redundant undiscovered badges no longer squeeze recipe titles.

Validation: TypeScript; 10 existing training/crafting presentation tests; 12 browser interaction assertions. Eight preview configurations cover narrow phones, high contrast, empty Temple and revival. Browser previews are fixture-only and do not modify player saves. Existing portraits, asset sizing and icon artwork are preserved. Native device rendering has not been tested in this pass.
