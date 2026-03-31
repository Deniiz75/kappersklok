import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Scissors, Plus, Trash2 } from "lucide-react-native";
import { useBarberServices } from "../../../lib/hooks";
import { supabase } from "../../../lib/supabase";
import { colors } from "../../../lib/theme";
import { formatPrice } from "@kappersklok/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

export default function ServicesScreen() {
  const [shopId, setShopId] = useState<string | null>(null);
  const { data: services, isLoading } = useBarberServices(shopId || undefined);
  const queryClient = useQueryClient();

  // Add service form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("kk-barber-shopId").then((id) => id && setShopId(id));
  }, []);

  const typedServices = (services || []) as Array<{
    id: string; name: string; duration: number; price: number; active: boolean; sortOrder: number;
  }>;

  async function handleAdd() {
    if (!shopId || !newName || !newDuration || !newPrice) return;
    await supabase.from("Service").insert({
      name: newName,
      duration: parseInt(newDuration),
      price: Math.round(parseFloat(newPrice) * 100),
      shopId,
      active: true,
      sortOrder: typedServices.length,
    });
    setNewName(""); setNewDuration(""); setNewPrice(""); setShowAdd(false);
    queryClient.invalidateQueries({ queryKey: ["shopServices"] });
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert("Verwijderen", `"${name}" verwijderen?`, [
      { text: "Nee", style: "cancel" },
      { text: "Ja", style: "destructive", onPress: async () => {
        await supabase.from("Service").update({ active: false }).eq("id", id);
        queryClient.invalidateQueries({ queryKey: ["shopServices"] });
      }},
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Diensten</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAdd(!showAdd)}>
          <Plus size={18} color={colors.background} />
          <Text style={styles.addButtonText}>Toevoegen</Text>
        </TouchableOpacity>
      </View>

      {/* Add form */}
      {showAdd && (
        <View style={styles.addForm}>
          <TextInput style={styles.input} placeholder="Naam (bijv. Haarsnit)" placeholderTextColor={colors.muted} value={newName} onChangeText={setNewName} />
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Duur (min)" placeholderTextColor={colors.muted} value={newDuration} onChangeText={setNewDuration} keyboardType="number-pad" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Prijs (€)" placeholderTextColor={colors.muted} value={newPrice} onChangeText={setNewPrice} keyboardType="decimal-pad" />
          </View>
          <TouchableOpacity style={styles.goldButton} onPress={handleAdd}>
            <Text style={styles.goldButtonText}>Opslaan</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading || !shopId ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : (
        <FlatList
          data={typedServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item: svc }) => (
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Scissors size={16} color={colors.gold} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceMeta}>{svc.duration} min</Text>
              </View>
              <Text style={styles.servicePrice}>{formatPrice(svc.price)}</Text>
              <TouchableOpacity onPress={() => handleDelete(svc.id, svc.name)} hitSlop={8}>
                <Trash2 size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Scissors size={32} color={colors.muted} />
              <Text style={styles.emptyText}>Nog geen diensten</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 28, fontWeight: "700", color: colors.foreground },
  addButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.gold, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { fontSize: 13, fontWeight: "700", color: colors.background },
  addForm: { marginHorizontal: 20, marginTop: 12, gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: colors.foreground },
  goldButton: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  goldButtonText: { fontSize: 14, fontWeight: "700", color: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, gap: 8 },
  emptyText: { fontSize: 14, color: colors.muted },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(212, 168, 83, 0.1)", justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  serviceMeta: { fontSize: 11, color: colors.muted, marginTop: 1 },
  servicePrice: { fontSize: 14, fontWeight: "700", color: colors.gold, marginRight: 8 },
});
