import { View, Text, Image } from "react-native";
import React from "react";

const Offline = () => {
  return (
    <View className="flex-1 flex justify-center align-middle items-center">
      <Image
        className="-top-16"
        source={require("../assets/no-connection.png")}
        style={{ width: 128, height: 128 }}
        resizeMode="contain"
      />
      <Text className="text-xl font-medium text-[#0007]">System Offline!</Text>
    </View>
  );
};

export default Offline;
