import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth-context";
import { colors } from "../../lib/theme";

type Tab = "klant" | "kapper";

export default function LoginScreen() {
  const { signInWithPassword, signInWithOtp, verifyOtp } = useAuth();
  const [tab, setTab] = useState<Tab>("klant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBarberLogin() {
    setLoading(true);
    setError("");
    const { error } = await signInWithPassword(email, password);
    if (error) setError(error);
    setLoading(false);
  }

  async function handleCustomerOtp() {
    setLoading(true);
    setError("");
    if (!otpSent) {
      const { error } = await signInWithOtp(email);
      if (error) {
        setError(error);
      } else {
        setOtpSent(true);
      }
    } else {
      const { error } = await verifyOtp(email, otpCode);
      if (error) setError(error);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoKappers}>KAPPERS</Text>
          <Text style={styles.logoKlok}>KLOK</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === "klant" && styles.tabActive]}
            onPress={() => { setTab("klant"); setError(""); setOtpSent(false); }}
          >
            <Text style={[styles.tabText, tab === "klant" && styles.tabTextActive]}>Klant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "kapper" && styles.tabActive]}
            onPress={() => { setTab("kapper"); setError(""); }}
          >
            <Text style={[styles.tabText, tab === "kapper" && styles.tabTextActive]}>Kapper</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="E-mailadres"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {tab === "kapper" && (
            <TextInput
              style={styles.input}
              placeholder="Wachtwoord"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          )}

          {tab === "klant" && otpSent && (
            <TextInput
              style={styles.input}
              placeholder="Verificatiecode"
              placeholderTextColor={colors.muted}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={tab === "kapper" ? handleBarberLogin : handleCustomerOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Laden..."
                : tab === "kapper"
                  ? "Inloggen"
                  : otpSent
                    ? "Verifiëren"
                    : "Stuur verificatiecode"}
            </Text>
          </TouchableOpacity>

          {tab === "klant" && !otpSent && (
            <Text style={styles.hint}>
              We sturen een code naar uw e-mailadres om in te loggen.
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  logoContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 48, gap: 8 },
  logoKappers: { fontSize: 22, fontWeight: "300", color: "#b0b0b0", letterSpacing: 3 },
  logoKlok: { fontSize: 22, fontWeight: "700", color: colors.gold, letterSpacing: 1.5 },
  tabs: { flexDirection: "row", marginBottom: 24, backgroundColor: colors.surface, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: colors.gold },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.muted },
  tabTextActive: { color: colors.background },
  form: { gap: 12 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.foreground,
  },
  error: { color: colors.destructive, fontSize: 13, textAlign: "center" },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.background, fontSize: 15, fontWeight: "700" },
  hint: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 8 },
});
