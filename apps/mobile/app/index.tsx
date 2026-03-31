import { Redirect } from "expo-router";
import { useAuth } from "../lib/auth-context";
import { View, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";

export default function Index() {
  const { session, loading, mode } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (mode === "barber") {
    return <Redirect href="/(barber)/(today)" />;
  }

  return <Redirect href="/(customer)/(search)" />;
}
