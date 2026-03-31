import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LayoutDashboard, ArrowLeftRight, LogOut, Check, X, Clock, UserX } from "lucide-react-native";
import { useAuth } from "../../../lib/auth-context";
import { useShopAppointments } from "../../../lib/hooks";
import { supabase } from "../../../lib/supabase";
import { colors } from "../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

export default function TodayScreen() {
  const { session, signOut, setMode } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const { data: appointments, isLoading, refetch } = useShopAppointments(shopId || undefined, today);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Load barber's shop
  useEffect(() => {
    async function loadShop() {
      const saved = await AsyncStorage.getItem("kk-barber-shopId");
      if (saved) { setShopId(saved); return; }
      // Look up shop by user email
      if (!session?.user.email) return;
      const { data: user } = await supabase.from("User").select("id").eq("email", session.user.email).single();
      if (!user) return;
      const { data: shop } = await supabase.from("Shop").select("id").eq("userId", user.id).single();
      if (shop) {
        await AsyncStorage.setItem("kk-barber-shopId", shop.id);
        setShopId(shop.id);
      }
    }
    loadShop();
  }, [session]);

  const typedAppointments = (appointments || []) as Array<{
    id: string; date: string; startTime: string; endTime: string;
    customerName: string; customerEmail: string; customerPhone: string | null;
    status: string;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  }>;

  const confirmed = typedAppointments.filter((a) => a.status === "CONFIRMED");
  const completed = typedAppointments.filter((a) => a.status === "COMPLETED");

  async function updateStatus(id: string, status: string) {
    await supabase.from("Appointment").update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["shopAppointments"] });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dashboard</Text>
          <Text style={styles.date}>Vandaag — {today}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setMode("customer")} hitSlop={8}>
            <ArrowLeftRight size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} hitSlop={8}>
            <LogOut size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{confirmed.length}</Text>
          <Text style={styles.statLabel}>Vandaag</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completed.length}</Text>
          <Text style={styles.statLabel}>Afgerond</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {formatPrice(typedAppointments.filter((a) => a.status !== "CANCELLED").reduce((s, a) => s + (a.service?.price || 0), 0))}
          </Text>
          <Text style={styles.statLabel}>Omzet</Text>
        </View>
      </View>

      {/* Appointments */}
      {isLoading || !shopId ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : confirmed.length === 0 ? (
        <View style={styles.empty}>
          <LayoutDashboard size={32} color={colors.muted} />
          <Text style={styles.emptyText}>Geen afspraken vandaag</Text>
        </View>
      ) : (
        <FlatList
          data={confirmed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          renderItem={({ item: apt }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTime}>{apt.startTime} - {apt.endTime}</Text>
                  <Text style={styles.cardCustomer}>{apt.customerName}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.cardService}>{apt.service?.name}</Text>
                  <Text style={styles.cardPrice}>{apt.service ? formatPrice(apt.service.price) : ""}</Text>
                </View>
              </View>
              {apt.barber && <Text style={styles.cardBarber}>Kapper: {apt.barber.name}</Text>}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionDone}
                  onPress={() => updateStatus(apt.id, "COMPLETED")}
                >
                  <Check size={14} color={colors.success} />
                  <Text style={styles.actionDoneText}>Afgerond</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionNoShow}
                  onPress={() => updateStatus(apt.id, "NO_SHOW")}
                >
                  <UserX size={14} color={colors.muted} />
                  <Text style={styles.actionNoShowText}>No-show</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionCancel}
                  onPress={() => Alert.alert("Annuleren", "Afspraak annuleren?", [
                    { text: "Nee", style: "cancel" },
                    { text: "Ja", style: "destructive", onPress: () => updateStatus(apt.id, "CANCELLED") },
                  ])}
                >
                  <X size={14} color={colors.destructive} />
                  <Text style={styles.actionCancelText}>Annuleer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12 },
  greeting: { fontSize: 28, fontWeight: "700", color: colors.foreground },
  date: { fontSize: 13, color: colors.muted, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 16 },
  stats: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 12, alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "700", color: colors.gold },
  statLabel: { fontSize: 10, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, color: colors.muted },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  cardTime: { fontSize: 18, fontWeight: "700", color: colors.gold, fontVariant: ["tabular-nums"] },
  cardCustomer: { fontSize: 15, fontWeight: "600", color: colors.foreground, marginTop: 2 },
  cardService: { fontSize: 13, color: colors.foreground, fontWeight: "500" },
  cardPrice: { fontSize: 13, color: colors.gold, fontWeight: "600", marginTop: 1 },
  cardBarber: { fontSize: 12, color: colors.muted, marginTop: 6 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  actionDone: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: "rgba(109, 184, 123, 0.1)", borderRadius: 8, paddingVertical: 8,
  },
  actionDoneText: { fontSize: 12, fontWeight: "600", color: colors.success },
  actionNoShow: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: colors.surfaceLight, borderRadius: 8, paddingVertical: 8,
  },
  actionNoShowText: { fontSize: 12, fontWeight: "600", color: colors.muted },
  actionCancel: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: "rgba(201, 74, 109, 0.1)", borderRadius: 8, paddingVertical: 8,
  },
  actionCancelText: { fontSize: 12, fontWeight: "600", color: colors.destructive },
});
