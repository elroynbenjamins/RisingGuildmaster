# Guildmaster replacement artwork

Generation: built-in image generation, using the approved warrior sample and existing artwork as visual references. Existing atlases are archived, not deleted. `src/config/artworkReview.ts` controls temporary suppression.

## Character standard

- Exactly two playable portrait genders: female and male.
- Four independently drawn variants per race, class and gender: 7 races × 11 classes × 2 genders × 4 variants = 616 hero portraits.
- One standalone square file per asset; no sheets or runtime cell cropping.
- Current approved originals are 1254 × 1254 pixels. Inspect actual output dimensions before accepting each new file; prompt dimensions alone are not a guarantee.
- Use the approved reference's visible pixel clusters, dark teal background, upper-left lighting and restrained gold highlights.
- Front-facing head, upright shoulders, centered face. Target eye line at 41%, chin at 65%, shoulder armor beginning at 70%. Match reference headroom and face scale.
- Hairstyles, mouth/nose/eye shape and cheek/jaw structure may vary. Preserve race skin palette, ears, horns and other defining traits. Preserve the established hair/eye palette for a combination except for explicitly authored racial variants (Elf variant 4 uses silver-white hair for both genders).
- No hands, lower torso, text, baked-in frame or extra character.
- NPCs and humanoid enemies use the same framing. Nonhumanoid creatures need consistent centered silhouettes without forcing human anatomy.

## Icon standard

- Standalone square, same pixel rendering, palette and lighting.
- One readable subject; retain margin around the full effect or object.
- Do not bake a border into artwork: UI draws the frame once.

## Display and acceptance

- Shared `ReviewArtwork` preserves 1:1 ratio with `contain`, no stretching or cropping, fixed nonshrinking frame and consistent padding.
- Review using actual components at 84, 52 and 32 logical pixels in `ArtworkReviewScreen`.
- Check file dimensions, identity, gender, posture, head/eye position, palette, pixel scale and clipping before registering each batch.
- Registration must use exact race/class/gender/variant keys. Missing variants stay placeholders; never silently substitute another variant or gender.

## Initial prompt set

Human male Warrior: square front-facing shoulders-up chestnut hair/hazel eyes, steel/navy armor with gold trim, chunky bitmap pixels, dark teal background, warm upper-left lighting, no frame.

Registrar Mara Voss: female human NPC, matching posture/framing/pixel style, brown hair, burgundy coat and gold clasp.

Orc Raider: olive green skin, amber eyes, pointed ears and tusks, leather armor and red collar, matching posture and lighting. Originally prompted as a goblin; visually reviewed and correctly registered as an orc instead.

Sword Strike: isolated diagonal steel sword with gold hilt and pale gold slash, centered on dark teal with safe margins, same chunky pixel style, no frame.

Human Warrior variants: preserve approved original dimensions, pixel clusters, armor, colors, posture and framing; change only facial structure and hairstyle. Male variants: swept-back/shaved sides, side-parted waves, short tousled crop. Female variants: short side part, compact bun, wavy bob, close braid.

Mage core skills: Arcane Bolt is a violet-blue faceted energy projectile with pale-gold sparks; Fireball is a white-hot orange-gold sphere with a compact ember tail; Frost Bolt is a cyan faceted ice spear with a few angular shards; Arcane Knowledge is a midnight-blue spellbook with an abstract violet eye sigil and three gold motes. All use the approved dark-teal backdrop, chunky pixel clusters, diagonal action direction where applicable, safe margins and no baked frame.

