export interface TutorialGuideTopic {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  accent: "gold" | "good" | "danger" | "blue";
}

export const TUTORIAL_GUIDE_TOPICS: readonly TutorialGuideTopic[] = [
  {
    id: "recruitment",
    title: "Recruitment & Contracts",
    subtitle: "Build a balanced guild without bankrupting it.",
    accent: "gold",
    bullets: [
      "Candidate cards show tactical role fit, traits, upfront fee, weekly salary, and departure deadline.",
      "A candidate marked FILLS ... GAP covers a role your living roster currently lacks; balanced four-hero parties usually want frontline, support, and ranged coverage.",
      "Scouting narrows uncertain stats and contract estimates. Expert scouting reveals exact figures.",
      "Only one hero may be recruited from each candidate batch before the board must refresh. Reserved candidates survive a refresh for a limited time.",
    ],
  },
  {
    id: "war_table",
    title: "Guild War Table",
    subtitle: "Treat the Guild tab as your command center.",
    accent: "blue",
    bullets: [
      "CURRENT ORDER is the most important action the Guildmaster recommends right now.",
      "Navigation badges show unresolved actions; the Active Orders strip shows training, gathering, scouting, and dungeon work already underway.",
      "After the Chieftain stage, an under-levelled top-four roster can be routed directly toward one-clear Side Quests for catch-up XP.",
    ],
  },
  {
    id: "quests",
    title: "Quests, Side Quests & Deployment",
    subtitle: "Read the order, then read the risk.",
    accent: "good",
    bullets: [
      "Side Quests are tied to places and can only be cleared once. Their one-time drop rewards are protected so the single clear cannot waste an intended chance reward.",
      "Before deployment, check party average level, HP, readiness after the mission, frontline/support/ranged coverage, equipment durability, potions, and Monster Manual intel.",
      "AUTO-FILL BALANCED tries to create a frontline/support/ranged core when those roles are available.",
      "READY TO DEPLOY means no major warning was found; WATCH or HIGH RISK means you should inspect the listed reasons before committing.",
    ],
  },
  {
    id: "combat",
    title: "Tactical Combat",
    subtitle: "Movement and actions are separate orders.",
    accent: "danger",
    bullets: [
      "Double-tap a pale-yellow tile to move the active hero.",
      "With no Quick Skill selected, a SOLID RED BORDER marks an enemy that can be basic-attacked immediately. Double-tap that enemy to attack.",
      "Select a Quick Skill, then double-tap a highlighted legal target to use it. End Turn when that hero is finished.",
      "Boss phase panels announce major tactical changes. Raids use separate bespoke raid objectives and two-squad mechanics rather than normal boss reactions.",
    ],
  },
  {
    id: "time",
    title: "Calendar, Healing & Payroll",
    subtitle: "Every day is a management decision.",
    accent: "gold",
    bullets: [
      "Every End Day heals each living hero by 10% of maximum HP, restores normal readiness, collects tavern income, and advances all timed systems.",
      "Payroll, candidate expiry, contracts, training, construction, gathering, scouting, and regional threats all move with the same calendar.",
      "Use the seven-day Guild Planner to inspect future days before advancing, or Jump to Next Milestone when nothing requires manual timing.",
    ],
  },
  {
    id: "heroes",
    title: "Heroes & Progression",
    subtitle: "Read field condition before raw statistics.",
    accent: "blue",
    bullets: [
      "Hero cards prioritize HP, readiness, XP, duty status, loyalty, contract urgency, and available skill points.",
      "Loyalty reacts to victories, defeats, injuries, payroll, arrears, and personal-quest outcomes, and can influence renewal salary demands.",
      "Level-ups can unlock subclass/mastery choices and class skill points. Quest results provide direct links to spend newly earned progression.",
    ],
  },
  {
    id: "world",
    title: "World Travel",
    subtitle: "Routes cost time and supplies.",
    accent: "good",
    bullets: [
      "Travel previews days, rations, arrival day, party level risk, regional threat, and any payroll crossed on the route.",
      "Side Quests must be taken at their linked settlement, so travel is part of preparation rather than a menu shortcut.",
      "Locked roads show the campaign requirement that opens them; local maps show HERE, available orders, services, and regional progress.",
    ],
  },
  {
    id: "archives",
    title: "Archives & Mission Intel",
    subtitle: "Knowledge now has gameplay value.",
    accent: "blue",
    bullets: [
      "Encountered enemies expand the Monster Manual and improve Mission Intel shown during quest preparation.",
      "Unknown creatures remain hidden until discovered; documented enemies reveal identities, roles, and encounter coverage.",
      "Monster Manual, Lore, Skill, and Hero Codex milestones can award claimable Guildmaster XP and Reputation.",
    ],
  },
  {
    id: "inventory",
    title: "Armory, Gear & Durability",
    subtitle: "Equip heroes by build, not by rarity alone.",
    accent: "gold",
    bullets: [
      "Inventory cards flag likely upgrades, tradeoffs, sidegrades, and heroes who cannot equip an item. A higher rarity is not automatically better for every build.",
      "Open an item to compare its calculated stat changes hero by hero before equipping it. Empty compatible slots count as obvious upgrades.",
      "Durability scales an item's numerical bonuses. WORN gear deserves attention; DAMAGED and BROKEN gear should be repaired at an operational Blacksmith.",
      "Selling converts a copy into gold. Salvaging permanently destroys it to recover part of its crafting materials when the required workshop is operational.",
    ],
  },
  {
    id: "training",
    title: "Training Yard",
    subtitle: "Use downtime to catch up reserves without replacing adventuring.",
    accent: "blue",
    bullets: [
      "Training makes a hero unavailable until the program finishes. Active sessions and their return day appear in the Training Yard and Guild Calendar.",
      "Programs grant XP only. They never grant permanent attributes and stop at a campaign/roster catch-up cap, so training cannot overtake current progression.",
      "Readiness still recovers as calendar days pass while a hero trains. The order preview shows expected XP, projected readiness, cost, and return day before you commit.",
      "After the Chieftain stage, if the top-four roster is below the next campaign recommendation, one-clear Side Quests remain the main active catch-up path; use Training to supplement downtime and lagging reserves.",
    ],
  },
  {
    id: "workshops",
    title: "Workshops & Crafting",
    subtitle: "Turn patterns and monster materials into deliberate upgrades.",
    accent: "gold",
    bullets: [
      "CRAFTABLE means every requirement is met now. LOCKED recipes explain whether the missing gate is a pattern, workshop construction, or workshop level.",
      "UPGRADES uses real hero stat comparisons. Higher rarity does not automatically mean better for every class or build.",
      "Tap a material requirement to see known sources. Exact monster sources stay hidden until that creature is discovered in the Monster Manual.",
      "The Blacksmith repairs durability, while the Jeweler can bind one initial enchantment to compatible equipment. Workshop construction and upgrades advance through the Guild Calendar.",
    ],
  },
  {
    id: "dungeons_raids",
    title: "Dungeons & Raids",
    subtitle: "These are special activities, not repeatable normal quests.",
    accent: "gold",
    bullets: [
      "Roguelite dungeon runs build temporary Boons and Pacts that last only for that expedition.",
      "Raids are protected as the largest encounter type: eight heroes, two four-hero squads, bespoke objectives, recurring telegraphs, raid records, and lockouts.",
      "Normal campaign bosses can have HP-triggered phases, but they deliberately do not use the Raid ruleset.",
    ],
  },
];
