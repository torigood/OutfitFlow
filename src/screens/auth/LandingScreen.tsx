// src/screens/auth/LandingScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Sparkles, Cloud, Shirt, ArrowRight } from "lucide-react-native";
import { colors } from "../../theme/colors";

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
      {/* Clean Warm Background Gradient */}
      <LinearGradient
        colors={[colors.bgTop, colors.bgBottom]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* CONTENT (above blobs) */}
      <ScrollView
        style={{ flex: 1, zIndex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[colors.brand, colors.brandLight]}
              style={styles.logoIcon}
            >
              <Sparkles size={20} color={colors.textOnDark} />
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
                        <Icon size={36} color={colors.glassLight} />
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
                    width: i === cardIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 8,
                    backgroundColor:
                      i === cardIndex ? colors.brandLight : `${colors.brand}30`,
                    opacity: i === cardIndex ? 1 : 0.9,
                    transform: [{ scale: i === cardIndex ? 1 : 0.95 }],
                  }}
                />
              ))}
            </View>
          </View>

          {/* CTA */}
          <Pressable onPress={() => navigation.navigate("Signup")}>
            <LinearGradient
              colors={[colors.brand, colors.brandLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>시작하기</Text>
              <ArrowRight
                size={18}
                color={colors.textOnDark}
                style={{ marginLeft: 8 }}
              />
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
  container: { flex: 1, backgroundColor: colors.bgTop },
  scroll: { paddingBottom: 20 },

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
    color: colors.textOnDark,
  },

  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.brandLight,
    borderRadius: 8,
  },
  loginText: { color: colors.textOnLight, fontSize: 16, fontWeight: "500" },

  heroWrap: {
    zIndex: 10,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    width: "100%",
  },
  heroTitle: {
    fontWeight: "400",
    color: colors.textOnDark,
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: { color: colors.textOnDark, marginBottom: 28, opacity: 0.9 },

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
    backgroundColor: colors.brandLight,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 1,
    paddingVertical: 50,
    paddingHorizontal: 22,
    zIndex: 10,
    maxWidth: 280,
    minHeight: 220,
    ...Platform.select({
      ios: {
        shadowColor: colors.brand,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textOnLight,
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
    alignItems: "center",
  },
  featureDescription: {
    fontSize: 16,
    color: colors.textOnDark,
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
        shadowColor: colors.brand,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  ctaText: { color: colors.textOnDark, fontWeight: "800", fontSize: 16 },

  footer: {
    alignItems: "center",
    marginTop: 28,
    paddingBottom: 48,
    width: "100%",
  },
  footerText: { fontSize: 16, color: colors.textOnDark, opacity: 0.8 },
  footerLink: { color: colors.textOnDark, marginTop: 6, fontWeight: "700" },
});
