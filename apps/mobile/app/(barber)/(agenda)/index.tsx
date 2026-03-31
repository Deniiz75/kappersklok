import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarDays, Clock, User } from "lucide-react-native";
import { useShopAppointments } from "../../../lib/hooks";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth-context";
import { colors } from "../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";

const shortDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

function generateWeekDates(): { value: string; label: string; isToday: boolean }[] {
  const dates = [];
  const today = new Date();
  for (let i = -3; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      value: d.toISOString().split("T")[0],
      label: `${shortDays[d.getDay()]} ${d.getDate()}`,
      isToday: i === 0,
    });
  }
  return dates;
}

export default function AgendaScreen() {
  const { session } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: appointments, isLoading } = useShopAppointments(shopId || undefined, selectedDate);
  const weekDates = generateWeekDates();

  useEffect(() => {
    AsyncStorage.getItem("kk-barber-shopId").then((id) => id && setShopId(id));
  }, []);

  const typedAppointments = (appointments || []) as Array<{
    id: string; startTime: string; endTime: string;
    customerName: string; customerPhone: string | null;
    status: string;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  }>;

  const filtered = typedAppointments.filter((a) => a.status === "CONFIRMED" || a.status === "COMPLETED");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
      </View>

      {/* Date picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
        {weekDates.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive, d.isToday && selectedDate !== d.value && styles.dateChipToday]}
            onPress={() => setSelectedDate(d.value)}
          >
            <Text style={[styles.dateChipText, selectedDate === d.value && styles.dateChipTextActive]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointments */}
      {isLoading || !shopId ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <CalendarDays size={32} color={colors.muted} />
          <Text style={styles.emptyText}>Geen afspraken op deze dag</Text>
        </View>
      ) : (
        <FlatList
          data={filtered.sort((a, b) => a.startTime.localeCompare(b.startTime))}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item: apt }) => (
            <View style={styles.card}>
              <View style={styles.timeSidebar}>
                <Text style={styles.timeText}>{apt.startTime}</Text>
                <View style={styles.timeLine} />
                <Text style={styles.timeEndText}>{apt.endTime}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.customerName}>{apt.customerName}</Text>
                <Text style={styles.serviceName}>{apt.service?.name}</Text>
                <View style={styles.cardMeta}>
                  <Clock size={10} color={colors.muted} />
                  <Text style={styles.metaText}>{apt.service?.duration} min</Text>
                  {apt.barber && (
                    <>
                      <User size={10} color={colors.muted} />
                      <Text style={styles.metaText}>{apt.barber.name}</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.priceText}>{apt.service ? formatPrice(apt.service.price) : ""}</Text>
                <View style={[styles.statusBadge, apt.status === "COMPLETED" && styles.statusCompleted]}>
                  <Text style={[styles.statusText, apt.status === "COMPLETED" && styles.statusCompletedText]}>
                    {apt.status === "COMPLETED" ? "Afgerond" : "Bevestigd"}
                  </Text>
                </View>
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "700", color: colors.foreground },
  dateScroll: { paddingVertical: 8 },
  dateChip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  dateChipActive: { borderColor: colors.gold, backgroundColor: "rgba(212, 168, 83, 0.1)" },
  dateChipToday: { borderColor: "rgba(212, 168, 83, 0.3)" },
  dateChipText: { fontSize: 13, color: colors.mutedForeground, fontWeight: "500" },
  dateChipTextActive: { color: colors.gold, fontWeight: "600" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, color: colors.muted },
  card: {
    flexDirection: "row", backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden",
  },
  timeSidebar: {
    width: 50, alignItems: "center", justifyContent: "center",
    paddingVertical: 12, borderRightWidth: 1, borderRightColor: colors.border,
  },
  timeText: { fontSize: 13, fontWeight: "700", color: colors.gold, fontVariant: ["tabular-nums"] },
  timeLine: { width: 1, height: 8, backgroundColor: colors.border, marginVertical: 2 },
  timeEndText: { fontSize: 11, color: colors.muted, fontVariant: ["tabular-nums"] },
  cardContent: { flex: 1, padding: 12, gap: 2 },
  customerName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  serviceName: { fontSize: 12, color: colors.muted },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: { fontSize: 10, color: colors.muted },
  cardRight: { justifyContent: "center", alignItems: "flex-end", padding: 12, gap: 6 },
  priceText: { fontSize: 13, fontWeight: "600", color: colors.gold },
  statusBadge: { backgroundColor: "rgba(212, 168, 83, 0.1)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  statusCompleted: { backgroundColor: "rgba(109, 184, 123, 0.1)" },
  statusText: { fontSize: 9, fontWeight: "600", color: colors.gold },
  statusCompletedText: { color: colors.success },
});
