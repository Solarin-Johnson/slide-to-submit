import { View, StyleProp, TextStyle, ViewStyle } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "../ThemedText";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export type ShimmeringTextProps = {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  speed?: number;
  size?: number;
  layerStyle?: StyleProp<ViewStyle>;
  color?: string;
};

export default function ShimmeringText({
  text,
  textStyle,
  style,
  speed = 3000,
  size = 60,
  layerStyle,
  color = "#ffffff90",
}: ShimmeringTextProps) {
  const translateX = useSharedValue<number>(0);

  const onLayout = (event: {
    nativeEvent: { layout: { width: number; x: number } };
  }) => {
    const { width, x } = event.nativeEvent.layout;
    translateX.value = withRepeat(
      withSequence(
        withTiming(width + x, { duration: speed }),
        withTiming(-size, { duration: 0 })
      ),
      -1,
      false
    );
  };

  const animatedSliderStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: size,
    height: "100%",
    left: translateX.value,
  }));

  return (
    <MaskedView
      style={[
        {
          width: "100%",
          height: 50,
        },
        style,
      ]}
      maskElement={
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <ThemedText
            onLayout={onLayout}
            style={[
              {
                fontSize: 30,
                fontWeight: "500",
              },
              textStyle,
              {
                color: "black",
              },
            ]}
            type="defaultSemiBold"
          >
            {text}
          </ThemedText>
        </View>
      }
    >
      <View
        style={[
          {
            backgroundColor: color,
            width: "100%",
            height: "100%",
            overflow: "hidden",
          },
          layerStyle,
        ]}
      >
        <AnimatedLinearGradient
          colors={["#ffffff00", "#ffffff", "#ffffff00"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[animatedSliderStyle]}
        />
      </View>
    </MaskedView>
  );
}
