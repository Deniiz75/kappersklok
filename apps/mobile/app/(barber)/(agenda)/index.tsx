import { useState, useEffect } from "react";
import { FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarDays, Clock, User } from "lucide-react-native";
import { YStack, XStack, Text, Separator, Spinner, ScrollView } from "tamagui";
import { useShopAppointments } from "../../../lib/hooks";
import { colors } from "../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";

const shortDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

function generateWeekDates() {
  const dates = [];
  const today = new Date();
  for (let i = -3; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      value: d.toISOString().split("T")[0],
      day: shortDays[d.getDay()],
      date: d.getDate(),
      isToday: i === 0,
    });
  }
  return dates;
}

export default function AgendaScreen() {
  const [shopId, setShopId] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: appointments, isLoading, refetch } = useShopAppointments(shopId || undefined, selectedDate);
  const [refreshing, setRefreshing] = useState(false);
  const weekDates = generateWeekDates();

  useEffect(() => { AsyncStorage.getItem("kk-barber-shopId").then((id) => id && setShopId(id)); }, []);

  const typedAppointments = (appointments || []) as Array<{
    id: string; startTime: string; endTime: string;
    customerName: string; status: string;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  }>;
  const filtered = typedAppointments.filter((a) => a.status === "CONFIRMED" || a.status === "COMPLETED");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <XStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$2">
        <Text fontSize={24} fontWeight="700" color="$color">Agenda</Text>
      </XStack>

      {/* Date picker — compact calendar strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 4, paddingVertical: 8 }}>
        {weekDates.map((d) => (
          <YStack
            key={d.value}
            width={48} height={64} borderRadius={24}
            backgroundColor={selectedDate === d.value ? "#d4a853" : d.isToday ? "$backgroundPress" : "transparent"}
            alignItems="center" justifyContent="center" gap="$1"
            onPress={() => setSelectedDate(d.value)}
            pressStyle={{ opacity: 0.7 }}
          >
            <Text fontSize={11} fontWeight="500" color={selectedDate === d.value ? "#000" : "$placeholderColor"}>
              {d.day}
            </Text>
            <Text fontSize={18} fontWeight="700" color={selectedDate === d.value ? "#000" : d.isToday ? "#d4a853" : "$color"}>
              {d.date}
            </Text>
          </YStack>
        ))}
      </ScrollView>

      <Separator borderColor="$borderColor" />

      {isLoading || !shopId ? (
        <YStack flex={1} justifyContent="center" alignItems="center"><Spinner color="$placeholderColor" /></YStack>
      ) : filtered.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$2">
          <CalendarDays size={28} color={colors.muted} />
          <Text color="$placeholderColor" fontSize={14}>Geen afspraken</Text>
        </YStack>
      ) : (
        <FlatList
          data={filtered.sort((a, b) => a.startTime.localeCompare(b.startTime))}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} tintColor="#8e8e93" />}
          renderItem={({ item: apt, index }) => (
            <XStack backgroundColor="$backgroundHover" paddingVertical="$3" paddingHorizontal="$3.5"
              borderTopLeftRadius={index === 0 ? 12 : 0}
              borderTopRightRadius={index === 0 ? 12 : 0}
              borderBottomLeftRadius={index === filtered.length - 1 ? 12 : 0}
              borderBottomRightRadius={index === filtered.length - 1 ? 12 : 0}
              borderBottomWidth={index < filtered.length - 1 ? 0.5 : 0}
              borderBottomColor="$borderColor"
              gap="$3" alignItems="center"
            >
              {/* Time */}
              <YStack width={44} alignItems="center">
                <Text fontSize={14} fontWeight="700" color="#d4a853">{apt.startTime}</Text>
                <Text fontSize={10} color="$placeholderColor">{apt.endTime}</Text>
              </YStack>

              {/* Info */}
              <YStack flex={1} gap="$0.5">
                <Text fontSize={14} fontWeight="600" color="$color">{apt.customerName}</Text>
                <Text fontSize={12} color="$placeholderColor">{apt.service?.name} · {apt.service?.duration} min</Text>
              </YStack>

              {/* Price + status */}
              <YStack alignItems="flex-end" gap="$1">
                <Text fontSize={13} fontWeight="600" color="$color">{apt.service ? formatPrice(apt.service.price) : ""}</Text>
                <XStack backgroundColor={apt.status === "COMPLETED" ? "rgba(48,209,88,0.12)" : "rgba(212,168,83,0.12)"} borderRadius={6} paddingHorizontal="$2" paddingVertical="$0.5">
                  <Text fontSize={10} fontWeight="600" color={apt.status === "COMPLETED" ? "$green10" : "#d4a853"}>
                    {apt.status === "COMPLETED" ? "Klaar" : "Bevestigd"}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          )}
        />
      )}
    </SafeAreaView>
  );
}
