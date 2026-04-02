import { useState, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, MapPin, Star } from "lucide-react-native";
import { useShops } from "../../../lib/hooks";
import { colors } from "../../../lib/theme";

export default function SearchScreen() {
  const router = useRouter();
  const { data: shops, isLoading, refetch } = useShops();
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const allShops = (shops || []) as Array<{
    id: string; name: string; slug: string; city: string | null;
    barbers: { id: string; name: string }[];
  }>;

  const filtered = query
    ? allShops.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.city?.toLowerCase().includes(query.toLowerCase()))
    : allShops;

  function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ontdekken</Text>
      </View>

      {/* Search bar — Instagram-style */}
      <View style={styles.searchWrap}>
        <Search size={16} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Zoeken"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.muted} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} />}
          ListHeaderComponent={
            !query && allShops.length > 0 ? (
              <>
                {/* Stories-row: featured barbers */}
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={allShops.slice(0, 10)}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.storiesRow}
                  renderItem={({ item: shop }) => (
                    <TouchableOpacity
                      style={styles.storyItem}
                      onPress={() => router.push(`/(customer)/(search)/shop/${shop.slug}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.storyRing}>
                        <View style={styles.storyAvatar}>
                          <Text style={styles.storyInitials}>{getInitials(shop.name)}</Text>
                        </View>
                      </View>
                      <Text style={styles.storyName} numberOfLines={1}>{shop.name.split(" ")[0]}</Text>
                    </TouchableOpacity>
                  )}
                />
                <View style={styles.separator} />
              </>
            ) : null
          }
          renderItem={({ item: shop }) => (
            <TouchableOpacity
              style={styles.shopCard}
              onPress={() => router.push(`/(customer)/(search)/shop/${shop.slug}`)}
              activeOpacity={0.8}
            >
              {/* Shop header — Instagram post style */}
              <View style={styles.shopHeader}>
                <View style={styles.shopAvatar}>
                  <Text style={styles.shopInitials}>{getInitials(shop.name)}</Text>
                </View>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  {shop.city && (
                    <Text style={styles.shopLocation}>{shop.city}</Text>
                  )}
                </View>
              </View>

              {/* Shop "image" area — gradient placeholder */}
              <View style={styles.shopBanner}>
                <Text style={styles.bannerInitials}>{getInitials(shop.name)}</Text>
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerText}>{shop.barbers?.length || 0} kappers beschikbaar</Text>
                </View>
              </View>

              {/* Actions row */}
              <View style={styles.shopActions}>
                <View style={styles.shopActionLeft}>
                  <Star size={20} color={colors.foreground} />
                  <MapPin size={20} color={colors.foreground} />
                </View>
                <TouchableOpacity style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Boek nu</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query ? `Geen resultaten voor "${query}"` : "Geen kappers beschikbaar"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 10, paddingHorizontal: 12, height: 36,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  // Stories row
  storiesRow: { paddingHorizontal: 12, paddingVertical: 12, gap: 16 },
  storyItem: { alignItems: "center", width: 68 },
  storyRing: {
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 2, borderColor: colors.gold,
    justifyContent: "center", alignItems: "center",
    padding: 2,
  },
  storyAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center",
  },
  storyInitials: { fontSize: 18, fontWeight: "700", color: colors.gold },
  storyName: { fontSize: 11, color: colors.foreground, marginTop: 4, textAlign: "center" },
  separator: { height: 0.5, backgroundColor: colors.separator },
  // Shop cards — Instagram post style
  shopCard: { marginBottom: 8 },
  shopHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  shopAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    justifyContent: "center", alignItems: "center",
  },
  shopInitials: { fontSize: 12, fontWeight: "700", color: colors.gold },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  shopLocation: { fontSize: 11, color: colors.muted },
  shopBanner: {
    height: 200, backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  bannerInitials: { fontSize: 56, fontWeight: "800", color: colors.surfaceRaised, opacity: 0.5 },
  bannerOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bannerText: { fontSize: 13, color: colors.foreground, fontWeight: "500" },
  shopActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
  },
  shopActionLeft: { flexDirection: "row", gap: 16 },
  bookBtn: {
    backgroundColor: colors.gold, borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 7,
  },
  bookBtnText: { fontSize: 13, fontWeight: "700", color: colors.background },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: colors.muted },
});
