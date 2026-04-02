import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
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
        options={{ tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="(bookings)"
        options={{ tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="(favorites)"
        options={{ tabBarIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{ tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
