export const MAIN_TABS = ["Guild", "Quests", "World", "Heroes", "Inventory"] as const;
export type MainTab = typeof MAIN_TABS[number];
export function isMainTab(value: string): value is MainTab { return MAIN_TABS.includes(value as MainTab); }
export function selectMainTab(current: MainTab, requested: string): MainTab { return isMainTab(requested) ? requested : current; }
