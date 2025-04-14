import React, { memo } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ImageBackground,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  useAnimatedStyle,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const About = () => {
  const scrollX = useSharedValue(0);

  const images = [
    "https://www.cnet.com/a/img/resize/8f79d676153c693c55da3262776e54596040c897/hub/2024/09/30/a6dedeae-e78f-4624-b9e3-ea7a8bd6bfc6/emergency-backpack-equipement-gettyimages-1884796757.jpg?auto=webp&fit=crop&height=675&width=1200",
    "https://survivorinsiders.com/wp-content/uploads/2024/04/10_Ways_To_Survive_An_Earthquake-828x552.jpg",
    "https://www.hstoday.us/wp-content/uploads/2019/10/1000w_q95-2019-10-17T003717.741.jpg",
    "https://www.longbeach.gov/globalassets/disaster-preparedness/media-library/images/disaster-preparedness/family-communication-plan.jpg",
  ];

  const descriptions = [
    "Prepare an Emergency Kit",
    "Identify Safe Spots",
    "Practice 'Drop, Cover, and Hold On'",
    "Have a Communication Plan",
  ];

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Background Image */}
      <ImageBackground
        source={require("../assets/urs_building2.jpg")}
        style={styles.backgroundImage}
        blurRadius={1.5}
        resizeMode="cover"
      />

      <Animated.ScrollView
        horizontal
        pagingEnabled
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {images.map((image, index) => (
          <Animated.View key={index} style={styles.imageContainer}>
            <Text style={styles.description}>{descriptions[index]}</Text>
            <AnimatedImage uri={image} index={index} scrollX={scrollX} />
          </Animated.View>
        ))}
      </Animated.ScrollView>

      <DotIndicator images={images} scrollX={scrollX} />
    </View>
  );
};

const AnimatedImage = memo(({ uri, index, scrollX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.3, 0.8, 0.3],
      Extrapolate.CLAMP
    );

    const rotateY = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [20, 0, -20],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [-40, 0, 40],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { rotateY: `${rotateY}deg` }, { translateX }],
      opacity,
    };
  });

  return (
    <Animated.Image source={{ uri }} style={[styles.image, animatedStyle]} />
  );
});

const DotIndicator = memo(({ images, scrollX }) => {
  return (
    <View style={styles.dotIndicator}>
      {images.map((_, i) => {
        const animatedStyle = useAnimatedStyle(() => {
          const dotWidth = interpolate(
            scrollX.value,
            [(i - 1) * width, i * width, (i + 1) * width],
            [8, 16, 8],
            Extrapolate.CLAMP
          );

          return { width: dotWidth };
        });

        return <Animated.View key={i} style={[styles.dot, animatedStyle]} />;
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height,
    zIndex: -1, // Ensures the background stays behind all content
  },
  imageContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    top: -50,
  },
  image: {
    width: width * 1.1,
    height: height * 0.5,
    resizeMode: "cover",
    borderRadius: 15,
  },
  description: {
    color: "#4A71C7",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 40,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    width: 320,
  },
  dotIndicator: {
    flexDirection: "row",
    position: "absolute",
    bottom: 150,
    alignSelf: "center",
  },
  dot: {
    height: 5,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    marginHorizontal: 4,
    bottom: 50,
  },
});

export default About;
