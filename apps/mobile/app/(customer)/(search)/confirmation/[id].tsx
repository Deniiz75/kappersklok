import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, CalendarDays, Clock, Scissors, MapPin } from "lucide-react-native";
import { supabase } from "../../../../lib/supabase";
import { colors } from "../../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    supabase
      .from("Appointment")
      .select("id, date, startTime, endTime, shop:Shop(name, city), barber:Barber(name), service:Service(name, duration, price)")
      .eq("id", id)
      .single()
      .then(({ data }) => setAppointment(data));
  }, [id]);

  const shop = appointment?.shop as { name: string; city: string | null } | null;
  const barber = appointment?.barber as { name: string } | null;
  const service = appointment?.service as { name: string; duration: number; price: number } | null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Success icon */}
        <View style={styles.checkCircle}>
          <Check size={32} color={colors.gold} />
        </View>

        <Text style={styles.title}>Afspraak geboekt!</Text>
        <Text style={styles.subtitle}>Uw afspraak is bevestigd.</Text>

        {/* Details card */}
        {appointment && (
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Scissors size={14} color={colors.gold} />
              <Text style={styles.detailText}>{service?.name} — {service?.duration} min</Text>
              <Text style={styles.priceText}>{service ? formatPrice(service.price) : ""}</Text>
            </View>
            <View style={styles.detailRow}>
              <CalendarDays size={14} color={colors.gold} />
              <Text style={styles.detailText}>{appointment.date as string}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={14} color={colors.gold} />
              <Text style={styles.detailText}>{appointment.startTime as string} - {appointment.endTime as string}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color={colors.gold} />
              <Text style={styles.detailText}>{shop?.name}{shop?.city ? `, ${shop.city}` : ""}</Text>
            </View>
          </View>
        )}

        <Text style={styles.hint}>
          Een bevestiging is naar uw e-mailadres verzonden.
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.goldButton} onPress={() => router.replace("/(customer)/(bookings)")}>
            <Text style={styles.goldButtonText}>Mijn afspraken</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace("/(customer)/(search)")}>
            <Text style={styles.outlineButtonText}>Terug naar zoeken</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    borderWidth: 2, borderColor: "rgba(212, 168, 83, 0.3)",
    justifyContent: "center", alignItems: "center", marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
  card: {
    width: "100%", marginTop: 28,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 20, gap: 14,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { flex: 1, fontSize: 14, color: colors.foreground },
  priceText: { fontSize: 14, fontWeight: "700", color: colors.gold },
  hint: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 20 },
  buttons: { width: "100%", marginTop: 28, gap: 12 },
  goldButton: {
    backgroundColor: colors.gold, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  goldButtonText: { fontSize: 15, fontWeight: "700", color: colors.background },
  outlineButton: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  outlineButtonText: { fontSize: 14, color: colors.muted, fontWeight: "500" },
});
