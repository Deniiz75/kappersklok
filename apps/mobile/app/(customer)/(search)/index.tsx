import { useState, useCallback } from "react";
import { FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, MapPin, Star, ChevronRight } from "lucide-react-native";
import { YStack, XStack, Text, Input, Card, Button, Avatar, Separator, Spinner, ScrollView } from "tamagui";
import { useShops } from "../../../lib/hooks";

export default function SearchScreen() {
  const router = useRouter();
  const { data: shops, isLoading, refetch } = useShops();
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => { setRefreshing(true); await refetch(); setRefreshing(false); }, [refetch]);

  const allShops = (shops || []) as Array<{
    id: string; name: string; slug: string; city: string | null;
    barbers: { id: string; name: string }[];
  }>;

  const filtered = query
    ? allShops.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.city?.toLowerCase().includes(query.toLowerCase()))
    : allShops;

  function initials(name: string) { return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(); }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      {/* Header */}
      <XStack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$2">
        <Text fontSize={24} fontWeight="700" color="$color">Ontdekken</Text>
      </XStack>

      {/* Search */}
      <XStack marginBottom="$3" alignItems="center" gap="$2" backgroundColor="$backgroundHover" borderRadius="$3" marginHorizontal="$4" paddingHorizontal="$3" height={38}>
        <Search size={16} color="#8e8e93" />
        <Input
          flex={1}
          placeholder="Zoeken"
          value={query}
          onChangeText={setQuery}
          backgroundColor="transparent"
          borderWidth={0}
          color="$color"
          placeholderTextColor="$placeholderColor"
          fontSize={14}
          padding={0}
          height={38}
        />
      </XStack>

      {isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner color="$placeholderColor" />
        </YStack>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8e8e93" />}
          ListHeaderComponent={
            !query && allShops.length > 0 ? (
              <>
                {/* Stories row */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 16 }}>
                  {allShops.slice(0, 10).map((shop) => (
                    <YStack key={shop.id} alignItems="center" width={70} gap="$1"
                      onPress={() => router.push(`/(customer)/(search)/shop/${shop.slug}`)}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <XStack width={68} height={68} borderRadius={34} borderWidth={2} borderColor="#d4a853" justifyContent="center" alignItems="center" padding={2}>
                        <Avatar circular size={58} backgroundColor="$backgroundHover">
                          <Text fontSize={18} fontWeight="700" color="#d4a853">{initials(shop.name)}</Text>
                        </Avatar>
                      </XStack>
                      <Text fontSize={11} color="$color" numberOfLines={1}>{shop.name.split(" ")[0]}</Text>
                    </YStack>
                  ))}
                </ScrollView>
                <Separator borderColor="$borderColor" />
              </>
            ) : null
          }
          renderItem={({ item: shop }) => (
            <YStack>
              {/* Post header */}
              <XStack alignItems="center" gap="$2.5" paddingHorizontal="$3.5" paddingVertical="$2.5"
                onPress={() => router.push(`/(customer)/(search)/shop/${shop.slug}`)}
                pressStyle={{ opacity: 0.7 }}
              >
                <Avatar circular size={34} backgroundColor="$backgroundHover" borderWidth={0.5} borderColor="$borderColor">
                  <Text fontSize={12} fontWeight="700" color="#d4a853">{initials(shop.name)}</Text>
                </Avatar>
                <YStack flex={1}>
                  <Text fontSize={13} fontWeight="600" color="$color">{shop.name}</Text>
                  {shop.city && <Text fontSize={11} color="$placeholderColor">{shop.city}</Text>}
                </YStack>
                <ChevronRight size={16} color="#8e8e93" />
              </XStack>

              {/* Banner */}
              <YStack height={200} backgroundColor="$backgroundHover" justifyContent="center" alignItems="center"
                onPress={() => router.push(`/(customer)/(search)/shop/${shop.slug}`)}
                pressStyle={{ opacity: 0.9 }}
              >
                <Text fontSize={56} fontWeight="800" color="$backgroundPress" opacity={0.5}>{initials(shop.name)}</Text>
                <XStack position="absolute" bottom={0} left={0} right={0} backgroundColor="rgba(0,0,0,0.5)" paddingHorizontal="$3.5" paddingVertical="$2.5">
                  <Text fontSize={13} color="$color" fontWeight="500">{shop.barbers?.length || 0} kappers beschikbaar</Text>
                </XStack>
              </YStack>

              {/* Actions */}
              <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$3.5" paddingVertical="$2.5">
                <XStack gap="$4">
                  <Star size={22} color="#fff" />
                  <MapPin size={22} color="#fff" />
                </XStack>
                <Button
                  backgroundColor="#d4a853"
                  borderRadius="$2" height={32} paddingHorizontal="$4"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={() => router.push(`/(customer)/(search)/shop/${shop.slug}`)}
                >
                  <Text fontWeight="700" fontSize={13} col="#000">Boek nu</Text>
                </Button>
              </XStack>
            </YStack>
          )}
          ListEmptyComponent={
            <YStack padding="$8" alignItems="center">
              <Text color="$placeholderColor">{query ? `Geen resultaten voor "${query}"` : "Geen kappers beschikbaar"}</Text>
            </YStack>
          }
        />
      )}
    </SafeAreaView>
  );
}
