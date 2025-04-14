import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWindowDimensions } from "react-native";
import { database, ref, onValue, off } from "../firebase";
import { useStore } from "../store";
import Offline from "./Offline";
import AntDesign from "@expo/vector-icons/AntDesign";

const Data = () => {
  const { currentSensor } = useStore();
  const store = useStore();
  const { width: screenWidth } = useWindowDimensions();

  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0 });
  const [pga, setPGA] = useState(0);
  const [isOffline, setIsOffline] = useState(true);
  const countdownRef = useRef(null);

  const resetCountdown = useCallback(() => {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setIsOffline(false);
  }, []);

  useEffect(() => {
    store.setXAxisData((prev) => [...prev.slice(-50), sensorData.x]);
    store.setYAxisData((prev) => [...prev.slice(-50), sensorData.y]);
    store.setZAxisData((prev) => [...prev.slice(-50), sensorData.z]);
  }, [sensorData]);

  useEffect(() => {
    const sensorRef = ref(database, `SENSOR/${currentSensor}/earthquake1`);

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const newData = {
          x: isFinite(parseFloat(data.xValue)) ? parseFloat(data.xValue) : 0,
          y: isFinite(parseFloat(data.yValue)) ? parseFloat(data.yValue) : 0,
          z: isFinite(parseFloat(data.zValue)) ? parseFloat(data.zValue) : 0,
          pga: isFinite(parseFloat(data.pga)) ? parseFloat(data.pga) : 0,
        };

        setPGA(newData.pga);

        if (
          newData.x === sensorData.x &&
          newData.y === sensorData.y &&
          newData.z === sensorData.z &&
          newData.pga === pga
        ) {
          if (!countdownRef.current) {
            countdownRef.current = setTimeout(() => setIsOffline(true), 10000);
          }
        } else {
          resetCountdown();
          setSensorData({ x: newData.x, y: newData.y, z: newData.z });
        }
      }
    });

    return () => {
      off(sensorRef);
      resetCountdown();
    };
  }, [currentSensor, sensorData, pga, resetCountdown]);

  const handleOpenLink = useCallback(() => {
    Linking.openURL("https://ibems.netlify.app/").catch((err) =>
      console.error("Error opening URL", err)
    );
  }, []);

  if (isOffline) {
    return <Offline />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="p-5 flex flex-row justify-between items-center">
          <Image
            source={require("../assets/building.png")}
            style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }}
            resizeMode="contain"
          />
          <View className="p-4 rounded-2xl justify-center items-center bg-[#4A71C7] shadow-lg w-1/2">
            <Text className="text-white text-lg font-bold">PGA</Text>
            <Text className="text-white text-xl font-bold mb-2">
              {pga.toFixed(4)}
            </Text>
            <Text className="text-white text-xs">acceleration (g)</Text>
          </View>
        </View>

        <View className="px-4 space-y-3">
          {["X", "Y", "Z"].map((axis) => (
            <View
              key={axis}
              className="p-4 rounded-2xl flex flex-row justify-between items-center bg-[#4A71C7] shadow-md"
            >
              <View>
                <Text className="text-white text-lg font-bold">
                  {axis} - Axis
                </Text>
                <Text className="text-white text-xs">
                  {axis === "X"
                    ? "East-West"
                    : axis === "Y"
                    ? "North-South"
                    : "Up-Down"}
                </Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {sensorData[axis.toLowerCase()].toFixed(4)}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            className="flex-row items-center justify-center h-14 bg-[#4A71C7] rounded-full shadow-lg mt-4"
            onPress={handleOpenLink}
          >
            <Text className="text-sm font-medium text-white mr-2">
              View Graph
            </Text>
            <AntDesign name="arrowright" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Data;
