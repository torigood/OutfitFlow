import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { resetPassword } from "../../services/authService";
import { Mail, Info } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../localization/i18n";

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (e.data.action.type === "POP" || e.data.action.type === "GO_BACK") {
        e.preventDefault();
        navigation.reset({
          index: 0,
          routes: [{ name: "Landing" }],
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const emailPlaceholder = useMemo(
    () => t("forgotEmailPlaceholder"),
    [language]
  );

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t("authAlertTitle"), t("forgotMissingEmail"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(t("forgotSuccessTitle"), t("forgotSuccessMessage"), [
        {
          text: t("authConfirm"),
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(t("forgotErrorTitle"), error.message);
    } finally {
      setLoading(false);
    }
  };

return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backText}>{t("authBack")}</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{t("forgotTitle")}</Text>
              <Text style={styles.subtitle}>{t("forgotSubtitle")}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("forgotEmailLabel")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={emailPlaceholder}
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.resetButtonText}>
                    {t("forgotButton")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 안내 문구 박스 */}
            <View style={styles.infoBox}>
              <Info size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{t("forgotInfoText")}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 8,
    paddingRight: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: 4,
  },
  input: {
    height: 56,
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: colors.textPrimary,
  },
  resetButton: {
    height: 56,
    backgroundColor: colors.brand,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    marginTop: 40,
    padding: 20,
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
