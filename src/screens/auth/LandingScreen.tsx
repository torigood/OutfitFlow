// src/screens/auth/LandingScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Sparkles, Cloud, Shirt, ArrowRight, Globe } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../localization/i18n";

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword?: undefined;
};
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { language, setLanguage } = useLanguage();

  // mobile-only fixed sizes
  const heroTitleSize = 44;
  const heroSubtitleSize = 18;

  const featuresData = useMemo(
    () => [
      {
        Icon: Sparkles,
        title: t("landingFeature1Title"),
        description: t("landingFeature1Description"),
      },
      {
        Icon: Cloud,
        title: t("landingFeature2Title"),
        description: t("landingFeature2Description"),
      },
      {
        Icon: Shirt,
        title: t("landingFeature3Title"),
        description: t("landingFeature3Description"),
      },
    ],
    [language]
  );

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ko" : "en");
  };

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

  useEffect(() => {
    const timer = setInterval(onCardPress, 5000);
    return () => clearInterval(timer);
  }, [cardIndex, featuresData.length]);

return (
    <SafeAreaView style={styles.container}>
      {/* 배경은 깔끔한 화이트 톤 유지 */}
      <View style={styles.bgFill} />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Sparkles size={24} color={colors.brand} />
          <Text style={styles.logoText}>OutfitFlow</Text>
        </View>
        <Pressable onPress={toggleLanguage} style={styles.langButton}>
          <Globe size={18} color={colors.textSecondary} />
          <Text style={styles.langText}>
            {language === "en" ? "EN" : "KR"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* 히어로 섹션 */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {"Find Your\nPerfect Style"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t("landingHeroSubtitle") || "AI가 제안하는 나만의 맞춤 코디"}
          </Text>
        </View>

        {/* 기능 카드 슬라이더 (심플하게 변경) */}
        <View style={styles.cardContainer}>
          <Pressable onPress={onCardPress} style={styles.featureCard}>
            {(() => {
              const f = featuresData[cardIndex];
              const Icon = f.Icon;
              return (
                <Animated.View
                  style={[
                    styles.cardInner,
                    { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Icon size={32} color={colors.brand} />
                  </View>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.description}</Text>
                </Animated.View>
              );
            })()}
          </Pressable>

          {/* 인디케이터 */}
          <View style={styles.indicatorRow}>
            {featuresData.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicatorDot,
                  i === cardIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* 하단 버튼 영역 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.primaryButtonText}>{t("landingCTA")}</Text>
          <ArrowRight size={20} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.secondaryButtonText}>
            {t("landingLogin") || "로그인"}
          </Text>
        </TouchableOpacity>

        {/*<View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("landingFooterText")}
            <Text style={styles.linkText}> {t("landingFooterLink")}</Text>
          </Text>
        </View>*/}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  bgFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  langText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 50,
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  featureCard: {
    width: "100%",
    aspectRatio: 1.1, // 정사각형에 가깝게
    backgroundColor: colors.bgSecondary,
    borderRadius: 32,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    // Android
    elevation: 2,
  },
  cardInner: {
    alignItems: "center",
    padding: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  featureDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  indicatorRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  indicatorActive: {
    width: 20,
    backgroundColor: colors.brand,
  },
  bottomSection: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 0 : 24,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  linkText: {
    fontWeight: "600",
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
});