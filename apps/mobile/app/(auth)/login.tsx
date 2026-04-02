import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, XStack, Text, Input, Button, Separator, Tabs, Card, Spinner } from "tamagui";
import { useAuth } from "../../lib/auth-context";

export default function LoginScreen() {
  const { signInWithPassword, signInWithOtp, verifyOtp } = useAuth();
  const [tab, setTab] = useState("klant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBarberLogin() {
    setLoading(true); setError("");
    const { error } = await signInWithPassword(email, password);
    if (error) setError(error);
    setLoading(false);
  }

  async function handleCustomerOtp() {
    setLoading(true); setError("");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "center", paddingHorizontal: 36 }}>
        {/* Logo */}
        <YStack alignItems="center" marginBottom="$8">
          <Text fontSize={38} fontStyle="italic" color="$color" letterSpacing={-1}>
            Kappersklok
          </Text>
        </YStack>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); setOtpSent(false); }} marginBottom="$4">
          <Tabs.List backgroundColor="transparent" borderBottomWidth={0.5} borderBottomColor="$borderColor">
            <Tabs.Tab value="klant" flex={1} backgroundColor="transparent" borderBottomWidth={tab === "klant" ? 2 : 0} borderBottomColor="$color" paddingBottom="$3">
              <Text color={tab === "klant" ? "$color" : "$placeholderColor"} fontWeight="600" fontSize={14}>Klant</Text>
            </Tabs.Tab>
            <Tabs.Tab value="kapper" flex={1} backgroundColor="transparent" borderBottomWidth={tab === "kapper" ? 2 : 0} borderBottomColor="$color" paddingBottom="$3">
              <Text color={tab === "kapper" ? "$color" : "$placeholderColor"} fontWeight="600" fontSize={14}>Kapper</Text>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Form */}
        <Card backgroundColor="$backgroundHover" borderWidth={0.5} borderColor="$borderColor" borderRadius="$4" overflow="hidden" marginBottom="$3">
          <Input
            placeholder="E-mailadres"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            backgroundColor="transparent"
            borderWidth={0}
            borderBottomWidth={0.5}
            borderBottomColor="$borderColor"
            borderRadius={0}
            color="$color"
            placeholderTextColor="$placeholderColor"
            paddingHorizontal="$4"
            paddingVertical="$3.5"
            fontSize={14}
          />
          {tab === "kapper" && (
            <Input
              placeholder="Wachtwoord"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              backgroundColor="transparent"
              borderWidth={0}
              borderRadius={0}
              color="$color"
              placeholderTextColor="$placeholderColor"
              paddingHorizontal="$4"
              paddingVertical="$3.5"
              fontSize={14}
            />
          )}
          {tab === "klant" && otpSent && (
            <Input
              placeholder="Verificatiecode"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              backgroundColor="transparent"
              borderWidth={0}
              borderRadius={0}
              color="$color"
              placeholderTextColor="$placeholderColor"
              paddingHorizontal="$4"
              paddingVertical="$3.5"
              fontSize={14}
            />
          )}
        </Card>

        {error ? <Text color="$red10" fontSize={13} textAlign="center" marginBottom="$2">{error}</Text> : null}

        <Button
          backgroundColor="$accentBackground"
          borderRadius="$3"
          height={46}
          pressStyle={{ opacity: 0.8 }}
          disabled={loading}
          opacity={loading ? 0.5 : 1}
          onPress={tab === "kapper" ? handleBarberLogin : handleCustomerOtp}
          marginBottom="$3"
        >
          {loading ? <Spinner size="small" /> : <Text fontWeight="700" fontSize={14} col="$accentColor">{tab === "kapper" ? "Inloggen" : otpSent ? "Verifiëren" : "Stuur code"}</Text>}
        </Button>

        {tab === "klant" && !otpSent && (
          <Text color="$placeholderColor" fontSize={12} textAlign="center">
            We sturen een verificatiecode naar je e-mail.
          </Text>
        )}

        {/* Footer */}
        <XStack alignItems="center" marginTop="$10" gap="$3">
          <Separator borderColor="$borderColor" />
          <Text color="$placeholderColor" fontSize={12} fontWeight="500">Kappersklok</Text>
          <Separator borderColor="$borderColor" />
        </XStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
