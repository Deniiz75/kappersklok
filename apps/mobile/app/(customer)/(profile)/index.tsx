import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogOut, ArrowLeftRight } from "lucide-react-native";
import { useAuth } from "../../../lib/auth-context";
import { colors } from "../../../lib/theme";

export default function ProfileScreen() {
  const { session, signOut, setMode } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <User size={32} color={colors.gold} />
        </View>
        <Text style={styles.title}>Profiel</Text>
        <Text style={styles.email}>{session?.user.email || "Niet ingelogd"}</Text>

        <View style={styles.actions}>
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
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 16,
  },
  actionText: { fontSize: 15, color: colors.foreground, fontWeight: "500" },
  logoutButton: { borderColor: "rgba(201, 74, 109, 0.2)" },
});
