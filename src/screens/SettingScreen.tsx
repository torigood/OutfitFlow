import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useLanguage } from "../contexts/LanguageContext";
import { availableLanguages, t } from "../localization/i18n";

export default function SettingScreen() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  const handleLogout = async () => {
    Alert.alert(t("logoutConfirmTitle"), t("logoutConfirmMessage"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert("오류", "로그아웃에 실패했습니다: " + error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll}>
        {/* 사용자 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("accountInfo")}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={24} color={colors.brand} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("name")}</Text>
                <Text style={styles.infoValue}>
                  {user?.displayName || "사용자"}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={24} color={colors.brand} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("email")}</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 앱 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("appInfo")}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.brand}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("version")}</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("languageSetting")}</Text>
          <View style={styles.languageContainer}>
            <Text style={styles.languageDescription}>
              {t("selectLanguage")}
            </Text>
            <View style={styles.languageOptions}>
              {availableLanguages.map((option) => (
                <TouchableOpacity
                  key={option.code}
                  style={[
                    styles.languageButton,
                    language === option.code && styles.languageButtonActive,
                  ]}
                  onPress={() => setLanguage(option.code)}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      language === option.code &&
                        styles.languageButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={colors.white} />
            <Text style={styles.logoutButtonText}>{t("logout")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  infoCard: {
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textOnLight,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  languageContainer: {
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 16,
  },
  languageDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  languageOptions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  languageButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  languageButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  languageButtonTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
});
