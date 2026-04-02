import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

export default function BarberLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          height: 50,
          paddingBottom: 0,
          elevation: 0,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="(today)"
        options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="(agenda)"
        options={{ tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="(services)"
        options={{ tabBarIcon: ({ color, size }) => <Feather name="scissors" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{ tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