Cleric core skills: Holy Strike is a silver-and-gold ceremonial mace in a compact radiant impact flare; Heal is an emerald-white restorative orb held by an antique-gold chalice; Divine Light is a symmetrical eight-rayed white-gold sunburst; Faith is an ivory-and-gold winged shield with an abstract flame and halo. All avoid real-world religious symbols and preserve the approved dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Paladin core skills: Holy Slash is a broad silver longsword crossed by a white-gold crescent; Smite is a square-headed warhammer descending into a compact lightning impact; Guardian's Oath is a navy-and-steel tower shield encircled by an unbroken protective ring; Holy Armor is an empty polished cuirass with layered pauldrons and a radiant heart. The set uses martial steel, navy and antique gold to remain distinct from Cleric art while preserving the shared dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Berserker core skills: Wild Swing is a hooked battle axe carried by a broad ragged ember arc; Frenzied Strike is a chipped cleaver axe crossed by twin crimson attack streaks; Whirlwind is a double-headed axe contained within a circular red-orange motion ring; Rage is an empty horned iron war mask with ember eye slits and a cracked aura. Rough blackened iron, worn leather and aggressive red motion distinguish the set from Warrior while preserving the shared dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Monk core skills: Unarmed Strike is one wrapped fist meeting a compact jade-gold impact; Flurry of Blows is a unified three-fist afterimage cluster; Patient Defense is a closed jade lotus held inside a calm pale-gold ward ring; Deflect Missiles is one continuous arrow redirected around a leather-and-brass bracer by a curved jade trail. Cream wraps, jade energy and disciplined circular forms distinguish the set from weapon classes while preserving the shared dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Bard core skills: Rapier Strike is a slender thrusting rapier with a burgundy-violet flourish; Inspiration is an upright antique-gold lyre crowned by warm sparkles; Dissonant Whisper is one fractured tuning fork emitting three hostile violet-crimson ripples; Song of Rest is a warm-wood travel lute resting beneath a pale crescent. Burgundy, rose violet and theatrical gold distinguish the set while preserving the shared dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Spellbow core skills: Arcane Arrow is a blackwood shaft with a faceted violet-blue crystal head and spiraling arcane trail; Ember Arrow uses a barbed black-iron head and compact ragged fire trail; Frost Arrow uses a large translucent-ice head, frost-coated shaft and three crystal shards; Runic Aim is a centered gold rune-sight reticle with cyan-violet focus rings and an arrowhead silhouette. Projectile head shape, trail texture and elemental palette keep the three arrows distinct while preserving the shared dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Bulwark core skills: Shield Bash is one massive rectangular tower shield driving into an amber impact; Interpose is a compact overlap of one round and one rectangular shield linked by a protective arc; Brace is one upright tower shield planted into stone by two iron supports; Hold the Line is a straight formation of three matching shields. Dark steel, navy and restrained amber emphasize practical formation defense over Paladin radiance while preserving the shared dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Summoner core skills: Spirit Bolt is an organic cyan ghost-flame projectile with an indigo core; Call Wisp is one faceless cyan spirit above an antique-brass summoning clasp with two indigo motes; Binding Ward is a cyan-and-indigo circular seal anchored by exactly three large gold links; Shared Essence is a pair of cyan and violet crystals joined by a pale-gold figure-eight strand. Spectral cyan, indigo and controlled binding geometry distinguish the set from Mage while preserving the shared dark-teal backdrop, chunky pixel clusters, safe margins and borderless presentation.

Human Spellbow portraits: preserve the approved square shoulders-up geometry and chunky pixel rendering while using a consistent midnight-teal arcane archer coat, blackened leather pauldrons, restrained antique-gold trim, violet diamond rune clasp, blackwood recurve bow and violet crystal arrows. Male variants use swept-back chestnut hair, side-parted waves with a neat beard, a short near-black tousled crop, and a sandy close crop with compact goatee. Female variants use a high braided knot, shoulder-length wavy bob, close side braid with low bun, and a short auburn swept crop. Vary facial structure and eye color while keeping class equipment, posture, lighting and scale fixed.

Elf Spellbow portraits: carry the Human Spellbow's midnight-teal coat, blackened leather pauldrons, restrained antique-gold trim, violet diamond rune clasp, blackwood recurve bow and violet crystal arrows into distinctly elven anatomy with narrow angular faces and fully visible long pointed ears. Golden-blond variants use swept-back lengths, tied tails, temple braids, braided crowns and tucked bobs; variant 4 uses the established silver-white hair for both genders. Preserve the same square shoulders-up geometry, chunky pixel rendering, dark-teal backdrop and warm upper-left lighting.

