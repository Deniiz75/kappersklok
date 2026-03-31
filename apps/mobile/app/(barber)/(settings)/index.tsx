import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Switch, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, Clock } from "lucide-react-native";
import { useBarberHours } from "../../../lib/hooks";
import { supabase } from "../../../lib/supabase";
import { colors } from "../../../lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

export default function SettingsScreen() {
  const [shopId, setShopId] = useState<string | null>(null);
  const { data: hours, isLoading } = useBarberHours(shopId || undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    AsyncStorage.getItem("kk-barber-shopId").then((id) => id && setShopId(id));
  }, []);

  const typedHours = (hours || []) as Array<{
    dayOfWeek: number; openTime: string; closeTime: string; closed: boolean;
  }>;

  // Ensure we have all 7 days
  const allDays = Array.from({ length: 7 }, (_, i) => {
    const existing = typedHours.find((h) => h.dayOfWeek === i);
    return existing || { dayOfWeek: i, openTime: "09:00", closeTime: "17:00", closed: true };
  });

  async function toggleDay(dayOfWeek: number, currentlyClosed: boolean) {
    if (!shopId) return;
    await supabase
      .from("BusinessHours")
      .update({ closed: !currentlyClosed })
      .eq("shopId", shopId)
      .eq("dayOfWeek", dayOfWeek);
    queryClient.invalidateQueries({ queryKey: ["shopHours"] });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Instellingen</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={16} color={colors.gold} />
          <Text style={styles.sectionTitle}>Openingstijden</Text>
        </View>

        {isLoading || !shopId ? (
          <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.hoursList}>
            {allDays.map((h) => (
              <View key={h.dayOfWeek} style={styles.hourRow}>
                <Text style={[styles.dayName, !h.closed && styles.dayNameOpen]}>{dayNames[h.dayOfWeek]}</Text>
                <View style={styles.hourRight}>
                  {h.closed ? (
                    <Text style={styles.closedText}>Gesloten</Text>
                  ) : (
                    <Text style={styles.timeText}>{h.openTime} - {h.closeTime}</Text>
                  )}
                  <Switch
                    value={!h.closed}
                    onValueChange={() => toggleDay(h.dayOfWeek, h.closed)}
                    trackColor={{ false: colors.surfaceLight, true: "rgba(212, 168, 83, 0.3)" }}
                    thumbColor={h.closed ? colors.muted : colors.gold}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={16} color={colors.gold} />
          <Text style={styles.sectionTitle}>Zaakgegevens</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Zaakgegevens bewerken is beschikbaar in de volgende update.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "700", color: colors.foreground },
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  hoursList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" },
  hourRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  dayName: { fontSize: 14, color: colors.muted, width: 100 },
  dayNameOpen: { color: colors.foreground, fontWeight: "500" },
  hourRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  closedText: { fontSize: 13, color: colors.muted },
  timeText: { fontSize: 13, color: colors.gold, fontWeight: "500", fontVariant: ["tabular-nums"] },
  infoCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 20, alignItems: "center",
  },
  infoText: { fontSize: 13, color: colors.muted, textAlign: "center" },
});
