export interface StorySceneDefinition { id: string; title: string; paragraphs: string[]; speakerLines: { speaker: string; text: string }[] }

export const GUILD_ORIGIN_SCENE: StorySceneDefinition = {
  id: "guild_origin_iron_laurel",
  title: "A Guild of Your Own",
  paragraphs: [
    "Before becoming Guildmaster, you served as contract steward for the Iron Laurel—the richest and most celebrated adventuring guild operating around Highcourt.",
    "At Blackbridge, Guildmaster Cassian Vane ordered his famous veterans to withdraw from a collapsing ruin while six newly recruited heroes were still trapped below. The Laurel preserved its champions, blamed the dead, and called the contract a victory.",
    "You refused to alter the expedition record. Cassian stripped you of rank and made certain no prestigious guild would hire you. Guildhaven, overlooked by larger companies and increasingly desperate for protection, offered you an old charter hall instead.",
    "Your new guild begins with little gold, no heroes, and no reputation. The Iron Laurel has all three. What it lacks is the kind of Guildmaster you intend to become.",
  ],
  speakerLines: [
    { speaker: "Cassian Vane", text: "A guild is remembered for the champions it preserves, not the names it spends." },
    { speaker: "Registrar Mara Voss", text: "Guildhaven cannot offer prestige. It can offer people who need someone to stay when the famous guilds leave." },
  ],
};

const scenes: StorySceneDefinition[] = [
  GUILD_ORIGIN_SCENE,
  { id: "strange_tracks", title: "A Pattern in the Mud", paragraphs: ["The tracks are too orderly for hungry raiders. Boot prints surround a dragged mining sledge, and every broken crate once held chisels, rope, or lamp oil.", "Wedged beneath a wheel rut is a sliver of polished green stone. It hums when carried toward the old Mosswatch road."], speakerLines: [{ speaker: "Registrar Mara Voss", text: "They did not raid us for food. Someone equipped them for an excavation." }] },
  { id: "broken_wardstone", title: "The First Fracture", paragraphs: ["Beyond the Chieftain's camp stands one of Greenveil's forgotten Wardstones, split by a clean cut rather than age. The stolen fragment fits the wound.", "Lines of fading light run north-east toward the Iron Hills and south into Shadowfen. Greenveil's crisis is only one break in a continent-wide chain."], speakerLines: [{ speaker: "Goblin Chieftain", text: "Laurel-men gave iron. Told us dig bright stone. Then the stone started whispering." }] },
  { id: "council_of_splinters", title: "An Unwelcome Charter", paragraphs: ["Stonegate's keepers recognize the fragment immediately: heartstone from the deep Ward beneath Kharum-Deep. Three ore convoys vanished after carrying sealed Iron Laurel equipment into the hills.", "Cassian Vane's guild holds the royal investigation charter. Its official report calls the tremors ordinary mine subsidence."], speakerLines: [{ speaker: "Keeper Dagna Flint", text: "Mountains settle. They do not whisper names through solid iron." }, { speaker: "Iron Laurel Envoy", text: "Your charter ends at Greenveil. Leave the hills to professionals." }] },
  { id: "voices_under_stone", title: "The Mark on the Manifest", paragraphs: ["Each recovered manifest bears a Laurel seal and a second mark burned through it: a circle broken into five pieces—the geometry of the Wardstone network.", "Someone paid raiders to move heartstone through abandoned lifts. Whether Stonegate learns immediately, or after you know more, is your decision."], speakerLines: [{ speaker: "Surveyor Bruni Vale", text: "Evidence is a kind of weapon, Guildmaster. Decide where to point it before you draw it." }] },
  { id: "laurel_below", title: "What Ghorak Guarded", paragraphs: ["The orcs were not invading Flintwatch. Their families had been chained below and forced to mine a chamber the Iron Laurel could not safely enter.", "When Laurel magi removed the forge's heartstone regulator, ancient sentries awakened. The expedition sealed the laborers inside, falsified its report, and withdrew."], speakerLines: [{ speaker: "Ghorak Chainbreaker", text: "Your gilded rivals opened the deep door. My people paid for what answered." }, { speaker: "Keeper Dagna Flint", text: "If the Hollow Warden reaches the surface, every living soul in the hills will bear the mark of a thief." }] },
];

export const STORY_SCENES: Record<string, StorySceneDefinition> = Object.fromEntries(scenes.map((scene) => [scene.id, scene]));
