// src/screens/auth/LandingScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  SafeAreaView,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Sparkles, Cloud, Shirt, ArrowRight } from "lucide-react-native";

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword?: undefined;
};
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();

  // mobile-only fixed sizes
  const heroTitleSize = 44;
  const heroSubtitleSize = 18;

  // animated blobs values
  const blob1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const blob2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const blob3 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    const loop = (v: Animated.ValueXY, dx: number, dy: number, dur = 18000) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: { x: dx, y: dy },
            duration: dur,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: { x: 0, y: 0 },
            duration: dur,
            useNativeDriver: true,
          }),
        ])
      );

    // Mobile-only blob animations
    const a1 = loop(blob1, 120, 40, 20000);
    const a2 = loop(blob2, -100, 100, 15000);
    const a3 = loop(blob3, 60, -60, 18000);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [blob1, blob2, blob3]);

  const featuresData = [
    {
      Icon: Sparkles,
      title: "AI 코디 추천",
      description: "날씨와 TPO에 맞는\n완벽한 옷차림을 추천합니다",
    },
    {
      Icon: Cloud,
      title: "실시간 날씨 기반",
      description: "현재 날씨를 고려한\n스마트한 옷 추천",
    },
    {
      Icon: Shirt,
      title: "스마트 옷장 관리",
      description: "내 옷을 쉽게 보관하고\n효율적으로 활용하세요",
    },
  ];

  const CARD_HEIGHT = 320; // 필요하면 조절
  const CARD_SPACING = 16;

  const [cardIndex, setCardIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onCardPress = () => {
    // 축소 피드백 후 다음 카드로
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const next = cardIndex + 1 < featuresData.length ? cardIndex + 1 : 0; // 루프(멈추게 하려면 조건 변경)
      setCardIndex(next);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FBFBFF", "#F8F2FB"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(220,230,255,0.05)", zIndex: 0 },
        ]}
      />

      {/* BLOBS LAYER */}
      <View pointerEvents="none" style={styles.blobsWrapper}>
        {/* Blob duplicates & main blobs */}
        <Animated.View
          style={[
            styles.blobBase,
            styles.blobBlurDuplicate,
            {
              backgroundColor: "#D8E6FF",
              left: 40,
              top: 80,
              width: 420,
              height: 420,
              borderRadius: 210,
              transform: [{ translateX: blob1.x }, { translateY: blob1.y }],
              opacity: 0.45,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blobBase,
            {
              backgroundColor: "#DCE6FF",
              left: 60,
              top: 100,
              width: 360,
              height: 360,
              borderRadius: 180,
              transform: [{ translateX: blob1.x }, { translateY: blob1.y }],
              opacity: 0.85,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.blobBase,
            styles.blobBlurDuplicate,
            {
              backgroundColor: "#e8d4ffff",
              right: 40,
              top: 160,
              width: 420,
              height: 420,
              borderRadius: 210,
              transform: [{ translateX: blob2.x }, { translateY: blob2.y }],
              opacity: 0.42,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blobBase,
            {
              backgroundColor: "#ffe6e6ff",
              right: 60,
              top: 180,
              width: 360,
              height: 360,
              borderRadius: 180,
              transform: [{ translateX: blob2.x }, { translateY: blob2.y }],
              opacity: 0.78,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.blobBase,
            styles.blobBlurDuplicate,
            {
              backgroundColor: "#EEF0FF",
              left: "30%",
              bottom: -40,
              width: 420,
              height: 420,
              borderRadius: 210,
              transform: [{ translateX: blob3.x }, { translateY: blob3.y }],
              opacity: 0.4,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blobBase,
            {
              backgroundColor: "#EDEFFF",
              left: "35%",
              bottom: -30,
              width: 360,
              height: 360,
              borderRadius: 180,
              transform: [{ translateX: blob3.x }, { translateY: blob3.y }],
              opacity: 0.7,
            },
          ]}
        />
      </View>

      {/* CONTENT (above blobs) */}
      <ScrollView
        style={{ flex: 1, zIndex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={["#a3a5ffff", "#b268f7ff"]}
              style={styles.logoIcon}
            >
              <Sparkles size={20} color="#fcff59ff" />
            </LinearGradient>
            <Text style={styles.logoText}>OutfitFlow</Text>
          </View>

          <Pressable onPress={() => navigation.navigate("Login")}>
            <View style={styles.loginButton}>
              <Text style={styles.loginText}>로그인</Text>
            </View>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.heroWrap}>
          <Text style={[styles.heroTitle, { fontSize: heroTitleSize }]}>
            OutfitFlow
          </Text>
          <Text style={[styles.heroSubtitle, { fontSize: heroSubtitleSize }]}>
            AI가 추천하는 나만의 스타일
          </Text>

          {/* Feature cards */}
          <View style={[styles.cardsContainer, styles.cardsCol]}>
            <Animated.View
              style={{
                width: "88%",
                height: CARD_HEIGHT,
                alignSelf: "center",
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Pressable
                onPress={onCardPress}
                android_ripple={{ color: "rgba(0,0,0,0.04)" }}
                style={{ flex: 1 }}
              >
                <View style={styles.featureCard}>
                  {(() => {
                    const f = featuresData[cardIndex];
                    const Icon = f.Icon;
                    return (
                      <>
                        <Icon size={36} color="#8a8cffff" />
                        <Text style={styles.featureTitle}>{f.title}</Text>
                        <Text style={styles.featureDescription}>
                          {f.description}
                        </Text>
                      </>
                    );
                  })()}
                </View>
              </Pressable>
            </Animated.View>

            {/* 인디케이터 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              {featuresData.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === cardIndex ? 20 : 8, // 활성일 때 더 길게
                    height: 8,
                    borderRadius: 8,
                    backgroundColor:
                      i === cardIndex ? "#6366F1" : "rgba(99,102,241,0.18)", // 비활성 투명도 낮춤
                    opacity: i === cardIndex ? 1 : 0.9, // 약간 투명 추가
                    transform: [{ scale: i === cardIndex ? 1 : 0.95 }], // 미세한 크기 차
                  }}
                />
              ))}
            </View>
          </View>

          {/* CTA */}
          <Pressable onPress={() => navigation.navigate("Signup")}>
            <LinearGradient
              colors={["#a3a5ffff", "#b268f7ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>시작하기</Text>
              <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </Pressable>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>로그인하기 →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFBFF" },
  scroll: { paddingBottom: 20 },

  // blobs wrapper
  blobsWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  blobBase: { position: "absolute", zIndex: 0 },
  blobBlurDuplicate: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
      },
      android: { elevation: 0.5 },
    }),
  },

  header: {
    zIndex: 10,
    marginTop: 20,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    marginLeft: 12,
    fontSize: 25,
    fontWeight: "600",
    color: "#0f172a",
  },

  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  loginText: { color: "#374151", fontSize: 16, fontWeight: "500" },

  heroWrap: {
    zIndex: 10,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    width: "100%",
  },
  heroTitle: {
    fontWeight: "400",
    color: "#0f172a",
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: { color: "#6B7280", marginBottom: 28 },

  cardsContainer: {
    width: "100%",
    height: 360,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsCol: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
  },

  featureCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 1,
    paddingVertical: 50,
    paddingHorizontal: 22,
    zIndex: 10,
    maxWidth: 280,
    minHeight: 220,
    ...Platform.select({
      ios: {
        shadowColor: "#d0b7ffff",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
    alignItems: "center",
  },
  featureDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 30,
    alignItems: "center",
  },

  cta: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
      },
      android: { elevation: 8 },
    }),
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  advantages: {
    paddingHorizontal: 24,
    paddingTop: 48,
    zIndex: 10,
    alignItems: "center",
    width: "100%",
  },
  advHeading: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "400",
    marginBottom: 12,
    color: "#0f172a",
  },
  advantageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    zIndex: 10,
    maxWidth: 900,
    maxHeight: 120,
    minHeight: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  advantageEmoji: { fontSize: 30, marginRight: 12 },
  advantageContent: { flex: 1 },
  advantageTitle: {
    fontSize: 18,
    marginBottom: 6,
    color: "#0f172a",
  },
  advantageDescription: { color: "#6B7280", fontSize: 16, lineHeight: 20 },

  footer: {
    alignItems: "center",
    marginTop: 28,
    paddingBottom: 48,
    width: "100%",
  },
  footerText: { fontSize: 16, color: "#9CA3AF" },
  footerLink: { color: "#6366F1", marginTop: 6, fontWeight: "600" },
});
