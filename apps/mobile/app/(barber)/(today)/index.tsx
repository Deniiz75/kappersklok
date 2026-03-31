import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LayoutDashboard, ArrowLeftRight, LogOut } from "lucide-react-native";
import { useAuth } from "../../../lib/auth-context";
import { colors } from "../../../lib/theme";

export default function TodayScreen() {
  const { session, signOut, setMode } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Dashboard</Text>
        <Text style={styles.email}>{session?.user.email}</Text>
      </View>

      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <LayoutDashboard size={32} color={colors.gold} />
        </View>
        <Text style={styles.title}>Vandaag</Text>
        <Text style={styles.subtitle}>Afspraken overzicht komt hier</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setMode("customer")}>
          <ArrowLeftRight size={18} color={colors.gold} />
          <Text style={styles.actionText}>Wissel naar Klant-modus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={signOut}>
          <LogOut size={18} color={colors.destructive} />
          <Text style={[styles.actionText, { color: colors.destructive }]}>Uitloggen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 16 },
  greeting: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
  inner: { flex: 1, justifyContent: "center", alignItems: "center" },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 8 },
  actions: { padding: 24, gap: 12 },
  actionButton: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 16,
  },
  actionText: { fontSize: 15, color: colors.foreground, fontWeight: "500" },
  logoutButton: { borderColor: "rgba(201, 74, 109, 0.2)" },
});
