import React, { createContext, useContext } from "react";

export type ThemeId = "guild_dark" | "oled_dark" | "high_contrast";
export interface ThemePalette { background:string; panel:string; panel2:string; gold:string; text:string; muted:string; green:string; danger:string; border:string; blue:string; buttonText:string; backdrop:string }

export const THEMES: Record<ThemeId, { name:string; description:string; statusBar:"light-content"|"dark-content"; colors:ThemePalette }> = {
  guild_dark: { name:"Guild Dark", description:"The original charcoal, parchment, and gold presentation.", statusBar:"light-content", colors:{ background:"#101416",panel:"#1a2123",panel2:"#232d2f",gold:"#d8ad5c",text:"#f3eee3",muted:"#a8b1ad",green:"#79b887",danger:"#dd7a73",border:"#354044",blue:"#70a4c5",buttonText:"#17130c",backdrop:"rgba(3, 7, 8, 0.82)" } },
  oled_dark: { name:"OLED Dark", description:"True-black foundations with subdued panels for dark rooms and OLED displays.", statusBar:"light-content", colors:{ background:"#000000",panel:"#0b0d0e",panel2:"#15191a",gold:"#dfb660",text:"#f6f1e7",muted:"#aeb6b2",green:"#7ec18c",danger:"#e47e77",border:"#2c3436",blue:"#78acd0",buttonText:"#17130c",backdrop:"rgba(0, 0, 0, 0.9)" } },
  high_contrast: { name:"High Contrast", description:"Brighter text, stronger borders, and clearer interactive states.", statusBar:"light-content", colors:{ background:"#080b0c",panel:"#151a1c",panel2:"#20282b",gold:"#ffd36b",text:"#ffffff",muted:"#d2d8d5",green:"#92e3a5",danger:"#ff9189",border:"#718084",blue:"#8ed1ff",buttonText:"#080b0c",backdrop:"rgba(0, 0, 0, 0.88)" } },
};
const ThemeContext=createContext(THEMES.guild_dark);
export function ThemeProvider({themeId,children}:React.PropsWithChildren<{themeId:ThemeId}>){return <ThemeContext.Provider value={THEMES[themeId]}>{children}</ThemeContext.Provider>}
export function useTheme(){return useContext(ThemeContext)}
