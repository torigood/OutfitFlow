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
  Keyboard,
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
  
  // 입력 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 에러 상태 (각 필드별)
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

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

  const placeholders = useMemo(
    () => ({
      name: t("signupNamePlaceholder"),
      email: t("signupEmailPlaceholder"),
      password: t("signupPasswordPlaceholder"),
      confirmPassword: t("signupConfirmPasswordPlaceholder"),
    }),
    [language]
  );

  // 비밀번호 복잡성 검증 정규식 (대문자, 소문자, 숫자, 특수문자 포함)
  const validatePasswordComplexity = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  // 전체 유효성 검사 함수
  const validateInputs = () => {
    let isValid = true;

    // 1. 이름 검사
    if (!name.trim()) {
      setNameError(t("signupRequiredField")); // "필수 입력 항목입니다."
      isValid = false;
    } else {
      setNameError("");
    }

    // 2. 이메일 검사
    if (!email.trim()) {
      setEmailError(t("signupRequiredField"));
      isValid = false;
    } else {
      setEmailError("");
    }

    // 3. 비밀번호 검사
    if (!password) {
      setPasswordError(t("signupRequiredField"));
      isValid = false;
    } else if (!validatePasswordComplexity(password)) {
      // "대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다."
      setPasswordError(t("signupPasswordComplexityError")); 
      isValid = false;
    } else {
      setPasswordError("");
    }

    // 4. 비밀번호 확인 검사
    if (!confirmPassword) {
      setConfirmPasswordError(t("signupRequiredField"));
      isValid = false;
    } else if (password !== confirmPassword) {
      // "비밀번호가 일치하지 않습니다."
      setConfirmPasswordError(t("signupPasswordMismatch")); 
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSignup = async () => {
    // 키보드 내리기
    Keyboard.dismiss();

    // 유효성 검사 실패 시 중단 (Toast 없이 필드 밑 에러만 표시)
    if (!validateInputs()) {
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
      // 성공 후 로그인 페이지 등으로 이동 로직이 있다면 추가
    } catch (error: any) {
      console.log("Signup Error:", error.code);

      // Firebase 에러 코드를 분석해서 인라인 에러로 표시
      if (error.code === "auth/email-already-in-use") {
        setEmailError(t("signupEmailAlreadyInUse")); // "이미 사용 중인 이메일입니다."
      } else if (error.code === "auth/invalid-email") {
        setEmailError(t("notValideEmail"));
      } else if (error.code === "auth/weak-password") {
        setPasswordError(t("signupPasswordComplexityError"));
      } else {
        // 그 외 알 수 없는 네트워크 에러 등만 Toast로 표시
        Toast.show({
          type: "error",
          text1: t("signupErrorTitle"),
          text2: error.message,
        });
      }
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LinearGradient
            colors={[colors.bgPrimary, colors.bgSecondary]}
            style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{t("authBack")}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleSection}>
            <Text style={styles.title}>{t("signupTitle")}</Text>
            <Text style={styles.subtitle}>{t("signupSubtitle")}</Text>
          </View>

          <View style={styles.form}>
            {/* 이름 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("signupNameLabel")}</Text>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder={placeholders.name}
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError(""); // 입력 시작하면 에러 지움
                }}
                autoComplete="name"
                editable={!loading}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* 이메일 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("signupEmailLabel")}</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder={placeholders.email}
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("signupPasswordLabel")}</Text>
              <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.input, { flex: 1, borderWidth: 0, height: "100%" }]}
                  placeholder={placeholders.password}
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  editable={!loading}
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
              {/* 비밀번호 에러 메시지 (복잡성 등) */}
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* 비밀번호 확인 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("signupConfirmPasswordLabel")}
              </Text>
              <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputError : null]}>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={[styles.input, { flex: 1, borderWidth: 0, height: "100%" }]}
                  placeholder={placeholders.confirmPassword}
                  placeholderTextColor={colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <Eye size={20} color={colors.textSecondary} />
                  ) : (
                    <EyeOff size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {/* 비밀번호 불일치 에러 메시지 */}
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.signupButtonText}>{t("signupButton")}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 소셜 로그인 구분선 */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>{t("authDividerText")}</Text>
            <View style={styles.line} />
          </View>

          {/* 구글 가입 */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignup}
            disabled={loading}
          >
             <Text style={styles.googleText}>G</Text>
            <Text style={styles.googleButtonText}>
              {t("authGoogleButton")}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t("signupLoginPrompt")}{" "}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                {t("signupLoginLink")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 8,
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
    marginBottom: 4, // 에러 메시지 공간 확보를 위해 약간의 마진 조정
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
    borderWidth: 1,
    borderColor: 'transparent', // 기본 테두리 투명
  },
  passwordContainer: {
    height: 56,
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // 에러 발생 시 적용할 스타일
  inputError: {
    borderColor: colors.error, // colors.ts에 있는 빨간색 사용
  },
  // 에러 텍스트 스타일
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 8,
  },
  signupButton: {
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
  signupButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
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
    color: "#DB4437",
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
  loginLink: {
    fontWeight: "700",
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
});

export default SignupScreen;