import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigation from "./navigation/AppNavigation";
import { StatusBar } from "expo-status-bar";
import SplashScreen from "./screens/SplashScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { database, ref, set, push, get, onValue } from "./firebase";
import { Platform } from "react-native";
import registerNNPushToken from "native-notify";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function savePushTokenToFirebaseRealtime(token) {
  const pushTokensRef = ref(database, "PushTokens");
  const snapshot = await get(pushTokensRef);
  const existingTokens = snapshot.val() || {};
  const tokenExists = Object.values(existingTokens).some(
    (existingToken) => existingToken.token === token
  );

  if (tokenExists) {
    console.log("Token already exists, skipping save.");
    return;
  }

  const newPushTokenRef = push(pushTokensRef);
  const tokenData = { token };

  try {
    await set(newPushTokenRef, tokenData);
    console.log(
      "Push token saved to Firebase Realtime Database with auto-generated ID"
    );
  } catch (error) {
    console.error("Error saving push token to Firebase:", error);
  }
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    if (!projectId) {
      alert("Expo project ID not found");
      return;
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      console.log("Push Token:", pushTokenString);
      await savePushTokenToFirebaseRealtime(pushTokenString);
      return pushTokenString;
    } catch (e) {
      console.error("Error getting push token:", e);
    }
  } else {
    alert("Must use a physical device for Push Notifications");
  }
}

export default function App() {
  registerNNPushToken(27679, "sdhXaS2gL6jyty902Vw7pR");
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  const handleSplashFinish = () => {
    setSplashVisible(false);
  };

  useEffect(() => {
    // Register push notifications and get the initial push token
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          console.log("Expo Push Token:", token);
        }
      })
      .catch((error) => {
        console.error("Error during push notification registration:", error);
      });

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      unsubscribe(); // Unsubscribe from Firebase listener
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []); // Empty dependency array to run the effect only once when the component mounts

  return (
    <>
      {isSplashVisible ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <NavigationContainer>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigation />
            <StatusBar style="auto" />
          </GestureHandlerRootView>
        </NavigationContainer>
      )}
    </>
  );
}
