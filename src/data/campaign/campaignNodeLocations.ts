export interface CampaignNodeLocationDefinition { regionId: string; settlementIds?: string[] }

/**
 * Explicit story locations for dialogue/choice campaign nodes.
 * Quest and boss nodes continue to use their quest's authored region/settlement metadata.
 */
export const CAMPAIGN_NODE_LOCATIONS: Record<string, CampaignNodeLocationDefinition> = {
  founding_the_guild: { regionId: "greenveil", settlementIds: ["guildhaven"] },
  strange_tracks: { regionId: "greenveil" },
  broken_wardstone: { regionId: "greenveil" },

  council_of_splinters: { regionId: "iron_hills", settlementIds: ["stonegate"] },
  voices_under_stone: { regionId: "iron_hills", settlementIds: ["stonegate"] },
  laurel_below: { regionId: "iron_hills" },

  northwatch_two_skies: { regionId: "frostmarch", settlementIds: ["northwatch"] },
  council_at_northwatch: { regionId: "frostmarch", settlementIds: ["northwatch"] },
  the_moon_gate: { regionId: "frostmarch" },

  a_bell_without_tower: { regionId: "frostmarch" },
  names_in_the_reeds: { regionId: "shadowfen", settlementIds: ["blackwater"] },
  the_last_true_name: { regionId: "shadowfen" },

  east_with_the_covenant: { regionId: "shadowfen", settlementIds: ["blackwater"] },
  embers_council: { regionId: "ashlands", settlementIds: ["emberfall"] },
  judgment_at_the_hearth: { regionId: "ashlands" },

  home_to_a_lowered_banner: { regionId: "greenveil", settlementIds: ["guildhaven"] },
  trial_of_the_false_oath: { regionId: "greenveil", settlementIds: ["guildhaven"] },
  a_banner_freely_raised: { regionId: "greenveil", settlementIds: ["guildhaven"] },

  the_answer_in_brass: { regionId: "iron_hills", settlementIds: ["stonegate"] },
  the_scale_and_the_signature: { regionId: "iron_hills", settlementIds: ["skyvault"] },
  the_concord_of_six: { regionId: "iron_hills", settlementIds: ["skyvault"] },

  six_bells_west: { regionId: "greenveil", settlementIds: ["guildhaven"] },
  terms_at_low_tide: { regionId: "greenveil", settlementIds: ["tidewatch"] },
  the_seventh_bell: { regionId: "greenveil", settlementIds: ["tidewatch"] },

  map_that_bled_salt: { regionId: "greenveil", settlementIds: ["tidewatch"] },
  name_of_the_seventh: { regionId: "greenveil" },
  name_returned_to_sea: { regionId: "greenveil", settlementIds: ["tidewatch"] },
};
