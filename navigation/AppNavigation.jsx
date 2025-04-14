import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "../screens/Home";
import Data from "../screens/Data";
import Tips from "../screens/Tips";
import { database, ref, onValue } from "../firebase";
import { useStore } from "../store"; // Zustand store

const Tab = createBottomTabNavigator();

const AppNavigation = () => {
  const {
    currentSensor,
    availableSensors,
    setCurrentSensor,
    setAvailableSensors,
  } = useStore();

  // Fetch sensors once and keep state updated
  useEffect(() => {
    const sensorsRef = ref(database, "SENSOR");
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const sensors = snapshot.exists() ? Object.keys(snapshot.val()) : [];
      setAvailableSensors(sensors);

      // Automatically select the first sensor if currentSensor is invalid
      if (!sensors.includes(currentSensor) && sensors.length > 0) {
        setCurrentSensor(sensors[0]);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [setAvailableSensors, setCurrentSensor, currentSensor]);

  // Swap to the next sensor (memoized function)
  const swapSensor = useCallback(() => {
    if (availableSensors.length > 1) {
      const currentIndex = availableSensors.indexOf(currentSensor);
      const nextIndex = (currentIndex + 1) % availableSensors.length;
      setCurrentSensor(availableSensors[nextIndex]);
    }
  }, [currentSensor, availableSensors, setCurrentSensor]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Home: focused ? "home" : "home-outline",
            Data: focused ? "analytics" : "analytics-outline",
            Tips: focused ? "information-circle" : "information-circle-outline",
          };
          return (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          );
        },
        tabBarLabel: ({ children, color, focused }) => (
          <Text
            style={[
              styles.tabLabel,
              { color, fontWeight: focused ? "bold" : "normal" },
            ]}
          >
            {children}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#4A71C7",
        tabBarInactiveTintColor: "#0007",
        headerTintColor: "#ffffff",
        headerStyle: styles.header,
        headerTitleAlign: "center",
        headerLeft: () => (
          <Image
            source={require("../assets/earthquake.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={swapSensor}
            style={styles.swapButton}
            activeOpacity={0.6}
          >
            <Ionicons name="swap-horizontal" size={25} color="white" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Data" component={Data} />
      <Tab.Screen name="Tips" component={Tips} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    backgroundColor: "#D9EAEA",
    position: "absolute",
    borderTopWidth: 0,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 12,
  },
  header: {
    backgroundColor: "#4A71C7",
    height: 110,
    elevation: 0,
  },
  logo: {
    width: 35,
    height: 35,
    marginLeft: 15,
  },
  swapButton: {
    marginRight: 15,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
  },
});

export default AppNavigation;
