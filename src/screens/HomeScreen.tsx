import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, Shirt, TrendingUp, ShoppingCart } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SoftCard, GlowTile } from "../components";
import { colors } from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";
import { getClothingItems } from "../services/wardrobeService";
import { ClothingItem } from "../types/wardrobe";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { t } from "../localization/i18n";
import { useLanguage } from "../contexts/LanguageContext";

type RootStackParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Community: undefined;
  AIRecommend: undefined;
  Shopping: undefined;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { language } = useLanguage();

  const pan = Gesture.Pan().onEnd((event) => {
    if (event.translationX < -60) {
      navigation.navigate("Wardrobe");
    }
  });

  useEffect(() => {
    if (!user?.uid) return;

    let isMounted = true;
    (async () => {
      try {
        const items: ClothingItem[] = await getClothingItems(user.uid);
        if (isMounted) setWardrobeCount(items.length);
      } catch (error) {
        console.error("옷장 불러오기 실패:", error);
        if (isMounted) setWardrobeCount(0);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <GestureDetector gesture={pan}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          key={language}
        >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("quickActions")}</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("AIRecommend")}
            >
              <GlowTile
                icon={<Sparkles size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>{t("aiRecommend")}</Text>
            </Pressable>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("Wardrobe")}
            >
              <GlowTile
                icon={<Shirt size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>{t("wardrobe")}</Text>
            </Pressable>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("Community")}
            >
              <GlowTile
                icon={<TrendingUp size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>{t("trends")}</Text>
            </Pressable>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("Shopping")}
            >
              <GlowTile
                icon={<ShoppingCart size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>{t("shopping")}</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("recentRecommendations")}</Text>
          <SoftCard>
            <View style={styles.emptyState}>
              <Sparkles size={48} color={colors.brandLight} />
              <Text style={styles.emptyText}>{t("noRecommendations")}</Text>
            </View>
          </SoftCard>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("stats")}</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Wardrobe")}
            >
              <Text style={styles.statNumber}>{wardrobeCount}</Text>
              <Text style={styles.statLabel}>{t("ownedItems")}</Text>
            </TouchableOpacity>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>{t("outfits")}</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textOnLight,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  actionCard: {
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.brand,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
