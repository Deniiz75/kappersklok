import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../lib/auth-context";
import { colors } from "../lib/theme";
import { View } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "kk-query-cache",
  throttleTime: 3000,
});

export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000 }}>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Slot />
          <StatusBar style="light" />
        </View>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
