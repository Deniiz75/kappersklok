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
        <Icon size={28} color={colors.muted} />
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 8 },
  title: { fontSize: 16, fontWeight: "600", color: colors.foreground },
  subtitle: { fontSize: 13, color: colors.muted, textAlign: "center" },
});
