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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Warm Background */}
        <LinearGradient
          colors={[colors.bgTop, colors.bgBottom]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Landing" }],
              });
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("authBack")}</Text>
          </TouchableOpacity>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={[colors.brand, colors.brandLight]}
                style={styles.logoIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sparkles size={24} color={colors.textOnDark} />
              </LinearGradient>
              <Text style={styles.logoText}>OutfitFlow</Text>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{t("loginTitle")}</Text>
              <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("loginEmailLabel")}</Text>
                <View style={styles.inputWrapper}>
                  <Mail
                    size={20}
                    color={colors.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={placeholders.email}
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("loginPasswordLabel")}</Text>
                <View style={styles.inputWrapper}>
                  <Lock
                    size={20}
                    color={colors.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder={placeholders.password}
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setShowPassword(!showPassword);
                      setTimeout(() => passwordInputRef.current?.focus(), 0);
                    }}
                    disabled={loading}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <Eye size={20} color={colors.textTertiary} />
                    ) : (
                      <EyeOff size={20} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={loading}
                >
                  <View style={styles.checkbox}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {t("loginRememberMe")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  disabled={loading}
                >
                  <Text style={styles.forgotPassword}>
                    {t("loginForgotPassword")}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[colors.brand, colors.brandLight]}
                  style={styles.loginButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textOnDark} />
                  ) : (
                    <Text style={styles.loginButtonText}>
                      {t("loginButton")}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("authDividerText")}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Login */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>
                {t("authGoogleButton")}
              </Text>
            </TouchableOpacity>

            {/* Signup Link */}
            <View style={styles.signupSection}>
              <Text style={styles.signupText}>{t("loginSignupPrompt")} </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup")}
                disabled={loading}
              >
                <Text style={styles.signupLink}>{t("loginSignupLink")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("authFooterPrefix")}</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerLink}>{t("legalTerms")}</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> {t("commonAnd")} </Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>{t("legalPrivacy")}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.footerText}>{t("authFooterSuffix")}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    marginBottom: 28,
  },
  backButtonText: {
    paddingTop: 18,
    fontSize: 16,
    color: colors.textOnDark,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 32,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIconText: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textOnLight,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textOnLight,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textOnLight,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textOnLight,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: "500",
  },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.lightGray,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: colors.white,
    marginBottom: 32,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4285F4",
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    color: colors.textOnLight,
    fontWeight: "500",
  },
  signupSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textOnDark,
    opacity: 0.7,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 12,
    color: colors.textOnDark,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
