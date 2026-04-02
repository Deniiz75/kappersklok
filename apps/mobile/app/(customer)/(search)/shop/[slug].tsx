import { ScrollView as RNScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Phone, Clock, Star, ChevronLeft, Bookmark } from "lucide-react-native";
import { YStack, XStack, Text, Button, Avatar, Separator, Spinner, ScrollView, Card } from "tamagui";
import { useShop } from "../../../../lib/hooks";
import { formatPrice } from "@kappersklok/shared";

const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export default function ShopDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: shop, isLoading } = useShop(slug);

  if (isLoading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}><YStack flex={1} justifyContent="center" alignItems="center"><Spinner color="$placeholderColor" /></YStack></SafeAreaView>;
  }
  if (!shop) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}><YStack flex={1} justifyContent="center" alignItems="center"><Text color="$placeholderColor">Niet gevonden</Text></YStack></SafeAreaView>;
  }

  const location = [shop.street, shop.houseNumber, shop.city].filter(Boolean).join(", ");
  const today = new Date().getDay();
  const services = (shop.services || []) as { id: string; name: string; duration: number; price: number }[];
  const barbers = (shop.barbers || []) as { id: string; name: string }[];
  const reviews = (shop.reviews || []) as { id: string; customerName: string; rating: number; comment: string | null }[];
  const businessHours = (shop.businessHours || []) as { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }[];
  function initials(name: string) { return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(); }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      {/* Nav */}
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$3" paddingVertical="$2.5" borderBottomWidth={0.5} borderBottomColor="$borderColor">
        <XStack onPress={() => router.back()} pressStyle={{ opacity: 0.6 }} hitSlop={12}><ChevronLeft size={28} color="#fff" /></XStack>
        <Text fontSize={16} fontWeight="600" color="$color" flex={1} textAlign="center" numberOfLines={1}>{shop.name}</Text>
        <Bookmark size={24} color="#fff" />
      </XStack>

      <RNScrollView>
        {/* Profile header */}
        <XStack paddingHorizontal="$5" paddingTop="$5" paddingBottom="$3" gap="$6" alignItems="center">
          <Avatar circular size={86} backgroundColor="$backgroundHover" borderWidth={2} borderColor="#d4a853">
            <Text fontSize={28} fontWeight="700" color="#d4a853">{initials(shop.name as string)}</Text>
          </Avatar>
          <XStack flex={1} justifyContent="space-around">
            <YStack alignItems="center">
              <Text fontSize={18} fontWeight="700" color="$color">{services.length}</Text>
              <Text fontSize={11} color="$placeholderColor">Diensten</Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={18} fontWeight="700" color="$color">{barbers.length}</Text>
              <Text fontSize={11} color="$placeholderColor">Kappers</Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={18} fontWeight="700" color="$color">{reviews.length}</Text>
              <Text fontSize={11} color="$placeholderColor">Reviews</Text>
            </YStack>
          </XStack>
        </XStack>

        {/* Bio */}
        <YStack paddingHorizontal="$5" marginBottom="$3">
          <Text fontSize={14} fontWeight="600" color="$color">{shop.name}</Text>
          {shop.avgRating > 0 && (
            <XStack alignItems="center" gap="$1.5" marginTop="$1">
              <Star size={13} color="#d4a853" fill="#d4a853" />
              <Text fontSize={13} fontWeight="600" color="#d4a853">{(shop.avgRating as number).toFixed(1)}</Text>
            </XStack>
          )}
          {location && <Text fontSize={13} color="$placeholderColor" marginTop="$1">{location}</Text>}
        </YStack>

        {/* Action buttons */}
        <XStack gap="$2" paddingHorizontal="$5" marginBottom="$4">
          <Button
            flex={1} backgroundColor="#d4a853"
            borderRadius="$2" height={38}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => router.push(`/(customer)/(search)/book/${shop.id}`)}
          >
            <Text fontWeight="700" fontSize={14} col="#000">Afspraak maken</Text>
          </Button>
          {shop.phone && (
            <Button backgroundColor="$backgroundPress" borderRadius="$2" height={38} paddingHorizontal="$3.5">
              <Phone size={16} color="#fff" />
            </Button>
          )}
        </XStack>

        {/* Barber circles */}
        {barbers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 16 }}>
            {barbers.map((b) => (
              <YStack key={b.id} alignItems="center" width={64} gap="$1">
                <Avatar circular size={58} backgroundColor="$backgroundHover" borderWidth={0.5} borderColor="$borderColor">
                  <Text fontSize={20} fontWeight="600" color="$colorHover">{b.name[0]}</Text>
                </Avatar>
                <Text fontSize={11} color="$color" numberOfLines={1}>{b.name}</Text>
              </YStack>
            ))}
          </ScrollView>
        )}

        <Separator borderColor="$borderColor" marginVertical="$1" />

        {/* Services */}
        <YStack paddingHorizontal="$5" marginTop="$4">
          <Text fontSize={14} fontWeight="600" color="$color" marginBottom="$3">Diensten</Text>
          {services.map((svc) => (
            <XStack key={svc.id} justifyContent="space-between" alignItems="center" paddingVertical="$3" borderBottomWidth={0.5} borderBottomColor="$borderColor">
              <YStack>
                <Text fontSize={14} color="$color">{svc.name}</Text>
                <Text fontSize={12} color="$placeholderColor" marginTop="$0.5">{svc.duration} min</Text>
              </YStack>
              <Text fontSize={14} fontWeight="600" color="$color">{formatPrice(svc.price)}</Text>
            </XStack>
          ))}
        </YStack>

        {/* Hours */}
        <YStack paddingHorizontal="$5" marginTop="$5">
          <Text fontSize={14} fontWeight="600" color="$color" marginBottom="$3">Openingstijden</Text>
          {businessHours.map((h) => (
            <XStack key={h.dayOfWeek} justifyContent="space-between" paddingVertical="$2">
              <Text fontSize={13} color={h.dayOfWeek === today ? "$color" : "$placeholderColor"} fontWeight={h.dayOfWeek === today ? "600" : "400"}>
                {dayNames[h.dayOfWeek]}
              </Text>
              <Text fontSize={13} color={h.closed ? "$placeholderColor" : "$color"}>
                {h.closed ? "Gesloten" : `${h.openTime} – ${h.closeTime}`}
              </Text>
            </XStack>
          ))}
        </YStack>

        {/* Reviews */}
        {reviews.length > 0 && (
          <YStack paddingHorizontal="$5" marginTop="$5" marginBottom="$8">
            <Text fontSize={14} fontWeight="600" color="$color" marginBottom="$3">Reviews</Text>
            {reviews.slice(0, 5).map((r) => (
              <YStack key={r.id} marginBottom="$4">
                <XStack alignItems="center" gap="$2">
                  <Avatar circular size={28} backgroundColor="$backgroundPress">
                    <Text fontSize={12} fontWeight="600" color="$colorHover">{r.customerName[0]}</Text>
                  </Avatar>
                  <Text fontSize={13} fontWeight="600" color="$color" flex={1}>{r.customerName}</Text>
                  <XStack gap="$0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} color="#d4a853" fill={i < r.rating ? "#d4a853" : "transparent"} />
                    ))}
                  </XStack>
                </XStack>
                {r.comment && <Text fontSize={13} color="$colorHover" marginTop="$2" lineHeight={18}>{r.comment}</Text>}
              </YStack>
            ))}
          </YStack>
        )}
      </RNScrollView>
    </SafeAreaView>
  );
}