Dwarf Spellbow portraits: keep compact, broad dwarf proportions and copper-to-dark-auburn hair while adapting the locked midnight-teal Spellbow coat, blackened leather pauldrons, antique-gold trim, violet diamond clasp, blackwood bow and crystal arrows. Male variants are distinguished by split side braids, four narrow braids, one central braid, and a forked beard beneath a braided crown strip; female variants use shoulder waves, a braided crown and rear bun, a blunt bob with side braid, and a swept undercut with top braid. Preserve broad faces, heavy brows, safe framing, dark-teal backdrop and chunky pixel rendering; female variants remain unbearded.

Orc Spellbow portraits: preserve muscular olive-green Orc anatomy, broad angular faces, heavy brows, amber eyes, pointed ears and two readable lower tusks while carrying forward the midnight-teal Spellbow coat, blackened leather pauldrons, antique-gold trim, violet diamond clasp, blackwood bow and crystal arrows. Male variants use a high topknot with temple braids, swept mohawk, low braided tail, and cropped top with side braid, with beard shapes varied independently. Female variants use a high braided ponytail, swept undercut mane, braided crown with rear bun, and short textured crop with a narrow side braid; all remain unbearded. Keep the approved square shoulders-up framing, dark-teal backdrop, upper-left light and chunky pixel rendering.

Tiefling Spellbow portraits: retain deep crimson skin, angular faces, pointed ears, luminous amber-gold eyes and a clearly readable symmetrical horn pair while applying the locked midnight-teal Spellbow coat, blackened leather pauldrons, antique-gold trim, violet diamond clasp, blackwood bow and crystal arrows. Male variants combine swept hair and a side braid, a cropped crown, shoulder-length hair, and a high braided topknot with stubble, clean jaw or compact goatee treatments. Female variants use a high braided ponytail, swept bob, braided crown with side braid, and undercut topknot with temple braids. Horn tips must remain safely inside the square frame; preserve the dark-teal backdrop, warm upper-left lighting and chunky pixel rendering.

Stoneborn Spellbow portraits: preserve unmistakable living gray-stone anatomy, carved hair, glowing amber eyes, restrained antique-gold forehead and cheek runes, and visible mineral grain while applying the midnight-teal Spellbow coat, blackened leather pauldrons, antique-gold trim, violet diamond clasp, blackwood bow and crystal arrows. Male variants use a compact topknot, jagged slate crest, bound long locks, and swept segmented crown with distinct carved beard forms. Female variants use a high sculpted ponytail, asymmetric slate bob, braided crown with side braid, and short crystal-like crop; all remain unbearded. Pale quartz seams, darker basalt flecks, and repaired gold cracks provide limited variation without weakening the gray-granite identity. Keep the approved square framing, dark-teal backdrop, warm upper-left light and chunky pixel rendering.

Veilborn Spellbow portraits: retain lavender-violet spectral skin, angular otherworldly faces, long pointed ears, icy cyan glowing eyes, silver-white hair and restrained luminous violet veil-cracks while carrying forward the midnight-teal Spellbow coat, blackened leather pauldrons, antique-gold trim, violet diamond clasp, blackwood bow and crystal arrows. Male variants use a high tail, short textured crop, low-bound shoulder lengths, and braided crown topknot with limited pale stubble or goatee treatments. Female variants use a high ponytail, asymmetric bob, braided crown with side braid, and compact topknot with temple braids; all remain unbearded. Vary crack placement without overwhelming facial readability, preserve the continuous dark-teal backdrop, and keep the approved square framing, warm upper-left light and chunky pixel rendering.

Human Bulwark portraits: establish the Bulwark class with heavy blackened dark-steel plate, layered pauldrons, midnight-navy padding, reinforced gorget, restrained antique-gold rivets and edging, a small amber shield-knot clasp, and the readable gold-edged upper corner and vertical rim of one massive rectangular tower shield beside the lower-right shoulder. Male variants use swept chestnut hair with boxed beard, a near-black cropped cut, low-bound shoulder hair with divided beard, and a sandy short crop with compact goatee. Female variants use a high practical bun, asymmetric near-black crop, low-tied auburn waves, and sandy-blond braided crown with rear bun; all remain unbearded. Preserve broad grounded posture, practical martial defense without holy glow, continuous dark-teal backdrop, warm upper-left light, square safe framing and chunky pixel rendering.
