import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import SlideButton, { SPRING_CONFIG } from "@/components/ui/SlideButton";
import { Check, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Index() {
  const { bottom } = useSafeAreaInsets();
  const completed = useSharedValue(false);
  const text = useThemeColor({}, "text");
  const handle = useThemeColor({}, "barColor");

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(completed.value ? 0.9 : 1, SPRING_CONFIG),
        },
      ],
    };
  });
  return (
    <ThemedView style={[styles.container, { paddingBottom: bottom + 24 }]}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Pressable onPress={() => (completed.value = false)}>
          <ThemedText>Reset </ThemedText>
        </Pressable>
      </View>
      <Animated.View style={[{ width: "95%" }, animatedStyle]}>
        <SlideButton
          startIcon={<ChevronRight color={text} />}
          endIcon={<Check color={text} strokeWidth={2.4} />}
          fillColor="#FFB656"
          handleColor={handle}
          baseColor={text + "10"}
          color="#000"
          aboveText="Unlocking..."
          finalText="Success!"
          shimmerTextProps={{
            text: "Slide to unlock",
            speed: 4000,
            color: text + "80",
          }}
          style={{
            height: 56,
          }}
          completed={completed}
        />
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 24,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
