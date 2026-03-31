import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Phone, Clock, Star, Scissors, ChevronLeft, CalendarDays } from "lucide-react-native";
import { useShop } from "../../../../lib/hooks";
import { colors } from "../../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";

const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

export default function ShopDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: shop, isLoading } = useShop(slug);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={{ color: colors.muted }}>Kapper niet gevonden</Text>
        </View>
      </SafeAreaView>
    );
  }

  const address = [shop.street, shop.houseNumber].filter(Boolean).join(" ");
  const location = [address, shop.postalCode, shop.city].filter(Boolean).join(", ");
  const today = new Date().getDay();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Back + header */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.gold} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        {/* Shop identity */}
        <View style={styles.identity}>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>
              {shop.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.shopName}>{shop.name}</Text>
          {shop.avgRating > 0 && (
            <View style={styles.ratingRow}>
              <Star size={14} color={colors.gold} fill={colors.gold} />
              <Text style={styles.ratingText}>{shop.avgRating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({shop.reviews.length} reviews)</Text>
            </View>
          )}
          {location && (
            <View style={styles.locationRow}>
              <MapPin size={13} color={colors.muted} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          )}
          {shop.phone && (
            <View style={styles.locationRow}>
              <Phone size={13} color={colors.muted} />
              <Text style={styles.locationText}>{shop.phone}</Text>
            </View>
          )}
        </View>

        {/* Book button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/(customer)/(search)/book/${shop.id}`)}
        >
          <CalendarDays size={18} color={colors.background} />
          <Text style={styles.bookButtonText}>Afspraak maken</Text>
        </TouchableOpacity>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Scissors size={14} color={colors.gold} /> Diensten
          </Text>
          {shop.services.map((svc: { id: string; name: string; duration: number; price: number }) => (
            <View key={svc.id} style={styles.serviceRow}>
              <View>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceDuration}>{svc.duration} min</Text>
              </View>
              <Text style={styles.servicePrice}>{formatPrice(svc.price)}</Text>
            </View>
          ))}
        </View>

        {/* Business hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Clock size={14} color={colors.gold} /> Openingstijden
          </Text>
          {shop.businessHours.map((h: { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }) => (
            <View key={h.dayOfWeek} style={[styles.hourRow, h.dayOfWeek === today && styles.hourRowToday]}>
              <Text style={[styles.hourDay, h.dayOfWeek === today && styles.hourDayToday]}>
                {dayNames[h.dayOfWeek]}
              </Text>
              <Text style={[styles.hourTime, h.closed && styles.hourClosed]}>
                {h.closed ? "Gesloten" : `${h.openTime} - ${h.closeTime}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Reviews */}
        {shop.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Star size={14} color={colors.gold} /> Reviews
            </Text>
            {shop.reviews.slice(0, 5).map((r: { id: string; customerName: string; rating: number; comment: string | null }) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{r.customerName}</Text>
                  <View style={styles.stars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} color={colors.gold} fill={i < r.rating ? colors.gold : "transparent"} />
                    ))}
                  </View>
                </View>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 32 },
  back: { flexDirection: "row", alignItems: "center", gap: 4, padding: 16, paddingBottom: 8 },
  backText: { fontSize: 14, color: colors.gold, fontWeight: "500" },
  identity: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 20 },
  monogram: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  monogramText: { fontSize: 24, fontWeight: "700", color: colors.gold },
  shopName: { fontSize: 24, fontWeight: "700", color: colors.foreground, textAlign: "center" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  ratingText: { fontSize: 14, fontWeight: "600", color: colors.gold },
  reviewCount: { fontSize: 12, color: colors.muted },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  locationText: { fontSize: 13, color: colors.muted },
  bookButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.gold, borderRadius: 14, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 24,
  },
  bookButtonText: { fontSize: 16, fontWeight: "700", color: colors.background },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 },
  serviceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  serviceName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  serviceDuration: { fontSize: 12, color: colors.muted, marginTop: 2 },
  servicePrice: { fontSize: 14, fontWeight: "700", color: colors.gold },
  hourRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  hourRowToday: { backgroundColor: "rgba(212, 168, 83, 0.05)", marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 8 },
  hourDay: { fontSize: 13, color: colors.muted },
  hourDayToday: { color: colors.gold, fontWeight: "600" },
  hourTime: { fontSize: 13, color: colors.foreground, fontWeight: "500" },
  hourClosed: { color: colors.muted },
  reviewCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewName: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  stars: { flexDirection: "row", gap: 2 },
  reviewComment: { fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 18 },
});
