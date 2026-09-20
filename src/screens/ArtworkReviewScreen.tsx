import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ActionButton, Panel } from "../components/ui";
import { HeroPortrait } from "../components/heroes/HeroPortrait";
import { NpcPortrait } from "../components/characters/NpcPortrait";
import { EnemyPortrait } from "../components/enemies/EnemyPortrait";
import { SkillIcon } from "../components/skills/SkillIcon";
import { useTheme } from "../theme/theme";

export function ArtworkReviewScreen({ onBack }: { onBack(): void }) {
  const { colors } = useTheme();
  const warriorRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const rangerRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const mageRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const clericRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const paladinRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const berserkerRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const monkRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const bardRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const spellbowRaces = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as const;
  const bulwarkRaces = ["human"] as const;
  const genders = ["female", "male"] as const;
  const variants = [1, 2, 3, 4] as const;
  const warriorSkills = ["warrior_sword_strike", "warrior_shield_bash", "warrior_power_strike", "warrior_battle_hardened"];
  const rangerSkills = ["ranger_bow_shot", "ranger_precise_shot", "ranger_multi_shot", "ranger_hunters_focus"];
  const mageSkills = ["mage_arcane_bolt", "mage_fireball", "mage_frost_bolt", "mage_arcane_knowledge"];
  const clericSkills = ["cleric_holy_strike", "cleric_heal", "cleric_divine_light", "cleric_faith"];
  const paladinSkills = ["paladin_holy_slash", "paladin_smite", "paladin_guardians_oath", "paladin_holy_armor"];
  const berserkerSkills = ["berserker_wild_swing", "berserker_frenzied_strike", "berserker_whirlwind", "berserker_rage"];
  const monkSkills = ["monk_unarmed_strike", "monk_flurry_of_blows", "monk_patient_defense", "monk_deflect_missiles"];
  const bardSkills = ["bard_rapier_strike", "bard_inspiration", "bard_dissonant_whisper", "bard_song_of_rest"];
  const spellbowSkills = ["spellbow_arcane_arrow", "spellbow_ember_arrow", "spellbow_frost_arrow", "spellbow_runic_aim"];
  const bulwarkSkills = ["bulwark_shield_bash", "bulwark_interpose", "bulwark_brace", "bulwark_hold_line"];
  const summonerSkills = ["summoner_spirit_bolt", "summoner_call_wisp", "summoner_binding_ward", "summoner_shared_essence"];
  const samples = [
    { name: "Human Warrior · Male", render: (size: number) => <HeroPortrait raceId="human" classId="warrior" gender="male" label="Human Warrior" size={size} /> },
    { name: "Mara Voss · Female NPC", render: (size: number) => <NpcPortrait portraitId="registrar_mara_voss" size={size} /> },
    { name: "Orc Raider · Enemy", render: (size: number) => <EnemyPortrait enemyId="orc_raider" size={size} /> },
    { name: "Sword Strike · Basic Attack", render: (size: number) => <SkillIcon skillId="warrior_sword_strike" size={size} /> },
  ];
  return <ScrollView contentContainerStyle={{ padding: 18, alignItems: "center", gap: 12 }} style={{ backgroundColor: colors.background }}>
    <View style={{ width: "100%", maxWidth: 430, gap: 12 }}>
      <ActionButton label="Back to Game" onPress={onBack} />
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 24 }}>Guildmaster · Artwork Review</Text>
      <Text style={{ color: colors.muted }}>Replacement artwork rendered through the game's actual portrait and icon components. All source files and frames are square.</Text>
      {samples.map(sample => <Panel key={sample.name}>
        <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 12 }}>{sample.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {[84, 52, 32].map(size => <View key={size} style={{ alignItems: "center", gap: 8 }}>{sample.render(size)}<Text style={{ color: colors.muted }}>{size} × {size}</Text></View>)}
        </View>
      </Panel>)}
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>WARRIOR PRODUCTION SET · {warriorRaces.length * genders.length * variants.length}</Text>
      {warriorRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Warrior</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="warrior" gender={gender} variant={variant} label={`${raceId} warrior ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Warrior core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {warriorSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("warrior_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>RANGER PRODUCTION SET · {rangerRaces.length * genders.length * variants.length}</Text>
      {rangerRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Ranger</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="ranger" gender={gender} variant={variant} label={`${raceId} ranger ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Ranger core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {rangerSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("ranger_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>MAGE PRODUCTION SET · {mageRaces.length * genders.length * variants.length}</Text>
      {mageRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Mage</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="mage" gender={gender} variant={variant} label={`${raceId} mage ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Mage core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {mageSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("mage_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>CLERIC PRODUCTION SET · {clericRaces.length * genders.length * variants.length}</Text>
      {clericRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Cleric</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="cleric" gender={gender} variant={variant} label={`${raceId} cleric ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Cleric core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {clericSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("cleric_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>PALADIN PRODUCTION SET · {paladinRaces.length * genders.length * variants.length}</Text>
      {paladinRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Paladin</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="paladin" gender={gender} variant={variant} label={`${raceId} paladin ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Paladin core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {paladinSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("paladin_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>BERSERKER PRODUCTION SET · {berserkerRaces.length * genders.length * variants.length}</Text>
      {berserkerRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Berserker</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="berserker" gender={gender} variant={variant} label={`${raceId} berserker ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Berserker core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {berserkerSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("berserker_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>MONK PRODUCTION SET · {monkRaces.length * genders.length * variants.length}</Text>
      {monkRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Monk</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="monk" gender={gender} variant={variant} label={`${raceId} monk ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Monk core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {monkSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("monk_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>BARD PRODUCTION SET · {bardRaces.length * genders.length * variants.length}</Text>
      {bardRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Bard</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="bard" gender={gender} variant={variant} label={`${raceId} bard ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Bard core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {bardSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("bard_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>SPELLBOW PRODUCTION SET · {spellbowRaces.length * genders.length * variants.length}</Text>
      {spellbowRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Spellbow</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="spellbow" gender={gender} variant={variant} label={`${raceId} spellbow ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Spellbow core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {spellbowSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("spellbow_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>BULWARK PRODUCTION SET · {bulwarkRaces.length * genders.length * variants.length}</Text>
      {bulwarkRaces.map(raceId => <Panel key={raceId}>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12, textTransform: "capitalize" }}>{raceId} Bulwark</Text>
        {genders.map(gender => <View key={gender} style={{ marginBottom: 12, gap: 7 }}>
          <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase" }}>{gender}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {variants.map(variant => <View key={variant} style={{ alignItems: "center", gap: 4 }}>
              <HeroPortrait raceId={raceId} classId="bulwark" gender={gender} variant={variant} label={`${raceId} bulwark ${gender} ${variant}`} size={64} />
              <Text style={{ color: colors.muted, fontSize: 11 }}>V{variant}</Text>
            </View>)}
          </View>
        </View>)}
      </Panel>)}
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Bulwark core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {bulwarkSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("bulwark_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Panel>
        <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 12 }}>Summoner core skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {summonerSkills.map(skillId => <View key={skillId} style={{ width: 72, alignItems: "center", gap: 5 }}>
            <SkillIcon skillId={skillId} size={56} />
            <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>{skillId.replace("summoner_", "").replace(/_/g, " ")}</Text>
          </View>)}
        </View>
      </Panel>
      <Text style={{ color: colors.muted }}>Existing portrait and icon artwork is temporarily hidden. Names, controls and saved characters remain available.</Text>
    </View>
  </ScrollView>;
}
