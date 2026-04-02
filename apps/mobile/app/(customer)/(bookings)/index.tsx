import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CalendarDays, Clock, MapPin, Scissors, Bell, Check, X } from "lucide-react-native";
import { useAuth } from "../../../lib/auth-context";
import { useMyAppointments, useMyWaitlist, useCancelAppointment, useCancelWaitlistEntry } from "../../../lib/hooks";
import { colors } from "../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";

const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export default function BookingsScreen() {
  const { session } = useAuth();
  const email = session?.user.email;
  const router = useRouter();
  const { data: appointments, isLoading, refetch } = useMyAppointments(email);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  const { data: waitlist = [] } = useMyWaitlist(email);
  const cancelAppointment = useCancelAppointment();
  const cancelWaitlistEntry = useCancelWaitlistEntry();

  const today = new Date().toISOString().split("T")[0];
  const all = (appointments || []) as unknown as Array<{
    id: string; date: string; startTime: string; endTime: string;
    status: string; cancelToken: string | null;
    shop: { name: string; slug: string; city: string | null } | null;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  }>;

  const upcoming = all.filter((a) => a.date >= today && a.status === "CONFIRMED");
  const past = all.filter((a) => a.date < today || a.status !== "CONFIRMED");

  function handleCancel(token: string) {
    Alert.alert("Annuleren", "Weet u zeker dat u deze afspraak wilt annuleren?", [
      { text: "Nee", style: "cancel" },
      { text: "Ja, annuleer", style: "destructive", onPress: () => cancelAppointment.mutate(token) },
    ]);
  }

  function handleCancelWaitlist(entryId: string) {
    if (!email) return;
    cancelWaitlistEntry.mutate({ entryId, email });
  }

  const typedWaitlist = waitlist as unknown as Array<{
    id: string; date: string; status: string;
    shop: { name: string; slug: string } | null;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  }>;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Mijn afspraken</Text>
              <Text style={styles.subtitle}>{upcoming.length} komend</Text>
            </View>

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{upcoming.length}</Text>
                <Text style={styles.statLabel}>Komend</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{all.filter((a) => a.status !== "CANCELLED").length}</Text>
                <Text style={styles.statLabel}>Bezoeken</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatPrice(all.filter((a) => a.status !== "CANCELLED").reduce((s, a) => s + (a.service?.price || 0), 0))}
                </Text>
                <Text style={styles.statLabel}>Uitgegeven</Text>
              </View>
            </View>

            {/* Waitlist */}
            {typedWaitlist.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Wachtlijst ({typedWaitlist.length})
                </Text>
                {typedWaitlist.map((entry) => (
                  <View key={entry.id} style={styles.waitlistCard}>
                    <View style={[styles.sidebar, entry.status === "NOTIFIED" ? styles.sidebarGreen : styles.sidebarGold]}>
                      <Bell size={16} color={entry.status === "NOTIFIED" ? colors.success : colors.gold} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{entry.service?.name}</Text>
                      <Text style={styles.cardSub}>{entry.shop?.name} — {entry.barber?.name}</Text>
                      <Text style={styles.cardDate}>{entry.date}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      {entry.status === "NOTIFIED" ? (
                        <TouchableOpacity
                          style={styles.bookNowBadge}
                          onPress={() => router.push(`/(customer)/(search)/shop/${entry.shop?.slug}`)}
                        >
                          <Text style={styles.bookNowText}>Boek nu</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.waitingBadge}>
                          <Text style={styles.waitingText}>Wachtend</Text>
                        </View>
                      )}
                      <TouchableOpacity onPress={() => handleCancelWaitlist(entry.id)}>
                        <X size={16} color={colors.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Upcoming */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Komende afspraken ({upcoming.length})
              </Text>
              {upcoming.length === 0 ? (
                <View style={styles.emptyCard}>
                  <CalendarDays size={28} color={colors.muted} />
                  <Text style={styles.emptyText}>Geen komende afspraken</Text>
                  <TouchableOpacity style={styles.smallGoldButton} onPress={() => router.push("/(customer)/(search)")}>
                    <Text style={styles.smallGoldButtonText}>Boek een afspraak</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                upcoming.map((apt) => (
                  <View key={apt.id} style={styles.appointmentCard}>
                    <View style={[styles.sidebar, styles.sidebarGold]}>
                      <Text style={styles.sidebarTime}>{apt.startTime}</Text>
                      <Text style={styles.sidebarDate}>
                        {new Date(apt.date).getDate()} {monthNames[new Date(apt.date).getMonth()]}
                      </Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{apt.service?.name}</Text>
                      <View style={styles.cardRow}>
                        <MapPin size={11} color={colors.muted} />
                        <Text style={styles.cardSub}>{apt.shop?.name}</Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Scissors size={11} color={colors.muted} />
                        <Text style={styles.cardSub}>{apt.barber?.name}</Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Clock size={11} color={colors.muted} />
                        <Text style={styles.cardSub}>{apt.service?.duration} min — {apt.service ? formatPrice(apt.service.price) : ""}</Text>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <View style={styles.confirmedBadge}>
                        <Text style={styles.confirmedText}>Bevestigd</Text>
                      </View>
                      {apt.cancelToken && (
                        <TouchableOpacity onPress={() => handleCancel(apt.cancelToken!)}>
                          <Text style={styles.cancelLink}>Annuleren</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Past */}
            {past.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                  Geschiedenis ({past.length})
                </Text>
                {past.slice(0, 10).map((apt) => (
                  <View key={apt.id} style={styles.pastCard}>
                    {apt.status === "CANCELLED" ? (
                      <X size={14} color={colors.destructive} />
                    ) : (
                      <Check size={14} color={colors.gold} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pastTitle}>{apt.service?.name} bij {apt.shop?.name}</Text>
                      <Text style={styles.pastDate}>{apt.date} — {apt.startTime}</Text>
                    </View>
                    {apt.status === "CANCELLED" ? (
                      <Text style={styles.cancelledBadge}>Geannuleerd</Text>
                    ) : (
                      <Text style={styles.pastPrice}>{apt.service ? formatPrice(apt.service.price) : ""}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  stats: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 12, padding: 12, alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "700", color: colors.gold },
  statLabel: { fontSize: 10, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  // Appointment cards
  appointmentCard: {
    flexDirection: "row", backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.separator, borderRadius: 14,
    overflow: "hidden", marginBottom: 10,
  },
  waitlistCard: {
    flexDirection: "row", backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.separator, borderRadius: 14,
    overflow: "hidden", marginBottom: 10,
  },
  sidebar: { width: 60, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  sidebarGold: { backgroundColor: "rgba(212, 168, 83, 0.05)", borderRightWidth: 1, borderRightColor: "rgba(212, 168, 83, 0.1)" },
  sidebarGreen: { backgroundColor: "rgba(109, 184, 123, 0.05)", borderRightWidth: 1, borderRightColor: "rgba(109, 184, 123, 0.1)" },
  sidebarTime: { fontSize: 16, fontWeight: "700", color: colors.gold, fontVariant: ["tabular-nums"] },
  sidebarDate: { fontSize: 10, color: colors.muted, marginTop: 2 },
  cardContent: { flex: 1, padding: 12, gap: 3 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  cardSub: { fontSize: 11, color: colors.muted },
  cardDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardActions: { justifyContent: "center", alignItems: "flex-end", padding: 12, gap: 8 },
  confirmedBadge: { backgroundColor: "rgba(212, 168, 83, 0.1)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  confirmedText: { fontSize: 10, fontWeight: "600", color: colors.gold },
  waitingBadge: { backgroundColor: "rgba(212, 168, 83, 0.1)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  waitingText: { fontSize: 10, fontWeight: "600", color: colors.gold },
  bookNowBadge: { backgroundColor: "rgba(109, 184, 123, 0.1)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  bookNowText: { fontSize: 10, fontWeight: "600", color: colors.success },
  cancelLink: { fontSize: 10, color: colors.muted },
  // Empty
  emptyCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 14, padding: 32, alignItems: "center", gap: 8,
  },
  emptyText: { fontSize: 14, color: colors.muted },
  smallGoldButton: { backgroundColor: colors.gold, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 },
  smallGoldButtonText: { fontSize: 12, fontWeight: "700", color: colors.background },
  // Past
  pastCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(17, 17, 19, 0.5)", borderWidth: 1, borderColor: "rgba(30, 30, 34, 0.5)",
    borderRadius: 12, padding: 14, marginBottom: 6,
  },
  pastTitle: { fontSize: 13, color: colors.foreground },
  pastDate: { fontSize: 11, color: colors.muted, marginTop: 1 },
  pastPrice: { fontSize: 12, color: colors.muted },
  cancelledBadge: { fontSize: 10, color: colors.destructive },
});
