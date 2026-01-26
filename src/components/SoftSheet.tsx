import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import { colors } from "../theme/colors";

const SHEET_OFFSCREEN_OFFSET = Dimensions.get("window").height;

interface SoftSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SoftSheet({ open, onClose, children }: SoftSheetProps) {
  const translateY = useRef(
    new Animated.Value(open ? 0 : SHEET_OFFSCREEN_OFFSET)
  ).current;
  const currentOffset = useRef(open ? 0 : SHEET_OFFSCREEN_OFFSET);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    const id = translateY.addListener(({ value }) => {
      currentOffset.current = value;
    });
    return () => {
      translateY.removeListener(id);
    };
  }, [translateY]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        Animated.spring(translateY, {
          toValue: 0,
          speed: 18,
          bounciness: 4,
          useNativeDriver: true,
        }).start(() => {
          currentOffset.current = 0;
        });
      });
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_OFFSCREEN_OFFSET,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        currentOffset.current = SHEET_OFFSCREEN_OFFSET;
        if (finished) {
          timeout = setTimeout(() => setIsVisible(false), 20);
        }
      });
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [open, translateY]);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SHEET_OFFSCREEN_OFFSET],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          currentOffset.current = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldClose =
          gestureState.dy > 140 ||
          gestureState.vy > 1 ||
          currentOffset.current > SHEET_OFFSCREEN_OFFSET * 0.35;

        if (shouldClose) {
          Animated.timing(translateY, {
            toValue: SHEET_OFFSCREEN_OFFSET,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            onClose();
            setIsVisible(false);
            translateY.setValue(SHEET_OFFSCREEN_OFFSET);
            currentOffset.current = SHEET_OFFSCREEN_OFFSET;
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            speed: 18,
            bounciness: 4,
            useNativeDriver: true,
          }).start(() => {
            currentOffset.current = 0;
          });
        }
      },
    })
  ).current;

  if (!isVisible && !open) {
    return null;
  }

  return (
    <View
      pointerEvents={isVisible ? "auto" : "none"}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose}>
          <BlurView
            tint="light"
            intensity={30}
            style={StyleSheet.absoluteFill}
          />
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    height: "85%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -8 },
      },
      android: {
        elevation: 24,
      },
    }),
  },
  handleArea: {
    paddingVertical: 10,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.lightGray,
  },
});
