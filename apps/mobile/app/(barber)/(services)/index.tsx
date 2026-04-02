import { useState, useEffect } from "react";
import { FlatList, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Scissors, Plus, Trash2, Pencil, X } from "lucide-react-native";
import { YStack, XStack, Text, Button, Input, Separator, Spinner } from "tamagui";
import { useBarberServices } from "../../../lib/hooks";
import { supabase } from "../../../lib/supabase";
import { colors } from "../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

type ServiceItem = { id: string; name: string; duration: number; price: number; active: boolean; sortOrder: number };

export default function ServicesScreen() {
  const [shopId, setShopId] = useState<string | null>(null);
  const { data: services, isLoading } = useBarberServices(shopId || undefined);
  const queryClient = useQueryClient();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { AsyncStorage.getItem("kk-barber-shopId").then((id) => id && setShopId(id)); }, []);

  const typedServices = (services || []) as ServiceItem[];

  function openAdd() {
    setEditingService(null);
    setFormName(""); setFormDuration(""); setFormPrice("");
    setModalVisible(true);
  }

  function openEdit(svc: ServiceItem) {
    setEditingService(svc);
    setFormName(svc.name);
    setFormDuration(String(svc.duration));
    setFormPrice(String(svc.price / 100));
    setModalVisible(true);
  }

  async function handleSave() {
    if (!shopId || !formName || !formDuration || !formPrice) return;
    setSaving(true);

    const data = {
      name: formName,
      duration: parseInt(formDuration),
      price: Math.round(parseFloat(formPrice.replace(",", ".")) * 100),
    };

    if (editingService) {
      await supabase.from("Service").update(data).eq("id", editingService.id);
    } else {
      await supabase.from("Service").insert({ ...data, shopId, active: true, sortOrder: typedServices.length });
    }

    setSaving(false);
    setModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ["shopServices"] });
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert("Verwijderen", `"${name}" verwijderen?`, [
      { text: "Annuleer", style: "cancel" },
      { text: "Verwijder", style: "destructive", onPress: async () => {
        await supabase.from("Service").update({ active: false }).eq("id", id);
        queryClient.invalidateQueries({ queryKey: ["shopServices"] });
      }},
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$4" paddingTop="$3" paddingBottom="$2">
        <Text fontSize={24} fontWeight="700" color="$color">Diensten</Text>
        <Button
          backgroundColor="#d4a853" borderRadius="$2" height={34} paddingHorizontal="$3"
          pressStyle={{ opacity: 0.8 }} onPress={openAdd}
        >
          <XStack alignItems="center" gap="$1.5">
            <Plus size={16} color="#000" />
            <Text fontWeight="700" fontSize={13} col="#000">Nieuw</Text>
          </XStack>
        </Button>
      </XStack>

      {isLoading || !shopId ? (
        <YStack flex={1} justifyContent="center" alignItems="center"><Spinner color="$placeholderColor" /></YStack>
      ) : typedServices.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$2">
          <Scissors size={28} color={colors.muted} />
          <Text color="$placeholderColor">Nog geen diensten</Text>
          <Button backgroundColor="#d4a853" borderRadius="$2" marginTop="$2" onPress={openAdd}>
            <Text fontWeight="700" fontSize={13} col="#000">Dienst toevoegen</Text>
          </Button>
        </YStack>
      ) : (
        <FlatList
          data={typedServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item: svc, index }) => (
            <XStack
              backgroundColor="$backgroundHover"
              paddingVertical="$3.5" paddingHorizontal="$4"
              borderTopLeftRadius={index === 0 ? 12 : 0}
              borderTopRightRadius={index === 0 ? 12 : 0}
              borderBottomLeftRadius={index === typedServices.length - 1 ? 12 : 0}
              borderBottomRightRadius={index === typedServices.length - 1 ? 12 : 0}
              borderBottomWidth={index < typedServices.length - 1 ? 0.5 : 0}
              borderBottomColor="$borderColor"
              alignItems="center" gap="$3"
            >
              <YStack flex={1}>
                <Text fontSize={15} fontWeight="600" color="$color">{svc.name}</Text>
                <Text fontSize={12} color="$placeholderColor" marginTop="$0.5">{svc.duration} min</Text>
              </YStack>
              <Text fontSize={15} fontWeight="600" color="#d4a853" marginRight="$3">{formatPrice(svc.price)}</Text>
              <XStack gap="$3">
                <XStack onPress={() => openEdit(svc)} pressStyle={{ opacity: 0.5 }} hitSlop={8}>
                  <Pencil size={16} color={colors.muted} />
                </XStack>
                <XStack onPress={() => handleDelete(svc.id, svc.name)} pressStyle={{ opacity: 0.5 }} hitSlop={8}>
                  <Trash2 size={16} color={colors.destructive} />
                </XStack>
              </XStack>
            </XStack>
          )}
        />
      )}

      {/* Edit/Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <YStack flex={1} justifyContent="flex-end" backgroundColor="rgba(0,0,0,0.6)">
          <YStack backgroundColor="$backgroundHover" borderTopLeftRadius={20} borderTopRightRadius={20} padding="$5" paddingBottom="$8">
            {/* Modal header */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
              <Text fontSize={18} fontWeight="700" color="$color">
                {editingService ? "Dienst bewerken" : "Nieuwe dienst"}
              </Text>
              <XStack onPress={() => setModalVisible(false)} pressStyle={{ opacity: 0.5 }} hitSlop={12}>
                <X size={24} color={colors.muted} />
              </XStack>
            </XStack>

            {/* Form */}
            <YStack gap="$3">
              <YStack gap="$1">
                <Text fontSize={13} color="$placeholderColor">Naam</Text>
                <Input
                  placeholder="bijv. Haarsnit"
                  value={formName}
                  onChangeText={setFormName}
                  backgroundColor="$backgroundPress"
                  borderWidth={0.5} borderColor="$borderColor"
                  borderRadius="$3" color="$color"
                  placeholderTextColor="$placeholderColor"
                  fontSize={15} paddingHorizontal="$3.5" height={46}
                />
              </YStack>

              <XStack gap="$3">
                <YStack flex={1} gap="$1">
                  <Text fontSize={13} color="$placeholderColor">Duur (min)</Text>
                  <Input
                    placeholder="30"
                    value={formDuration}
                    onChangeText={setFormDuration}
                    keyboardType="number-pad"
                    backgroundColor="$backgroundPress"
                    borderWidth={0.5} borderColor="$borderColor"
                    borderRadius="$3" color="$color"
                    placeholderTextColor="$placeholderColor"
                    fontSize={15} paddingHorizontal="$3.5" height={46}
                  />
                </YStack>
                <YStack flex={1} gap="$1">
                  <Text fontSize={13} color="$placeholderColor">Prijs (€)</Text>
                  <Input
                    placeholder="25,00"
                    value={formPrice}
                    onChangeText={setFormPrice}
                    keyboardType="decimal-pad"
                    backgroundColor="$backgroundPress"
                    borderWidth={0.5} borderColor="$borderColor"
                    borderRadius="$3" color="$color"
                    placeholderTextColor="$placeholderColor"
                    fontSize={15} paddingHorizontal="$3.5" height={46}
                  />
                </YStack>
              </XStack>

              <Button
                backgroundColor="#d4a853" borderRadius="$3" height={48} marginTop="$2"
                pressStyle={{ opacity: 0.8 }}
                disabled={saving || !formName || !formDuration || !formPrice}
                opacity={saving ? 0.5 : 1}
                onPress={handleSave}
              >
                <Text fontWeight="700" fontSize={15} col="#000">
                  {saving ? "Opslaan..." : editingService ? "Wijzigingen opslaan" : "Toevoegen"}
                </Text>
              </Button>
            </YStack>
          </YStack>
        </YStack>
      </Modal>
    </SafeAreaView>
  );
}
