// src/screens/auth/LandingScreen.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  useWindowDimensions,
  Platform,
  SafeAreaView,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Sparkles, Cloud, Shirt, ArrowRight } from "lucide-react-native";

const AnimatedArrow = Animated.createAnimatedComponent(ArrowRight as any);

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword?: undefined;
};
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const isLarge = width >= 900;

  // compute sizes inside component to avoid TS/IDE red lines
  const heroTitleSize = isLarge ? 84 : 44;
  const heroSubtitleSize = isLarge ? 22 : 18;
  const cardWidth = isLarge ? 340 : Math.min(520, width - 40);

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

    const a1 = loop(blob1, isLarge ? 140 : 120, isLarge ? 40 : 40, 20000);
    const a2 = loop(blob2, isLarge ? -140 : -100, isLarge ? 120 : 100, 15000);
    const a3 = loop(blob3, isLarge ? 80 : 60, isLarge ? -80 : -60, 18000);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [blob1, blob2, blob3, isLarge]);

  // features & advantages
  const features = [
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
  const advantages = [
    {
      Icon: "🤖",
      title: "AI 스타일리스트",
      description:
        "Google Gemini AI가 당신의 개인 스타일리스트가 되어 최적의 코디를 추천합니다",
    },
    {
      Icon: "🎨",
      title: "날씨 기반 추천",
      description:
        "실시간 날씨 정보를 반영한 현명한 옷차림으로 완벽한 하루를 시작하세요",
    },
    {
      Icon: "👔",
      title: "간편한 옷장 관리",
      description:
        "AI가 당신의 옷을 쉽게 분류해 줍니다. 사진만 찍으면 옷 종류를 자동으로 분류합니다",
    },
  ];

  // interactions
  const loginHighlightOpacity = useRef(new Animated.Value(0)).current;
  const handleLoginEnter = () =>
    Animated.timing(loginHighlightOpacity, {
      toValue: 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  const handleLoginLeave = () =>
    Animated.timing(loginHighlightOpacity, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();

  const arrowX = useRef(new Animated.Value(0)).current;
  const arrowEnter = () =>
    Animated.timing(arrowX, {
      toValue: 8,
      duration: 180,
      useNativeDriver: true,
    }).start();
  const arrowLeave = () =>
    Animated.timing(arrowX, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();

  // FeatureCard component
  const FeatureCard: React.FC<{
    Icon: any;
    title: string;
    description: string;
  }> = ({ Icon, title, description }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const onEnter = () =>
      Animated.timing(scale, {
        toValue: 1.03,
        duration: 160,
        useNativeDriver: true,
      }).start();
    const onLeave = () =>
      Animated.timing(scale, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    return (
      <Pressable
        onPress={() => {}}
        onHoverIn={onEnter}
        onHoverOut={onLeave}
        onPressIn={onEnter}
        onPressOut={onLeave}
      >
        <Animated.View style={[styles.featureCard, { transform: [{ scale }] }]}>
          <Icon size={36} color="#6366F1" />
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  // AdvantageCard component
  const AdvantageCard: React.FC<{
    Icon?: any;
    title: string;
    description: string;
  }> = ({ Icon, title, description }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const onEnter = () =>
      Animated.timing(scale, {
        toValue: 1.02,
        duration: 140,
        useNativeDriver: true,
      }).start();
    const onLeave = () =>
      Animated.timing(scale, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }).start();

    const renderIcon = () => {
      if (!Icon) return null;
      if (typeof Icon === "string")
        return <Text style={styles.advantageEmoji}>{Icon}</Text>;
      const IconComp = Icon;
      return <IconComp size={28} color="#111827" style={{ marginRight: 12 }} />;
    };

    return (
      <Pressable
        onHoverIn={onEnter}
        onHoverOut={onLeave}
        onPressIn={onEnter}
        onPressOut={onLeave}
      >
        <Animated.View
          style={[styles.advantageCard, { transform: [{ scale }] }]}
        >
          {renderIcon()}
          <View style={styles.advantageContent}>
            <Text style={styles.advantageTitle}>{title}</Text>
            <Text style={styles.advantageDescription}>{description}</Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  // Web-only blur: use CSS filter on blobs wrapper; Native: duplicate bigger faint blobs already used for blur-like look
  const blobsWrapperWebStyle =
    Platform.OS === "web"
      ? ({ filter: "blur(12px)", WebkitFilter: "blur(12px)" } as any)
      : {};

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FBFBFF", "#F8F2FB"]}
        style={StyleSheet.absoluteFill}
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(220,230,255,0.05)", zIndex: 0 },
        ]}
      />

      {/* BLOBS LAYER */}
      <View
        pointerEvents="none"
        style={[styles.blobsWrapper, blobsWrapperWebStyle]}
      >
        {/* Blob duplicates & main blobs (same technique as before) */}
        <Animated.View
          style={[
            styles.blobBase,
            Platform.OS !== "web" ? styles.blobBlurDuplicate : {},
            {
              backgroundColor: "#D8E6FF",
              left: isLarge ? 80 : 40,
              top: isLarge ? 120 : 80,
              width: isLarge ? 640 : 420,
              height: isLarge ? 640 : 420,
              borderRadius: isLarge ? 320 : 210,
              transform: [{ translateX: blob1.x }, { translateY: blob1.y }],
              opacity: Platform.OS === "web" ? 0.9 : 0.45,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blobBase,
            {
              backgroundColor: "#DCE6FF",
              left: isLarge ? 120 : 60,
              top: isLarge ? 160 : 100,
              width: isLarge ? 560 : 360,
              height: isLarge ? 560 : 360,
              borderRadius: isLarge ? 280 : 180,
              transform: [{ translateX: blob1.x }, { translateY: blob1.y }],
              opacity: Platform.OS === "web" ? 0.95 : 0.85,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.blobBase,
            Platform.OS !== "web" ? styles.blobBlurDuplicate : {},
            {
              backgroundColor: "#F6EEFF",
              right: isLarge ? 80 : 40,
              top: isLarge ? 160 : 160,
              width: isLarge ? 600 : 420,
              height: isLarge ? 600 : 420,
              borderRadius: isLarge ? 300 : 210,
              transform: [{ translateX: blob2.x }, { translateY: blob2.y }],
              opacity: Platform.OS === "web" ? 0.9 : 0.42,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blobBase,
            {
              backgroundColor: "#F2E6FF",
              right: isLarge ? 120 : 60,
              top: isLarge ? 200 : 180,
              width: isLarge ? 520 : 360,
              height: isLarge ? 520 : 360,
              borderRadius: isLarge ? 260 : 180,
              transform: [{ translateX: blob2.x }, { translateY: blob2.y }],
              opacity: Platform.OS === "web" ? 0.9 : 0.78,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.blobBase,
            Platform.OS !== "web" ? styles.blobBlurDuplicate : {},
            {
              backgroundColor: "#EEF0FF",
              left: isLarge ? width / 3 : width / 3,
              bottom: isLarge ? -80 : -40,
              width: isLarge ? 520 : 420,
              height: isLarge ? 520 : 420,
              borderRadius: isLarge ? 260 : 210,
              transform: [{ translateX: blob3.x }, { translateY: blob3.y }],
              opacity: Platform.OS === "web" ? 0.88 : 0.4,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blobBase,
            {
              backgroundColor: "#EDEFFF",
              left: isLarge ? width / 3 + 40 : width / 3 + 20,
              bottom: isLarge ? -40 : -30,
              width: isLarge ? 420 : 360,
              height: isLarge ? 420 : 360,
              borderRadius: isLarge ? 210 : 180,
              transform: [{ translateX: blob3.x }, { translateY: blob3.y }],
              opacity: Platform.OS === "web" ? 0.88 : 0.7,
            },
          ]}
        />
      </View>

      {/* CONTENT (above blobs) */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[styles.header, { paddingHorizontal: isLarge ? 140 : 28 }]}
        >
          <View style={styles.logoRow}>
            <LinearGradient
              colors={["#6366F1", "#9333EA"]}
              style={[
                styles.logoIcon,
                isLarge ? { width: 52, height: 52, borderRadius: 14 } : {},
              ]}
            >
              <Sparkles size={isLarge ? 22 : 18} color="#fff" />
            </LinearGradient>
            <Text style={[styles.logoText, { marginLeft: isLarge ? 16 : 12 }]}>
              OutfitFlow
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            onHoverIn={handleLoginEnter}
            onHoverOut={handleLoginLeave}
            onPressIn={handleLoginEnter}
            onPressOut={handleLoginLeave}
            style={{ borderRadius: 8 }}
          >
            <View style={styles.loginInner}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.loginHighlightOverlay,
                  { opacity: loginHighlightOpacity },
                ]}
              />
              <Text style={styles.loginText}>로그인</Text>
            </View>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={[styles.heroWrap, { paddingTop: isLarge ? 60 : 28 }]}>
          <Text style={[styles.heroTitle, { fontSize: heroTitleSize }]}>
            OutfitFlow
          </Text>
          <Text style={[styles.heroSubtitle, { fontSize: heroSubtitleSize }]}>
            AI가 추천하는 나만의 스타일
          </Text>

          {/* Feature cards */}
          <View
            style={[
              styles.cardsContainer,
              isLarge ? styles.cardsRow : styles.cardsCol,
            ]}
          >
            {features.map((f, idx) => (
              <View
                key={idx}
                style={{
                  width: cardWidth,
                  paddingHorizontal: isLarge ? 12 : 0,
                }}
              >
                <FeatureCard
                  Icon={f.Icon}
                  title={f.title}
                  description={f.description}
                />
              </View>
            ))}
          </View>

          {/* CTA */}
          <Pressable
            onPress={() => navigation.navigate("Signup")}
            onHoverIn={arrowEnter}
            onHoverOut={arrowLeave}
            onPressIn={arrowEnter}
            onPressOut={arrowLeave}
          >
            <LinearGradient
              colors={["#6366F1", "#9333EA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>시작하기</Text>
              <AnimatedArrow
                size={18}
                color="#fff"
                style={{ marginLeft: 10, transform: [{ translateX: arrowX }] }}
              />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Advantages */}
        <View style={styles.advantages}>
          <Text style={styles.advHeading}>OutfitFlow로 볼 수 있는 것</Text>
          {advantages.map((a, i) => (
            <AdvantageCard
              key={i}
              Icon={a.Icon}
              title={a.title}
              description={a.description}
            />
          ))}
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
  scroll: { paddingBottom: 80 },

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  loginInner: {
    position: "relative",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  loginHighlightOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    zIndex: 0,
  },
  loginText: { zIndex: 1, color: "#374151", fontSize: 16 },

  heroWrap: { zIndex: 10, alignItems: "center", paddingHorizontal: 24 },
  heroTitle: {
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: { color: "#6B7280", marginBottom: 28 },

  cardsContainer: { width: "100%", marginBottom: 24 },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 36,
    gap: 18,
  },
  cardsCol: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },

  featureCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 28,
    paddingHorizontal: 22,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
      web: { boxShadow: "0 8px 24px rgba(15,23,42,0.06)" },
    }),
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
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
      web: { boxShadow: "0 18px 40px rgba(99,102,241,0.12)" },
    }),
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  advantages: { paddingHorizontal: 24, paddingTop: 48, zIndex: 10 },
  advHeading: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0f172a",
  },
  advantageCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0 6px 18px rgba(15,23,42,0.06)" },
    }),
  },
  advantageEmoji: { fontSize: 30, marginRight: 12 },
  advantageContent: { flex: 1 },
  advantageTitle: { fontWeight: "700", marginBottom: 6, color: "#0f172a" },
  advantageDescription: { color: "#6B7280", fontSize: 14, lineHeight: 20 },

  footer: { alignItems: "center", marginTop: 28, paddingBottom: 48 },
  footerText: { color: "#9CA3AF" },
  footerLink: { color: "#6366F1", marginTop: 6, fontWeight: "600" },
});
