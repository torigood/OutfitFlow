import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  signInWithEmail,
  signInWithGoogle,
  checkRememberMe,
} from "../../services/authService";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Toast from "react-native-toast-message";
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

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // 뒤로가기 제스처나 버튼을 감지하면 Landing으로
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

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const storedPreference = await checkRememberMe();
        if (isMounted) {
          setRememberMe(storedPreference);
        }
      } catch (error) {
        // ignore preference load errors; fallback to current state
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const placeholders = useMemo(
    () => ({
      email: t("loginEmailPlaceholder"),
      password: t("loginPasswordPlaceholder"),
    }),
    [language]
  );

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: t("authAlertTitle"),
        text2: t("loginMissingFields"),
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password, rememberMe);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("loginErrorTitle"),
        text2: t("notValideEmail"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle(rememberMe);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("loginGoogleErrorTitle"),
        text2: error.message,
      });
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{t("authBack") || "Back"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleSection}>
            <Text style={styles.title}>{t("loginTitle")}</Text>
            <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>
          </View>

          <View style={styles.form}>
            {/* 이메일 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("loginEmailLabel")}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholders.email}
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("loginPasswordLabel")}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  placeholder={placeholders.password}
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <Eye size={20} color={colors.textSecondary} />
                  ) : (
                    <EyeOff size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 옵션 (기억하기 / 비밀번호 찾기) */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.optionText}>{t("loginRememberMe")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotText}>
                  {t("loginForgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 메인 로그인 버튼 */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>{t("loginButton")}</Text>
              )}
            </TouchableOpacity>

            {/* 소셜 로그인 구분선 */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>{t("authDividerText") || "OR"}</Text>
              <View style={styles.line} />
            </View>

            {/* 구글 로그인 */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              {/* Google G 로고는 텍스트나 아이콘으로 대체 */}
              <Text style={styles.googleText}>G</Text>
              <Text style={styles.googleButtonText}>
                {t("authGoogleButton")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 하단 회원가입 링크 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t("loginSignupPrompt")}{" "}
              <Text
                style={styles.signupLink}
                onPress={() => navigation.navigate("Signup")}
              >
                {t("loginSignupLink")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    gap: 20,
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
  passwordContainer: {
    height: 56,
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    borderWidth: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  optionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  loginButton: {
    height: 56,
    backgroundColor: colors.brand,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textTertiary,
  },
  googleButton: {
    height: 56,
    backgroundColor: colors.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DB4437", // Google Brand Color
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signupLink: {
    fontWeight: "700",
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;