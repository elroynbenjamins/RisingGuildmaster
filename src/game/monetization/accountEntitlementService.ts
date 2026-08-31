import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContentEntitlements, mergeContentEntitlements, type ContentEntitlements } from "./contentUnlockService";

const ACCOUNT_ENTITLEMENTS_KEY = "guildmaster.account.entitlements.v1";

/** Permanent device/account profile. This key is deliberately not removed with a guild save. */
export async function loadAccountContentEntitlements(): Promise<ContentEntitlements> {
  const stored = await AsyncStorage.getItem(ACCOUNT_ENTITLEMENTS_KEY);
  if (!stored) return createContentEntitlements();
  try {
    return mergeContentEntitlements(JSON.parse(stored) as Partial<ContentEntitlements>);
  } catch {
    return createContentEntitlements();
  }
}

/** Entitlements only ever merge forward: saving another guild cannot revoke owned content. */
export async function saveAccountContentEntitlements(entitlements: ContentEntitlements): Promise<void> {
  const existing = await loadAccountContentEntitlements();
  await AsyncStorage.setItem(ACCOUNT_ENTITLEMENTS_KEY, JSON.stringify(mergeContentEntitlements(existing, entitlements)));
}
