import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Scissors, User, CalendarDays, Clock, Bell, Check } from "lucide-react-native";
import { useBookedSlots, useCreateAppointment, useJoinWaitlist } from "../../../../lib/hooks";
import { supabase } from "../../../../lib/supabase";
import { colors } from "../../../../lib/theme";
import { formatPrice, generateTimeSlots, addMinutes, timeToMinutes } from "@kappersklok/shared";

const shortDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export default function BookScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const router = useRouter();
  // Shop data loaded via useEffect below (we need by ID, not slug)
  const createAppointment = useCreateAppointment();
  const joinWaitlist = useJoinWaitlist();

  // We fetch shop data via supabase directly since useShop takes slug
  const [shopData, setShopData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1); // 1=service, 2=barber, 3=datetime, 4=details
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [waitlistMode, setWaitlistMode] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Fetch shop by ID
  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: barbers }, { data: services }, { data: hours }] = await Promise.all([
        supabase.from("Shop").select("*").eq("id", shopId).single(),
        supabase.from("Barber").select("id, name").eq("shopId", shopId).eq("active", true),
        supabase.from("Service").select("id, name, duration, price").eq("shopId", shopId).eq("active", true).order("sortOrder"),
        supabase.from("BusinessHours").select("dayOfWeek, openTime, closeTime, closed").eq("shopId", shopId).order("dayOfWeek"),
      ]);
      if (s) setShopData({ ...s, barbers: barbers || [], services: services || [], businessHours: hours || [] });
      setLoading(false);
    }
    load();
  }, [shopId]);

  // Booked slots
  const { data: bookedSlots = [] } = useBookedSlots(barberId, date);

  if (loading || !shopData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      </SafeAreaView>
    );
  }

  const services = (shopData.services || []) as { id: string; name: string; duration: number; price: number }[];
  const barbers = (shopData.barbers || []) as { id: string; name: string }[];
  const businessHours = (shopData.businessHours || []) as { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }[];
  const selectedService = services.find((s) => s.id === serviceId);

  // Generate dates (next 14 days)
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

  // Available slots
  const selectedDate = dates.find((d) => d.value === date);
  const hours = selectedDate ? businessHours.find((h) => h.dayOfWeek === selectedDate.dayOfWeek) : null;
  const allSlots = hours && selectedService ? generateTimeSlots(hours.openTime, hours.closeTime, selectedService.duration) : [];
  const availableSlots = selectedService
    ? allSlots.filter((slotStart) => {
        const slotStartMin = timeToMinutes(slotStart);
        const slotEndMin = slotStartMin + selectedService.duration;
        return !bookedSlots.some((b) => slotStartMin < timeToMinutes(b.endTime) && slotEndMin > timeToMinutes(b.startTime));
      })
    : [];
  const isDayFull = !!date && availableSlots.length === 0 && allSlots.length > 0;

  async function handleBook() {
    if (!selectedService) return;
    const result = await createAppointment.mutateAsync({
      shopId,
      barberId,
      serviceId,
      date,
      startTime: time,
      endTime: addMinutes(time, selectedService.duration),
      customerName: name,
      customerEmail: email,
      customerPhone: phone || undefined,
    });
    if (result.success && "appointmentId" in result) {
      router.replace(`/(customer)/(search)/confirmation/${result.appointmentId}`);
    } else if (!result.success) {
      Alert.alert("Fout", result.error);
    }
  }

  async function handleWaitlist() {
    const result = await joinWaitlist.mutateAsync({
      shopId, barberId, serviceId, date,
      customerName: name, customerEmail: email, customerPhone: phone || undefined,
    });
    if (result.success) {
      setWaitlistSuccess(true);
    } else {
      Alert.alert("Fout", result.error);
    }
  }

  const stepLabels = ["Dienst", "Kapper", "Datum", "Gegevens"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(step - 1)} style={styles.back}>
          <ChevronLeft size={20} color={colors.gold} />
          <Text style={styles.backText}>{step === 1 ? "Terug" : stepLabels[step - 2]}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shopData.name as string}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {stepLabels.map((label, i) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.dot, step > i + 1 && styles.dotDone, step === i + 1 && styles.dotActive]}>
              {step > i + 1 ? <Check size={10} color={colors.background} /> : <Text style={[styles.dotText, step === i + 1 && styles.dotTextActive]}>{i + 1}</Text>}
            </View>
            <Text style={[styles.progressLabel, step === i + 1 && styles.progressLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: Service */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Kies een dienst</Text>
            {services.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={styles.optionCard}
                onPress={() => { setServiceId(svc.id); setStep(2); }}
              >
                <View>
                  <Text style={styles.optionName}>{svc.name}</Text>
                  <Text style={styles.optionSub}>{svc.duration} min</Text>
                </View>
                <Text style={styles.optionPrice}>{formatPrice(svc.price)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Barber */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Kies een kapper</Text>
            <View style={styles.barberGrid}>
              {barbers.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.barberCard}
                  onPress={() => { setBarberId(b.id); setStep(3); }}
                >
                  <View style={styles.barberAvatar}>
                    <Text style={styles.barberInitial}>{b.name[0]}</Text>
                  </View>
                  <Text style={styles.barberName}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Kies datum & tijd</Text>

            <Text style={styles.label}>Datum</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              <View style={styles.dateRow}>
                {dates.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.dateChip, date === d.value && styles.dateChipActive]}
                    onPress={() => { setDate(d.value); setTime(""); setWaitlistMode(false); setWaitlistSuccess(false); }}
                  >
                    <Text style={[styles.dateChipText, date === d.value && styles.dateChipTextActive]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {date && !isDayFull && (
              <>
                <Text style={[styles.label, { marginTop: 16 }]}>Tijd</Text>
                <View style={styles.timeGrid}>
                  {availableSlots.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timeChip, time === t && styles.timeChipActive]}
                      onPress={() => { setTime(t); setStep(4); }}
                    >
                      <Text style={[styles.timeChipText, time === t && styles.timeChipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Waitlist UI */}
            {isDayFull && !waitlistSuccess && (
              <View style={styles.waitlistCard}>
                <View style={styles.waitlistHeader}>
                  <Bell size={16} color={colors.gold} />
                  <Text style={styles.waitlistTitle}>{barbers.find((b) => b.id === barberId)?.name} zit vol</Text>
                </View>
                <Text style={styles.waitlistSub}>Laat uw gegevens achter voor de wachtlijst.</Text>
                <TextInput style={styles.input} placeholder="Naam *" placeholderTextColor={colors.muted} value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="E-mail *" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Telefoon (optioneel)" placeholderTextColor={colors.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <TouchableOpacity style={styles.goldButton} onPress={handleWaitlist} disabled={joinWaitlist.isPending}>
                  <Bell size={16} color={colors.background} />
                  <Text style={styles.goldButtonText}>{joinWaitlist.isPending ? "Aanmelden..." : "Zet me op de wachtlijst"}</Text>
                </TouchableOpacity>
              </View>
            )}

            {isDayFull && waitlistSuccess && (
              <View style={styles.successCard}>
                <Check size={24} color={colors.gold} />
                <Text style={styles.successTitle}>U staat op de wachtlijst!</Text>
                <Text style={styles.successSub}>Wij sturen een e-mail zodra er een plek vrijkomt.</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Uw gegevens</Text>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Dienst: </Text>{selectedService?.name} ({selectedService?.duration} min)</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Kapper: </Text>{barbers.find((b) => b.id === barberId)?.name}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Datum: </Text>{date} om {time}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Prijs: </Text>{selectedService ? formatPrice(selectedService.price) : ""}</Text>
            </View>

            <TextInput style={styles.input} placeholder="Naam *" placeholderTextColor={colors.muted} value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="E-mail *" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Telefoon (optioneel)" placeholderTextColor={colors.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <TouchableOpacity
              style={[styles.goldButton, createAppointment.isPending && { opacity: 0.6 }]}
              onPress={handleBook}
              disabled={createAppointment.isPending || !name || !email}
            >
              <Text style={styles.goldButtonText}>
                {createAppointment.isPending ? "Boeken..." : "Bevestig afspraak"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8 },
  back: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 8 },
  backText: { fontSize: 14, color: colors.gold, fontWeight: "500" },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, marginLeft: 8 },
  progress: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 16 },
  progressItem: { alignItems: "center", gap: 4 },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surfaceRaised, justifyContent: "center", alignItems: "center" },
  dotDone: { backgroundColor: colors.gold },
  dotActive: { backgroundColor: "rgba(212, 168, 83, 0.2)" },
  dotText: { fontSize: 10, fontWeight: "700", color: colors.muted },
  dotTextActive: { color: colors.gold },
  progressLabel: { fontSize: 10, color: colors.muted },
  progressLabelActive: { color: colors.gold, fontWeight: "600" },
  content: { padding: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 16 },
  label: { fontSize: 12, color: colors.muted, marginBottom: 8 },
  // Service cards
  optionCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 14, padding: 16, marginBottom: 10,
  },
  optionName: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  optionSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  optionPrice: { fontSize: 15, fontWeight: "700", color: colors.gold },
  // Barber grid
  barberGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  barberCard: {
    width: "47%" as unknown as number, alignItems: "center", gap: 8,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 14, padding: 20,
  },
  barberAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    justifyContent: "center", alignItems: "center",
  },
  barberInitial: { fontSize: 18, fontWeight: "700", color: colors.gold },
  barberName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  // Date & time
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
  // Waitlist
  waitlistCard: {
    marginTop: 16, backgroundColor: "rgba(212, 168, 83, 0.05)",
    borderWidth: 1, borderColor: "rgba(212, 168, 83, 0.2)",
    borderRadius: 14, padding: 16, gap: 10,
  },
  waitlistHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  waitlistTitle: { fontSize: 15, fontWeight: "600", color: colors.gold },
  waitlistSub: { fontSize: 12, color: colors.muted },
  successCard: {
    marginTop: 16, alignItems: "center", padding: 24,
    backgroundColor: "rgba(212, 168, 83, 0.05)",
    borderWidth: 1, borderColor: "rgba(212, 168, 83, 0.2)",
    borderRadius: 14, gap: 8,
  },
  successTitle: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  successSub: { fontSize: 12, color: colors.muted, textAlign: "center" },
  // Summary
  summaryCard: {
    backgroundColor: "rgba(212, 168, 83, 0.05)",
    borderWidth: 1, borderColor: "rgba(212, 168, 83, 0.2)",
    borderRadius: 12, padding: 14, marginBottom: 16, gap: 4,
  },
  summaryRow: { fontSize: 13, color: colors.foreground },
  summaryLabel: { color: colors.muted },
  // Form
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 12, padding: 14, fontSize: 15, color: colors.foreground, marginBottom: 10,
  },
  goldButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, marginTop: 4,
  },
  goldButtonText: { fontSize: 15, fontWeight: "700", color: colors.background },
});
