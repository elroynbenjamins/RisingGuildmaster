# Milestone 5 architecture review

The mobile interface is a projection of existing domain state. The management shell owns exactly five permanent destinations (`Guild`, `Quests`, `World`, `Heroes`, and `Inventory`); secondary flows such as recruitment, quest details, party assembly, hero details, subclass selection, story events, and combat sit outside the tab bar and return to a known main destination.

UI selectors in `src/ui` contain filter, sort, category, notification, navigation, and equipment-comparison logic. Screens do not redefine hero formulas, quest rules, world unlocks, party validation, equipment restrictions, or combat resolution. Equipment comparison calls the existing equipment and hero calculation pipelines on an immutable hero copy.

Save hydration is explicitly exposed by the guild context, so management screens never briefly render a fresh guild over an existing save. `recentPartyHeroIds` is persisted as presentation-supporting game state and migrated with a safe empty default.

Unsupported training, healing, shop, crafting, upgrades, staff, and finance systems are labelled `Coming Soon`; their buttons do not imply completed backend behavior. Quests, world travel, recruitment, subclass selection, inventory equipment, and tactical combat remain connected to real game services.

The next milestone can add shop/economy and service backends without changing the five-tab shell or moving game rules into components.
