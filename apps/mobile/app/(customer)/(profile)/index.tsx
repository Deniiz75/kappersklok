import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, LogOut, ArrowLeftRight, Pencil } from "lucide-react-native";
import { useAuth } from "../../../lib/auth-context";
import { useCustomerProfile } from "../../../lib/hooks";
import { colors } from "../../../lib/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut, setMode } = useAuth();
  const email = session?.user.email;
  const { data: profile } = useCustomerProfile(email);
  const p = profile as { name?: string | null; phone?: string | null } | null | undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <User size={32} color={colors.gold} />
        </View>
        <Text style={styles.title}>{p?.name || "Profiel"}</Text>
        <Text style={styles.email}>{email || "Niet ingelogd"}</Text>
        {p?.phone && <Text style={styles.email}>{p.phone}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/(customer)/(profile)/edit")}>
            <Pencil size={18} color={colors.gold} />
            <Text style={styles.actionText}>Profiel bewerken</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setMode("barber")}>
            <ArrowLeftRight size={18} color={colors.gold} />
            <Text style={styles.actionText}>Wissel naar Kapper-modus</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={signOut}>
            <LogOut size={18} color={colors.destructive} />
            <Text style={[styles.actionText, { color: colors.destructive }]}>Uitloggen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, alignItems: "center", padding: 32, paddingTop: 60 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  email: { fontSize: 14, color: colors.muted, marginTop: 4 },
  actions: { width: "100%", marginTop: 40, gap: 12 },
  actionButton: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 12, padding: 16,
  },
  actionText: { fontSize: 15, color: colors.foreground, fontWeight: "500" },
  logoutButton: { borderColor: "rgba(201, 74, 109, 0.2)" },
});
