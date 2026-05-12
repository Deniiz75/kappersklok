import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Check, Scissors, User } from "lucide-react-native";
import { useAppointmentForReschedule, useBookedSlots, useRescheduleAppointment } from "../../../../lib/hooks";
import { supabase } from "../../../../lib/supabase";
import { colors } from "../../../../lib/theme";
import { generateTimeSlots, addMinutes, timeToMinutes } from "@kappersklok/shared";

const shortDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export default function RescheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: aptRaw, isLoading } = useAppointmentForReschedule(id);
  const reschedule = useRescheduleAppointment();

  // Type-narrow the appointment payload
  const apt = aptRaw as
    | (null | undefined)
    | {
        id: string; date: string; startTime: string; endTime: string;
        shopId: string; barberId: string; serviceId: string; status: string;
        shop?: { name: string; slug: string } | null;
        barber?: { name: string } | null;
        service?: { name: string; duration: number; price: number } | null;
      };

  const [businessHours, setBusinessHours] = useState<
    { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }[]
  >([]);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!apt?.shopId) return;
    let cancelled = false;
    supabase
      .from("BusinessHours")
      .select("dayOfWeek, openTime, closeTime, closed")
      .eq("shopId", apt.shopId)
      .order("dayOfWeek")
      .then(({ data }) => {
        if (!cancelled) {
          setBusinessHours(data || []);
          setHoursLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [apt?.shopId]);

  const { data: bookedSlots = [] } = useBookedSlots(apt?.barberId || "", date);

  if (isLoading || hoursLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      </SafeAreaView>
    );
  }

  if (!apt || apt.status !== "CONFIRMED") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <ChevronLeft size={20} color={colors.gold} />
            <Text style={styles.backText}>Terug</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Afspraak niet gevonden of niet meer wijzigbaar.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Generate next 14 days based on businessHours
  const dates: { value: string; label: string; dayOfWeek: number }[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const h = businessHours.find((bh) => bh.dayOfWeek === dow);
    if (h && !h.closed) {
      dates.push({
        value: d.toISOString().split("T")[0],
        label: `${shortDays[dow]} ${d.getDate()}/${d.getMonth() + 1}`,
        dayOfWeek: dow,
      });
    }
  }

  const selectedDate = dates.find((d) => d.value === date);
  const hours = selectedDate ? businessHours.find((h) => h.dayOfWeek === selectedDate.dayOfWeek) : null;
  const duration = apt.service?.duration || 30;
  const allSlots = hours ? generateTimeSlots(hours.openTime, hours.closeTime, duration) : [];

  // Exclude the current appointment's slot from the "booked" list so the user
  // can keep their original time, and naastliggende slots niet ten onrechte als bezet tonen.
  const otherBookedSlots = date === apt.date
    ? bookedSlots.filter((b) => !(b.startTime === apt.startTime && b.endTime === apt.endTime))
    : bookedSlots;

  const availableSlots = allSlots.filter((slotStart) => {
    const slotStartMin = timeToMinutes(slotStart);
    const slotEndMin = slotStartMin + duration;
    return !otherBookedSlots.some(
      (b) => slotStartMin < timeToMinutes(b.endTime) && slotEndMin > timeToMinutes(b.startTime),
    );
  });

  async function handleSave() {
    if (!apt || !date || !time) return;
    const result = await reschedule.mutateAsync({
      appointmentId: apt.id,
      date,
      startTime: time,
      endTime: addMinutes(time, duration),
    });
    if (result.success) {
      Alert.alert("Verplaatst", "Uw afspraak is verplaatst.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Fout", result.error || "Er ging iets mis.");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={20} color={colors.gold} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Herplannen</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bij: </Text>{apt.shop?.name}
          </Text>
          <View style={styles.summaryLine}>
            <Scissors size={11} color={colors.muted} />
            <Text style={styles.summaryRow}>{apt.service?.name} ({duration} min)</Text>
          </View>
          <View style={styles.summaryLine}>
            <User size={11} color={colors.muted} />
            <Text style={styles.summaryRow}>{apt.barber?.name}</Text>
          </View>
          <Text style={[styles.summaryRow, { marginTop: 6 }]}>
            <Text style={styles.summaryLabel}>Huidig: </Text>
            {apt.date} om {apt.startTime}
          </Text>
        </View>

        <Text style={styles.label}>Nieuwe datum</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          <View style={styles.dateRow}>
            {dates.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[styles.dateChip, date === d.value && styles.dateChipActive]}
                onPress={() => { setDate(d.value); setTime(""); }}
              >
                <Text style={[styles.dateChipText, date === d.value && styles.dateChipTextActive]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {date && (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>Nieuwe tijd</Text>
            {availableSlots.length === 0 ? (
              <Text style={styles.emptySlots}>Geen tijden beschikbaar op deze dag.</Text>
            ) : (
              <View style={styles.timeGrid}>
                {availableSlots.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeChip, time === t && styles.timeChipActive]}
                    onPress={() => setTime(t)}
                  >
                    <Text style={[styles.timeChipText, time === t && styles.timeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {date && time && (
          <TouchableOpacity
            style={[styles.goldButton, reschedule.isPending && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={reschedule.isPending}
          >
            <Check size={16} color={colors.background} />
            <Text style={styles.goldButtonText}>
              {reschedule.isPending ? "Verplaatsen..." : "Bevestig nieuwe tijd"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.helper}>
          Herplannen kan tot 2 uur voor de afspraak.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  notFoundText: { fontSize: 14, color: colors.muted, textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8 },
  back: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 8 },
  backText: { fontSize: 14, color: colors.gold, fontWeight: "500" },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, marginLeft: 8 },
  content: { padding: 20, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: "rgba(212, 168, 83, 0.05)",
    borderWidth: 1, borderColor: "rgba(212, 168, 83, 0.2)",
    borderRadius: 12, padding: 14, marginBottom: 20, gap: 4,
  },
  summaryRow: { fontSize: 13, color: colors.foreground },
  summaryLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryLabel: { color: colors.muted },
  label: { fontSize: 12, color: colors.muted, marginBottom: 8 },
  dateScroll: { marginBottom: 4 },
  dateRow: { flexDirection: "row", gap: 8 },
  dateChip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  dateChipActive: { borderColor: colors.gold, backgroundColor: "rgba(212, 168, 83, 0.1)" },
  dateChipText: { fontSize: 13, color: colors.mutedForeground },
  dateChipTextActive: { color: colors.gold, fontWeight: "600" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeChip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  timeChipActive: { borderColor: colors.gold, backgroundColor: "rgba(212, 168, 83, 0.1)" },
  timeChipText: { fontSize: 13, fontFamily: "monospace", color: colors.mutedForeground },
  timeChipTextActive: { color: colors.gold, fontWeight: "600" },
  emptySlots: { fontSize: 12, color: colors.muted, fontStyle: "italic", marginTop: 4 },
  goldButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, marginTop: 20,
  },
  goldButtonText: { fontSize: 15, fontWeight: "700", color: colors.background },
  helper: { fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 12 },
});
