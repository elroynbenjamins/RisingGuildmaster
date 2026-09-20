import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useGuild } from "./GuildContext";
import { guildActionNotifications } from "../ui/actionNotifications";
export function useActionNotifications() {
  const { guild } = useGuild();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const interval = setInterval(refresh, 60000);
    const subscription = AppState.addEventListener("change", (state) => { if (state === "active") refresh(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, []);
  return guildActionNotifications(guild, now);
}
