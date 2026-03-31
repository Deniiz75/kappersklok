import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and store the token in Supabase.
 */
export async function registerForPushNotifications(
  userEmail: string,
  userType: "CUSTOMER" | "BARBER",
): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[Push] Must use physical device for push notifications");
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Push] Permission not granted");
    return null;
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Kappersklok",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#d4a853",
    });
  }

  // Get Expo push token
  const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
    projectId: "kappersklok",
  });
  const token = tokenData;

  // Store in Supabase (upsert)
  await supabase.from("PushToken").upsert(
    {
      userEmail,
      userType,
      expoPushToken: token,
      deviceId: Device.deviceName || undefined,
      updatedAt: new Date().toISOString(),
    },
    { onConflict: "userEmail,expoPushToken" },
  );

  return token;
}

/**
 * Remove push token on sign out.
 */
export async function unregisterPushToken(userEmail: string) {
  try {
    const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
      projectId: "kappersklok",
    });
    await supabase
      .from("PushToken")
      .delete()
      .eq("userEmail", userEmail)
      .eq("expoPushToken", tokenData);
  } catch {
    // Ignore errors on cleanup
  }
}
