import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Phone, Clock, Star, ChevronLeft, Grid3x3, Bookmark } from "lucide-react-native";
import { useShop } from "../../../../lib/hooks";
import { colors } from "../../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";

const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export default function ShopDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: shop, isLoading } = useShop(slug);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><ActivityIndicator size="small" color={colors.muted} /></View>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><Text style={{ color: colors.muted }}>Niet gevonden</Text></View>
      </SafeAreaView>
    );
  }

  const location = [shop.street, shop.houseNumber, shop.city].filter(Boolean).join(", ");
  const today = new Date().getDay();
  const services = (shop.services || []) as { id: string; name: string; duration: number; price: number }[];
  const barbers = (shop.barbers || []) as { id: string; name: string }[];
  const reviews = (shop.reviews || []) as { id: string; customerName: string; rating: number; comment: string | null }[];
  const businessHours = (shop.businessHours || []) as { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }[];

  function getInitials(name: string) {
    return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={28} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{shop.name}</Text>
        <Bookmark size={24} color={colors.foreground} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile header — Instagram style */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{getInitials(shop.name as string)}</Text>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{services.length}</Text>
              <Text style={styles.statLabel}>Diensten</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{barbers.length}</Text>
              <Text style={styles.statLabel}>Kappers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reviews.length}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bio}>
          <Text style={styles.bioName}>{shop.name}</Text>
          {shop.avgRating > 0 && (
            <View style={styles.ratingRow}>
              <Star size={13} color={colors.gold} fill={colors.gold} />
              <Text style={styles.ratingText}>{(shop.avgRating as number).toFixed(1)}</Text>
            </View>
          )}
          {location && <Text style={styles.bioLocation}>{location}</Text>}
        </View>

        {/* Book button — Instagram "Follow" style */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push(`/(customer)/(search)/book/${shop.id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryBtnText}>Afspraak maken</Text>
          </TouchableOpacity>
          {shop.phone && (
            <TouchableOpacity style={styles.secondaryBtn}>
              <Phone size={16} color={colors.foreground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Barbers — story circles */}
        {barbers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barbersRow}>
            {barbers.map((b) => (
              <View key={b.id} style={styles.barberItem}>
                <View style={styles.barberCircle}>
                  <Text style={styles.barberInitial}>{b.name[0]}</Text>
                </View>
                <Text style={styles.barberName} numberOfLines={1}>{b.name}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.separator} />

        {/* Services — clean list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Grid3x3 size={16} color={colors.foreground} />
            <Text style={styles.sectionTitle}>Diensten</Text>
          </View>
          {services.map((svc) => (
            <View key={svc.id} style={styles.serviceRow}>
              <View>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceMeta}>{svc.duration} min</Text>
              </View>
              <Text style={styles.servicePrice}>{formatPrice(svc.price)}</Text>
            </View>
          ))}
        </View>

        {/* Hours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color={colors.foreground} />
            <Text style={styles.sectionTitle}>Openingstijden</Text>
          </View>
          {businessHours.map((h) => (
            <View key={h.dayOfWeek} style={styles.hourRow}>
              <Text style={[styles.hourDay, h.dayOfWeek === today && { color: colors.foreground, fontWeight: "600" as const }]}>
                {dayNames[h.dayOfWeek]}
              </Text>
              <Text style={[styles.hourTime, h.closed && { color: colors.muted }]}>
                {h.closed ? "Gesloten" : `${h.openTime} – ${h.closeTime}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={16} color={colors.foreground} />
              <Text style={styles.sectionTitle}>Reviews</Text>
            </View>
            {reviews.slice(0, 5).map((r) => (
              <View key={r.id} style={styles.reviewItem}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewInitial}>{r.customerName[0]}</Text>
                  </View>
                  <Text style={styles.reviewName}>{r.customerName}</Text>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} color={colors.gold} fill={i < r.rating ? colors.gold : "transparent"} />
                    ))}
                  </View>
                </View>
                {r.comment && <Text style={styles.reviewText}>{r.comment}</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: colors.separator,
  },
  navTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, flex: 1, textAlign: "center" },
  scroll: { paddingBottom: 20 },
  // Profile header — Instagram style
  profileHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    gap: 28,
  },
  profileAvatar: {
    width: 86, height: 86, borderRadius: 43,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.gold,
    justifyContent: "center", alignItems: "center",
  },
  profileInitials: { fontSize: 28, fontWeight: "700", color: colors.gold },
  profileStats: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  // Bio
  bio: { paddingHorizontal: 20, marginBottom: 14 },
  bioName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  ratingText: { fontSize: 13, fontWeight: "600", color: colors.gold },
  bioLocation: { fontSize: 13, color: colors.muted, marginTop: 2 },
  // Actions
  actionRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  primaryBtn: {
    flex: 1, backgroundColor: colors.gold, borderRadius: 8,
    paddingVertical: 9, alignItems: "center",
  },
  primaryBtnText: { fontSize: 14, fontWeight: "700", color: colors.background },
  secondaryBtn: {
    backgroundColor: colors.surfaceRaised, borderRadius: 8,
    paddingHorizontal: 14, justifyContent: "center",
  },
  // Barbers row
  barbersRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 16 },
  barberItem: { alignItems: "center", width: 64 },
  barberCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    justifyContent: "center", alignItems: "center",
  },
  barberInitial: { fontSize: 20, fontWeight: "600", color: colors.secondary },
  barberName: { fontSize: 11, color: colors.foreground, marginTop: 4, textAlign: "center" },
  separator: { height: 0.5, backgroundColor: colors.separator, marginVertical: 4 },
  // Sections
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  // Services
  serviceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.separator,
  },
  serviceName: { fontSize: 14, color: colors.foreground },
  serviceMeta: { fontSize: 12, color: colors.muted, marginTop: 1 },
  servicePrice: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  // Hours
  hourRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8,
  },
  hourDay: { fontSize: 13, color: colors.muted },
  hourTime: { fontSize: 13, color: colors.foreground },
  // Reviews
  reviewItem: { marginBottom: 16 },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    justifyContent: "center", alignItems: "center",
  },
  reviewInitial: { fontSize: 12, fontWeight: "600", color: colors.secondary },
  reviewName: { fontSize: 13, fontWeight: "600", color: colors.foreground, flex: 1 },
  reviewStars: { flexDirection: "row", gap: 1 },
  reviewText: { fontSize: 13, color: colors.secondary, marginTop: 6, lineHeight: 18 },
});
