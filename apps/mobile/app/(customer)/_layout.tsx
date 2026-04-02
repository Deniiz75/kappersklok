import { Tabs } from "expo-router";
import { Search, CalendarDays, Heart, User } from "lucide-react-native";
import { colors } from "../../lib/theme";

export default function CustomerLayout() {
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
        name="(search)"
        options={{ tabBarIcon: ({ color }) => <Search size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="(bookings)"
        options={{ tabBarIcon: ({ color }) => <CalendarDays size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="(favorites)"
        options={{ tabBarIcon: ({ color }) => <Heart size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{ tabBarIcon: ({ color }) => <User size={24} color={color} /> }}
      />
    </Tabs>
  );
}
