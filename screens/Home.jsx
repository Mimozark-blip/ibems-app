import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  FlatList,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { database, ref, onValue } from "../firebase";
import { useStore } from "../store";

const Home = () => {
  const [dropdownVisible, setDropdownVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { currentSensor, xAxisData, yAxisData, zAxisData } = useStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [intensity, setIntensity] = useState(0);
  const [filter, setFilter] = useState("Today");
  const [alertData, setAlertData] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const lastData = useRef({
    xAxisData: null,
    yAxisData: null,
    zAxisData: null,
  });
  const timeoutRef = useRef(null);
  const [alertMessage, setAlertMessage] = useState("No Activity");

  useEffect(() => {
    const sensorRef = ref(database, `SENSOR/${currentSensor}/earthquake2`);
    const alertRef = ref(database, "ALERTS/alerts");

    onValue(alertRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alerts = Object.keys(data)
          .map((timestamp) => ({
            ...data[timestamp],
            timestamp,
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort latest first

        setAlertData(alerts);

        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      } else {
        setAlertData([]);
      }
    });

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIntensity(data.intensityLevel || 0);
        setAlertMessage(data.alertMessage || "No Activity");
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    });

    return () => unsubscribe();
  }, [currentSensor]);

  useEffect(() => {
    if (
      xAxisData !== lastData.current.xAxisData ||
      yAxisData !== lastData.current.yAxisData ||
      zAxisData !== lastData.current.zAxisData
    ) {
      setIsOffline(false);
      clearTimeout(timeoutRef.current);
      lastData.current = { xAxisData, yAxisData, zAxisData };
      timeoutRef.current = setTimeout(() => setIsOffline(true), 10000);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [xAxisData, yAxisData, zAxisData]);

  const filteredData = alertData.filter((item) => {
    if (!item || !item.timestamp) return false;

    if (filter === "All") return true;

    if (filter === "Today") {
      const today = new Date();
      const alertDateString = item.timestamp.split("_")[0];
      const todayDate = today.toISOString().split("T")[0];
      return alertDateString === todayDate;
    }

    return false;
  });

  const getColor = () => {
    if (intensity === 0) return "#4A71C7";
    if (intensity <= 2) return "#4EB3C2";
    if (intensity <= 5) return "#FFC107";
    if (isOffline) return "#4A71C7";
    return "#F44336";
  };

  return (
    <View className="flex-1 relative">
      <SafeAreaView className="flex-1 flex bg-white">
        <View className="flex-1 justify-center align-middle items-center">
          <View className="flex justify-center align-middle items-center w-full h-96 shadow-none">
            <Image
              source={require("../assets/urs_building.png")}
              className="h-full w-full"
            />
            <View
              className="absolute flex-1 justify-center items-center w-60 h-60 top-10 rounded-full bg-white"
              style={{ borderWidth: 8, borderColor: getColor() }}
            >
              {isOffline ? (
                <View className="flex justify-center items-center gap-2 text-center">
                  <Image
                    source={require("../assets/no-connection.png")}
                    style={{ width: 42, height: 42 }}
                    resizeMode="contain"
                  />
                  <Text className="text-lg text-center font-medium text-[#0007]">
                    System Offline!
                  </Text>
                </View>
              ) : (
                <View className="justify-center items-center">
                  <Text
                    style={{
                      fontSize: 20,
                      color: getColor(),
                      textAlign: "center",
                    }}
                  >
                    {currentSensor}
                  </Text>
                  <Text
                    style={{
                      fontSize: 90,
                      fontWeight: "bold",
                      color: getColor(),
                      textAlign: "center",
                    }}
                  >
                    {intensity}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: getColor(),
                      textAlign: "center",
                    }}
                  >
                    {alertMessage}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="min-w-full flex-1 p-3 mb-20 bg-white flex justify-evenly">
            <View className="flex-row absolute -top-12 right-3 justify-end mb-4">
              <TouchableOpacity
                onPress={() => setFilter("Today")}
                className={`px-4 py-2 mx-2 rounded-full ${
                  filter === "Today" ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`text-white ${
                    filter === "Today" ? "font-bold" : ""
                  }`}
                >
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter("All")}
                className={`px-4 py-2 mx-2 rounded-full ${
                  filter === "All" ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`text-white ${
                    filter === "All" ? "font-bold" : ""
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>
            </View>

            {filteredData.length === 0 ? (
              <View className="flex gap-4 top-2 justify-center items-center">
                <Image
                  source={require("../assets/no-alarm.png")}
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
                <Text
                  style={{ fontSize: 12, color: "#0007", fontWeight: "600" }}
                >
                  No alerts at the moment!
                </Text>
              </View>
            ) : (
              <Animated.FlatList
                ref={flatListRef}
                showsVerticalScrollIndicator={false}
                data={filteredData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  const inputRange = [-1, 0, index * 100, (index + 1) * 100];
                  const scale = scrollY.interpolate({
                    inputRange,
                    outputRange: [1, 1, 1, 0.95], // Add subtle scaling
                    extrapolate: "clamp",
                  });
                  const opacity = scrollY.interpolate({
                    inputRange,
                    outputRange: [1, 1, 1, 0.8], // Adjusted to fade slightly
                    extrapolate: "clamp",
                  });

                  return (
                    <Animated.View
                      style={{
                        transform: [{ scale }],
                        opacity,
                        height: 130,
                        width: "auto",
                        borderRadius: 10,
                        padding: 15,
                        backgroundColor: "#fff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        shadowColor: "#0007",
                        shadowOffset: { width: 3, height: 3 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      }}
                    >
                      <View className="flex flex-col justify-center">
                        <Ionicons
                          className="flex justify-center align-middle"
                          name="warning"
                          size={64}
                          color={"#4A71C7"}
                        />
                        <Text className="text-center text-[#4A71C7]">
                          {item.sensorName}
                        </Text>
                      </View>
                      <View className="flex-1 flex-col justify-center text-center align-middle">
                        <Text
                          style={{
                            fontSize: 42,
                            color: "#4A71C7",
                            fontWeight: "900",
                            textAlign: "right",
                            paddingRight: 12,
                          }}
                        >
                          {item.intensityLevel}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#0007",
                            fontWeight: "600",
                            textAlign: "right",
                            paddingRight: 12,
                          }}
                        >
                          {item.alertMessage}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#0007",
                            fontWeight: "600",
                            textAlign: "right",
                            paddingRight: 12,
                          }}
                        >
                          {item.timestamp}
                        </Text>
                      </View>
                    </Animated.View>
                  );
                }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: true }
                )}
                contentContainerStyle={{ paddingBottom: 0 }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Home;
