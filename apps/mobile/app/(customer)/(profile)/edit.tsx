import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Check } from "lucide-react-native";
import { useAuth } from "../../../lib/auth-context";
import { useCustomerProfile, useUpdateCustomerProfile } from "../../../lib/hooks";
import { colors } from "../../../lib/theme";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const email = session?.user.email || "";
  const { data: profile, isLoading } = useCustomerProfile(email || undefined);
  const updateProfile = useUpdateCustomerProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const prefilledRef = useRef(false);

  useEffect(() => {
    if (prefilledRef.current) return;
    const p = profile as { name?: string | null; phone?: string | null } | null | undefined;
    if (!p) return;
    prefilledRef.current = true;
    if (p.name) setName(p.name);
    if (p.phone) setPhone(p.phone);
  }, [profile]);

  async function handleSave() {
    if (!email || !name.trim()) return;
    const result = await updateProfile.mutateAsync({
      email,
      name: name.trim(),
      phone: phone.trim() || undefined,
    });
    if (result.success) {
      Alert.alert("Opgeslagen", "Uw profiel is bijgewerkt.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Fout", result.error || "Er ging iets mis.");
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={20} color={colors.gold} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profiel bewerken</Text>
        <Text style={styles.subtitle}>Uw gegevens worden gebruikt bij toekomstige boekingen.</Text>

        <View style={[styles.input, styles.readonlyInput]}>
          <Text style={styles.readonlyLabel}>E-mail</Text>
          <Text style={styles.readonlyValue}>{email}</Text>
        </View>

        <Text style={styles.label}>Naam</Text>
        <TextInput
          style={styles.input}
          placeholder="Uw volledige naam"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Telefoon (optioneel)</Text>
        <TextInput
          style={styles.input}
          placeholder="06-12345678"
          placeholderTextColor={colors.muted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.goldButton, (updateProfile.isPending || !name.trim()) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={updateProfile.isPending || !name.trim()}
        >
          <Check size={16} color={colors.background} />
          <Text style={styles.goldButtonText}>
            {updateProfile.isPending ? "Opslaan..." : "Opslaan"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8 },
  back: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 8 },
  backText: { fontSize: 14, color: colors.gold, fontWeight: "500" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 20 },
  label: { fontSize: 12, color: colors.muted, marginBottom: 6, marginTop: 6 },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator,
    borderRadius: 12, padding: 14, fontSize: 15, color: colors.foreground, marginBottom: 10,
  },
  readonlyInput: { opacity: 0.7, paddingVertical: 10, marginBottom: 16 },
  readonlyLabel: { fontSize: 10, color: colors.muted, marginBottom: 2 },
  readonlyValue: { fontSize: 14, color: colors.foreground },
  goldButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, marginTop: 16,
  },
  goldButtonText: { fontSize: 15, fontWeight: "700", color: colors.background },
});
