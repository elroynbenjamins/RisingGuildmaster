import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { getBowIconCell, getWeaponIconCell } from "../../data/equipment/weaponIcons";
import { equipmentSlotIcon } from "../../data/ui/gameIcons";
import { parseEquipmentKey } from "../../game/equipment/equipmentResolver";
import { getCampaignGearIconCell } from "../../data/equipment/campaignGearIcons";
import { getBalanceEquipmentIconCell } from "../../data/equipment/balanceEquipmentIcons";
import { getRogueliteThemeEquipmentIconCell } from "../../data/equipment/rogueliteThemeEquipmentIcons";
import { getPremiumClassEquipmentIconCell } from "../../data/equipment/premiumClassEquipmentIcons";
import { AtlasCrop } from "../art/AtlasCrop";
import { GameIcon } from "../icons/GameIcon";

const WEAPON_ATLAS = require("../../../assets/equipment/weapon-icons-atlas-v1.png");
const BOW_ATLAS = require("../../../assets/equipment/bow-icons-atlas-v1.png");
const CAMPAIGN_WEAPON_ATLAS = require("../../../assets/equipment/campaign-weapons-atlas-v1.png");
const CAMPAIGN_GEAR_ATLAS = require("../../../assets/equipment/campaign-gear-atlas-v1.png");
const CHAPTER_7_GEAR_ATLAS = require("../../../assets/equipment/iron-hills-chapter7-gear-atlas-v2.png");
const CHAPTER_8_GEAR_ATLAS = require("../../../assets/equipment/western-sea-chapter8-gear-atlas-v1.png");
const CHAPTER_9_GEAR_ATLAS = require("../../../assets/equipment/drowned-seventh-chapter9-gear-atlas-v1.png");
const MONK_BARD_WEAPON_ATLAS = require("../../../assets/equipment/monk-bard-weapons-atlas-v1.png");
const BALANCE_EQUIPMENT_ATLAS = require("../../../assets/equipment/equipment-balance-atlas-v1.png");
const ROGUELITE_THEME_EQUIPMENT_ATLAS = require("../../../assets/equipment/roguelite-theme-gear-atlas-v1.png");
const PREMIUM_CLASS_EQUIPMENT_ATLAS = require("../../../assets/equipment/spellbow-bulwark-equipment-atlas-v1.png");
const SUMMONER_EQUIPMENT_ATLAS = require("../../../assets/equipment/summoner-equipment-atlas-v1.png");

export function EquipmentIcon({ equipmentKey, slot, label, size = 48 }: { equipmentKey?: string | null; slot?: string; label?: string; size?: number }) {
  if (!equipmentKey) return <View accessibilityLabel="Empty equipment slot" style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#d76565", fontSize: size * .45 }}>×</Text></View>;
  const parsedId = equipmentKey ? parseEquipmentKey(equipmentKey).equipmentId : undefined;
  const definition = parsedId ? EQUIPMENT[parsedId] : undefined;
  const campaignGearCell = equipmentKey ? getCampaignGearIconCell(equipmentKey) : undefined;
  const bowCell = equipmentKey ? getBowIconCell(equipmentKey) : undefined;
  const cell = equipmentKey ? getWeaponIconCell(equipmentKey) : undefined;
  const balanceCell = equipmentKey ? getBalanceEquipmentIconCell(equipmentKey) : undefined;
  const themeCell = equipmentKey ? getRogueliteThemeEquipmentIconCell(equipmentKey) : undefined;
  const premiumClassCell = equipmentKey ? getPremiumClassEquipmentIconCell(equipmentKey) : undefined;
  if (premiumClassCell && premiumClassCell.row === 3) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Summoner equipment"} pixel icon`} source={SUMMONER_EQUIPMENT_ATLAS} columns={2} rows={2} column={premiumClassCell.column % 2} row={Math.floor(premiumClassCell.column / 2)} size={size} frameStyle={styles.frame} />;
  if (premiumClassCell) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Premium class equipment"} pixel icon`} source={PREMIUM_CLASS_EQUIPMENT_ATLAS} columns={4} rows={3} column={premiumClassCell.column} row={premiumClassCell.row} size={size} frameStyle={styles.frame} />;
  if (themeCell) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Theme equipment"} pixel icon`} source={ROGUELITE_THEME_EQUIPMENT_ATLAS} columns={4} rows={3} column={themeCell.column} row={themeCell.row} size={size} frameStyle={styles.frame} />;
  if (balanceCell) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Equipment"} pixel icon`} source={BALANCE_EQUIPMENT_ATLAS} columns={5} rows={5} column={balanceCell.column} row={balanceCell.row} size={size} frameStyle={styles.frame} />;
  if (parsedId === "seven-bells-quarterstaff" || parsedId === "echoing-verse-rapier") return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Premium class weapon"} pixel icon`} source={MONK_BARD_WEAPON_ATLAS} columns={2} rows={1} column={parsedId === "seven-bells-quarterstaff" ? 0 : 1} row={0} size={size} frameStyle={styles.frame} />;
  if (campaignGearCell) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Campaign gear"} pixel icon`} source={campaignGearCell.atlas === "chapter7" ? CHAPTER_7_GEAR_ATLAS : campaignGearCell.atlas === "chapter8" ? CHAPTER_8_GEAR_ATLAS : campaignGearCell.atlas === "chapter9" ? CHAPTER_9_GEAR_ATLAS : CAMPAIGN_GEAR_ATLAS} columns={3} rows={campaignGearCell.atlas ? 1 : 3} column={campaignGearCell.column} row={campaignGearCell.row} size={size} frameStyle={styles.frame} />;
  if (bowCell) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Bow"} pixel icon`} source={BOW_ATLAS} columns={4} rows={2} column={bowCell.column} row={bowCell.row} size={size} frameStyle={styles.frame} />;
  if (cell?.row === 6) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Weapon"} pixel icon`} source={CAMPAIGN_WEAPON_ATLAS} columns={2} rows={1} column={cell.column} row={0} size={size} frameStyle={styles.frame} />;
  if (cell) return <AtlasCrop accessibilityLabel={`${label ?? definition?.name ?? "Weapon"} pixel icon`} source={WEAPON_ATLAS} columns={5} rows={6} column={cell.column} row={cell.row} size={size} frameStyle={styles.frame} />;
  return <GameIcon id={equipmentSlotIcon(definition?.slot ?? slot ?? "weapon")} size={size} framed={false} />;
}

const styles = StyleSheet.create({ frame: { borderRadius: 7 } });
