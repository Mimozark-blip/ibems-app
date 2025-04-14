import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0); // Initial opacity value

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Final opacity
      duration: 1500, // Duration in milliseconds
      useNativeDriver: true, // Use native driver for better performance
    }).start(() => {
      // Fade out animation after a delay
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }).start(onFinish); // Notify parent when animation is done
      }, 1500);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View
        style={{
          marginBottom: 10,
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/earthquake.png")}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
        <Text style={styles.text}>IBEMS</Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          flexDirection: "column",
          marginBottom: 40,
          alignContent: "center",
        }}
      >
        <View className="flex justify-evenly gap-2 flex-row items-center">
          <Image
            source={require("../assets/URS.png")}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
          <Text className="text-white font-medium">
            University of Rizal System
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A71C7",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    padding: 10,
  },
});

export default SplashScreen;
