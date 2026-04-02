import { Tabs } from "expo-router";
import { CalendarDays, Scissors, Settings, LayoutDashboard } from "lucide-react-native";
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
        options={{ tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="(agenda)"
        options={{ tabBarIcon: ({ color }) => <CalendarDays size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="(services)"
        options={{ tabBarIcon: ({ color }) => <Scissors size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{ tabBarIcon: ({ color }) => <Settings size={24} color={color} /> }}
      />
    </Tabs>
  );
}
