import {
  View,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import ShimmeringText, { ShimmeringTextProps } from "./ShimmeringText";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 240,
  mass: 0.4,
};

const WIDTH = 50;

export interface SlideButtonProps {
  belowText?: string;
  aboveText?: string;
  finalText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  completed?: SharedValue<boolean>;
  shimmerTextProps?: ShimmeringTextProps;
  color?: string;
  handleColor?: string;
  fillColor?: `#${string}`;
  baseColor?: string;
  hold?: SharedValue<boolean>;
  progress?: SharedValue<number>;
}

export default function SlideButton({
  belowText = "Slide to submit",
  aboveText = "Confirm submit",
  finalText = "Success",
  startIcon,
  endIcon,
  style,
  completed: _completed,
  shimmerTextProps,
  color = "#fff",
  handleColor = "grey",
  baseColor = "grey",
  fillColor = "#1A1A1A",
  hold,
  progress: _progress,
}: SlideButtonProps) {
  const height = useSharedValue(0);
  const width = useSharedValue(0);
  const pressed = hold || useSharedValue<boolean>(false);
  const offset = useSharedValue<number>(0);
  const completed = _completed || useSharedValue<boolean>(false);

  const visibleWidth = useDerivedValue(() => {
    return width.value - height.value;
  });

  const progress = useDerivedValue(() => {
    return Math.max(
      0,
      height.value + Math.min(visibleWidth.value, offset.value)
    );
  });

  useAnimatedReaction(
    () => completed.value,
    (completed) => {
      if (!completed) {
        offset.value = withSpring(0, SPRING_CONFIG);
      }
    }
  );

  useAnimatedReaction(
    () => progress.value,
    (progress, prev) => {
      if (progress !== prev && _progress) {
        const percentage = (progress - height.value) / visibleWidth.value;
        _progress.value = Math.min(Math.max(percentage, 0), 1);
      }
    }
  );

  const onLayout = (event: {
    nativeEvent: { layout: { height: number; width: number } };
  }) => {
    width.value = event.nativeEvent.layout.width;
    height.value = event.nativeEvent.layout.height;
  };

  const animatedPressableStyle = useAnimatedStyle(() => ({
    right: width.value - progress.value,
  }));

  const animatedHandleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(
          pressed.value ? 0.9 : completed.value ? 0.8 : 1,
          SPRING_CONFIG
        ),
      },
    ],
  }));

  const animatedSliderStyle = useAnimatedStyle(() => ({
    width: progress.value,
  }));

  const pan = Gesture.Pan()
    .onBegin(() => {
      if (completed.value) return;
      pressed.value = true;
    })
    .onChange((event) => {
      if (completed.value) return;
      offset.value = Math.max(0, event.translationX);
    })
    .onFinalize(() => {
      pressed.value = false;

      if (progress.value >= width.value) {
        completed.value = true;
        return;
      }
      offset.value = withSpring(0, SPRING_CONFIG);
    });

  const animatedIconBeforeStyle = useAnimatedStyle(() => {
    const factor = progress.value - height.value;
    return {
      opacity: interpolate(factor, [0, visibleWidth.value / 2], [1, 0]),
    };
  });

  const animatedIconAfterStyle = useAnimatedStyle(() => {
    const factor = progress.value - height.value;

    return {
      opacity: withSpring(
        completed.value
          ? 1
          : factor > visibleWidth.value / 4
          ? interpolate(
              factor,
              [(visibleWidth.value - WIDTH) / 2, visibleWidth.value],
              [0, 1]
            )
          : 0,
        SPRING_CONFIG
      ),
      transform: [
        {
          scale: withSpring(completed.value ? 1.1 : 1, SPRING_CONFIG),
        },
      ],
    };
  });

  const animatedTextAboveStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(completed.value ? 0 : 1, {
        ...SPRING_CONFIG,
        mass: 0.2,
      }),
    };
  });

  const animatedTextFinalStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(completed.value ? 1 : 0, SPRING_CONFIG),
    };
  });

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: baseColor }, style]}
      onLayout={onLayout}
    >
      <ShimmeringText
        text={belowText || ""}
        style={{ width: "100%" }}
        textStyle={{
          fontSize: 16,
        }}
        speed={3500}
        {...shimmerTextProps}
      />
      <MaskedView
        style={styles.maskedView}
        maskElement={
          <Animated.View
            style={[
              {
                flex: 1,
                height: "100%",
                borderRadius: WIDTH,
                backgroundColor: "black",
              },
              animatedSliderStyle,
            ]}
          />
        }
        androidRenderingMode="software"
      >
        <ThemedView>
          <View
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: fillColor,
            }}
          >
            <Animated.View style={[styles.float, animatedTextAboveStyle]}>
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color,
                  fontSize: 16,
                }}
              >
                {aboveText || ""}
              </ThemedText>
            </Animated.View>
            <Animated.View style={[styles.float, animatedTextFinalStyle]}>
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color,
                  fontSize: 17,
                }}
              >
                {finalText}
              </ThemedText>
            </Animated.View>
            <GestureDetector gesture={pan}>
              <AnimatedPressable
                style={[styles.handle, animatedPressableStyle]}
              >
                <LinearGradient
                  colors={[fillColor + "00", fillColor]}
                  style={styles.overlay}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  locations={[0, 0.5]}
                />
                <Animated.View
                  style={[
                    {
                      flex: 1,
                      backgroundColor: handleColor,
                      borderRadius: WIDTH,
                      aspectRatio: 1,
                      margin: 4,
                    },
                    animatedHandleStyle,
                  ]}
                >
                  {startIcon && (
                    <Animated.View
                      style={[styles.float, animatedIconBeforeStyle]}
                    >
                      {startIcon}
                    </Animated.View>
                  )}
                  {endIcon && (
                    <Animated.View
                      style={[styles.float, animatedIconAfterStyle]}
                    >
                      {endIcon}
                    </Animated.View>
                  )}
                </Animated.View>
              </AnimatedPressable>
            </GestureDetector>
            <LinearGradient
              colors={["#ffffff20", fillColor + "00", "#00000010"]}
              style={[styles.overlay]}
            />
          </View>
        </ThemedView>
      </MaskedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    height: 54,
    borderRadius: WIDTH,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  maskedView: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
  },
  handle: {
    position: "absolute",
    height: "100%",
    borderRadius: WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: WIDTH,
    overflow: "hidden",
    pointerEvents: "none",
  },
  float: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
