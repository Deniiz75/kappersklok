import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Heart, MapPin, ChevronRight } from "lucide-react-native";
import { useAuth } from "../../../lib/auth-context";
import { useMyFavorites, useToggleFavorite } from "../../../lib/hooks";
import { colors } from "../../../lib/theme";

export default function FavoritesScreen() {
  const { session } = useAuth();
  const email = session?.user.email;
  const router = useRouter();
  const { data: favorites, isLoading } = useMyFavorites(email);
  const toggleFavorite = useToggleFavorite();

  const typedFavorites = (favorites || []) as unknown as Array<{
    id: string; shopId: string;
    shop: { name: string; slug: string; city: string | null } | null;
  }>;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorieten</Text>
        <Text style={styles.subtitle}>{typedFavorites.length} kappers</Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : typedFavorites.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={40} color={colors.muted} />
          <Text style={styles.emptyTitle}>Nog geen favorieten</Text>
          <Text style={styles.emptySub}>Markeer kappers als favoriet om ze hier te zien.</Text>
          <TouchableOpacity style={styles.goldButton} onPress={() => router.push("/(customer)/(search)")}>
            <Text style={styles.goldButtonText}>Kapper zoeken</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={typedFavorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item: fav }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(customer)/(search)/shop/${fav.shop?.slug}`)}
              activeOpacity={0.7}
            >
              <View style={styles.monogram}>
                <Text style={styles.monogramText}>
                  {fav.shop?.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.shopName}>{fav.shop?.name}</Text>
                {fav.shop?.city && (
                  <View style={styles.infoRow}>
                    <MapPin size={11} color={colors.muted} />
                    <Text style={styles.infoText}>{fav.shop.city}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => email && toggleFavorite.mutate({ email, shopId: fav.shopId })}
                hitSlop={12}
              >
                <Heart size={18} color={colors.gold} fill={colors.gold} />
              </TouchableOpacity>
              <ChevronRight size={16} color={colors.muted} />
            </TouchableOpacity>
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
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.foreground },
  emptySub: { fontSize: 13, color: colors.muted, textAlign: "center" },
  goldButton: { backgroundColor: colors.gold, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 12 },
  goldButtonText: { fontSize: 13, fontWeight: "700", color: colors.background },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 14, padding: 14,
  },
  monogram: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    justifyContent: "center", alignItems: "center",
  },
  monogramText: { fontSize: 14, fontWeight: "700", color: colors.gold },
  cardContent: { flex: 1 },
  shopName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  infoText: { fontSize: 11, color: colors.muted },
});
