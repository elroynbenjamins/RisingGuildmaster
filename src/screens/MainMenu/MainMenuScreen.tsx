import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { ActionButton, Panel, SecondaryButton, colors } from "../../components/ui";
import { useTheme } from "../../theme/theme";

export function MainMenuScreen({ hasSave, onContinue, onNewGame }: { hasSave: boolean; onContinue(): void; onNewGame(): void }) {
  const { showDialog } = useGameDialog();
  const {colors:themeColors}=useTheme();
  const start = () => hasSave ? showDialog({ title: "Start a new guild?", message: "This replaces the current local save when the new game begins.", eyebrow: "IRREVERSIBLE ORDER", tone: "danger", actions: [{ label: "Keep Save", tone: "secondary" }, { label: "New Game", tone: "danger", onPress: onNewGame }] }) : onNewGame();
  const joinDiscord=()=>void Linking.openURL("https://discord.gg/7BWHFyFzzP").catch(()=>showDialog({title:"Could not open Discord",message:"Please visit discord.gg/7BWHFyFzzP in your browser.",eyebrow:"COMMUNITY NOTICE",tone:"danger"}));
  return <View style={[styles.screen,{backgroundColor:themeColors.background}]}><Text style={[styles.eyebrow,{color:themeColors.gold}]}>A GUILD MANAGEMENT ROGUELITE</Text><Text style={[styles.title,{color:themeColors.text}]}>GUILDMASTER</Text><Text style={[styles.subtitle,{color:themeColors.muted}]}>Raise a banner. Build a company. Restore the Wardstones.</Text><Panel style={[styles.menu,{borderColor:themeColors.gold}]}>{hasSave ? <ActionButton label="Continue Guild" onPress={onContinue} /> : null}<SecondaryButton label="New Game" onPress={start} /><Text style={[styles.save,{color:themeColors.muted}]}>{hasSave ? "Local save found · progress autosaves" : "No local save found"}</Text></Panel><View style={styles.community}><Text style={[styles.communityText,{color:themeColors.muted}]}>Share feedback, report bugs, and follow development.</Text><SecondaryButton label="Join the Guildmaster Discord" onPress={joinDiscord}/></View></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 }, eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 2 }, title: { color: colors.text, fontSize: 42, fontWeight: "900", letterSpacing: 3, marginTop: 8 }, subtitle: { color: colors.muted, textAlign: "center", lineHeight: 20, marginTop: 8, maxWidth: 360 }, menu: { gap: 12, marginTop: 32, width: "100%", maxWidth: 380, borderColor: colors.gold }, save: { color: colors.muted, fontSize: 11, textAlign: "center" },community:{gap:8,marginTop:18,maxWidth:380,width:"100%"},communityText:{color:colors.muted,fontSize:11,textAlign:"center"} });
