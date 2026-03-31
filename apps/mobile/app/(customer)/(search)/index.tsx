import { useState, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, MapPin, Users, ChevronRight } from "lucide-react-native";
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

  const filtered = query
    ? (shops || []).filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.city?.toLowerCase().includes(query.toLowerCase()),
      )
    : shops || [];

  const cities = [...new Set((shops || []).map((s: Record<string, unknown>) => s.city as string).filter(Boolean))].sort();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kapper zoeken</Text>
        <Text style={styles.subtitle}>
          {isLoading ? "Laden..." : `${filtered.length} kappers`}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Zoek op naam of stad..."
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* City chips */}
      {!query && cities.length > 0 && (
        <View style={styles.chips}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={cities}
            keyExtractor={(c) => c}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item: city }) => (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setQuery(city)}
              >
                <Text style={styles.chipText}>{city}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Shop list */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          renderItem={({ item: shop }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(customer)/(search)/shop/${shop.slug}`)}
              activeOpacity={0.7}
            >
              {/* Monogram */}
              <View style={styles.monogram}>
                <Text style={styles.monogramText}>
                  {shop.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.shopName}>{shop.name}</Text>
                {shop.city && (
                  <View style={styles.infoRow}>
                    <MapPin size={12} color={colors.muted} />
                    <Text style={styles.infoText}>{shop.city}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Users size={12} color={colors.muted} />
                  <Text style={styles.infoText}>{shop.barbers?.length || 0} kappers</Text>
                </View>
              </View>

              <ChevronRight size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query ? `Geen kappers gevonden voor "${query}"` : "Geen kappers beschikbaar"}
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, marginVertical: 8,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.foreground },
  chips: { marginBottom: 4 },
  chip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  chipText: { fontSize: 12, color: colors.mutedForeground, fontWeight: "500" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16,
  },
  monogram: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    justifyContent: "center", alignItems: "center",
  },
  monogramText: { fontSize: 16, fontWeight: "700", color: colors.gold },
  cardContent: { flex: 1 },
  shopName: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  infoText: { fontSize: 12, color: colors.muted },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: "center" },
});
