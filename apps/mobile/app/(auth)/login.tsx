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
      if (error) { setError(error); } else { setOtpSent(true); }
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
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Kappersklok</Text>
        </View>

        {/* Tabs — Instagram-style underline tabs */}
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
          <View style={styles.inputGroup}>
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
                style={[styles.input, styles.inputLast]}
                placeholder="Wachtwoord"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            )}

            {tab === "klant" && otpSent && (
              <TextInput
                style={[styles.input, styles.inputLast]}
                placeholder="Verificatiecode"
                placeholderTextColor={colors.muted}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
              />
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={tab === "kapper" ? handleBarberLogin : handleCustomerOtp}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {loading ? "Laden..." : tab === "kapper" ? "Inloggen" : otpSent ? "Verifiëren" : "Stuur code"}
            </Text>
          </TouchableOpacity>

          {tab === "klant" && !otpSent && (
            <Text style={styles.hint}>
              We sturen een verificatiecode naar je e-mail.
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>Kappersklok</Text>
          <View style={styles.footerLine} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 40 },
  logoWrap: { alignItems: "center", marginBottom: 40 },
  logo: {
    fontSize: 36, fontWeight: "400", color: colors.foreground,
    fontStyle: "italic", letterSpacing: -0.5,
  },
  tabs: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: colors.separator, marginBottom: 24 },
  tab: { flex: 1, alignItems: "center", paddingBottom: 12, borderBottomWidth: 1.5, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.foreground },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.muted },
  tabTextActive: { color: colors.foreground },
  form: { gap: 14 },
  inputGroup: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.separator,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, color: colors.foreground,
    borderBottomWidth: 0.5, borderBottomColor: colors.separator,
  },
  inputLast: { borderBottomWidth: 0 },
  error: { color: colors.destructive, fontSize: 13, textAlign: "center" },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.background, fontSize: 14, fontWeight: "700" },
  hint: { color: colors.muted, fontSize: 12, textAlign: "center" },
  footer: { flexDirection: "row", alignItems: "center", marginTop: 60, gap: 16 },
  footerLine: { flex: 1, height: 0.5, backgroundColor: colors.separator },
  footerText: { fontSize: 12, color: colors.muted, fontWeight: "500" },
});
