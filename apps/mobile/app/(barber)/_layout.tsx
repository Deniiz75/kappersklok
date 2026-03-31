import { Tabs } from "expo-router";
import { CalendarDays, Scissors, Settings, LayoutDashboard } from "lucide-react-native";
import { colors } from "../../lib/theme";

export default function BarberLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="(today)"
        options={{
          title: "Vandaag",
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(agenda)"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(services)"
        options={{
          title: "Diensten",
          tabBarIcon: ({ color, size }) => <Scissors size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: "Instellingen",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
