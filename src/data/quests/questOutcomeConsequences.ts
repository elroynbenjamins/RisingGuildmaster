export interface QuestOutcomeConsequences { victory: string[]; defeat: string[] }

/** Authored visible consequences. Mechanical flags are recorded alongside these by the chronicle service. */
export const QUEST_OUTCOME_CONSEQUENCES: Record<string, QuestOutcomeConsequences> = {
  knives_of_stonegate: { victory: ["Keeper Dagna survives and Stonegate's Gloam Knife cell is broken.", "A blackglass assassination contract enters the guild evidence vault."], defeat: ["The fourth civic target is murdered and the Gloam Knives remain active in Stonegate."] },
  goblin_patrol: { victory: ["Greenveil's nearest patrol road is safe again."], defeat: ["Goblin patrols retain control of the road."] },
  missing_merchant: { victory: ["A missing merchant returns to Guildhaven with testimony about the organized raids."], defeat: ["The merchant remains missing and the trail grows colder."] },
  attack_on_guildhaven: { victory: ["Guildhaven's defenses hold and the guild earns the town's confidence."], defeat: ["Guildhaven survives, but loses supplies and captives to the attackers."] },
  goblin_chieftain_boss: { victory: ["The Greenveil goblin warband is broken; its leader's fate now rests with the guild."], defeat: ["The Chieftain remains in power and prepares for another guild assault."] },
  smoke_without_fire: { victory: ["The scorched grove is secured and an ancient scale enters the guild's evidence vault."], defeat: ["Relic hunters strip the grove before the guild can secure its evidence."] },
  the_scale_collector: { victory: ["Master Veyr's scale trade is disrupted and its eastern buyer is exposed."], defeat: ["Veyr escapes east with his strongest relics and surviving records."] },
  the_hollow_below: { victory: ["The hidden observatory is opened and its Wardmaker mural is preserved in the guild record."], defeat: ["The star door seals, leaving the observatory and its guardian intact."] },
  ashes_of_blackbridge: { victory: ["Keeper Sella and half of the Blackbridge ledger are recovered."], defeat: ["Blackbridge's hidden witness and evidence are lost beneath the river."] },
  blackbridge_ledger: { victory: ["The Iron Laurel's sealed order is recovered as evidence."], defeat: ["The storehouse records are destroyed before they can identify who gave the order."] },
  oath_of_the_broken_bridge: { victory: ["Blackbridge's dead deliver testimony that clears the Guildmaster and implicates the Iron Laurel."], defeat: ["The final testimony remains sealed in the drowned undercroft."] },
  the_aurora_that_fell: { victory: ["The fallen aurora withdraws from Northwatch's southern road and the regional threat is cleared.", "Frostmarch confirms that the damaged Wardstones are transmitting a summons toward the Ashlands."], defeat: ["The false aurora consumes another signal tower and Frostmarch's regional threat continues to rise."] },
};
