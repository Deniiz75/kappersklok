import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./theme";
import type { LucideIcon } from "lucide-react-native";

interface Props {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
}

export function PlaceholderScreen({ title, subtitle, icon: Icon }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <Icon size={32} color={colors.gold} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(212, 168, 83, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.foreground, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 8 },
});
