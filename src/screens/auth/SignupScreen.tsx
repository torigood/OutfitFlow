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
import { signUpWithEmail, signInWithGoogle } from "../../services/authService";
import { Mail, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { colors } from "../../theme/colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../localization/i18n";

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

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

  const placeholders = useMemo(
    () => ({
      name: t("signupNamePlaceholder"),
      email: t("signupEmailPlaceholder"),
      password: t("signupPasswordPlaceholder"),
      confirmPassword: t("signupConfirmPasswordPlaceholder"),
    }),
    [language]
  );

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("authAlertTitle"),
        text2: t("signupMissingFields"),
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("authAlertTitle"),
        text2: t("signupPasswordMismatch"),
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: t("authAlertTitle"),
        text2: t("signupPasswordLength"),
      });
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      Toast.show({
        type: "success",
        text1: t("signupSuccessTitle"),
        text2: t("signupSuccessMessage"),
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("signupErrorTitle"),
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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

        {/* Signup Card */}
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
            <Text style={styles.title}>{t("signupTitle")}</Text>
            <Text style={styles.subtitle}>{t("signupSubtitle")}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("signupNameLabel")}</Text>
              <View style={styles.inputWrapper}>
                <User
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                placeholder={placeholders.name}
                  placeholderTextColor={colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("signupEmailLabel")}</Text>
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
            <Text style={styles.label}>{t("signupPasswordLabel")}</Text>
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
                  autoComplete="password-new"
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

            <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {t("signupConfirmPasswordLabel")}
            </Text>
              <View style={styles.inputWrapper}>
                <Lock
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={styles.input}
                placeholder={placeholders.confirmPassword}
                  placeholderTextColor={colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                    setTimeout(
                      () => confirmPasswordInputRef.current?.focus(),
                      0
                    );
                  }}
                  disabled={loading}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <Eye size={20} color={colors.textTertiary} />
                  ) : (
                    <EyeOff size={20} color={colors.textTertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.brand, colors.brandLight]}
                style={styles.signupButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnDark} />
                ) : (
            <Text style={styles.signupButtonText}>{t("signupButton")}</Text>
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

          {/* Google Signup */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignup}
            disabled={loading}
          >
            <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>
            {t("authGoogleButton")}
          </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginSection}>
          <Text style={styles.loginText}>{t("signupLoginPrompt")} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              disabled={loading}
            >
            <Text style={styles.loginLink}>{t("signupLoginLink")}</Text>
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
  signupButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  signupButtonText: {
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
    backgroundColor: colors.cardBg,
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
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
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

export default SignupScreen;
