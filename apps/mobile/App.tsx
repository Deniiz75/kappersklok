import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

const GOLD = "#d4a853";
const BG = "#0a0a0f";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>KAPPERSKLOK</Text>
      <Text style={styles.subtitle}>Mobiele app — in ontwikkeling</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: "700",
    color: GOLD,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
});
