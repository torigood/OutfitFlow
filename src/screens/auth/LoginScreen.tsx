import React, { useState } from "react";
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
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmail, signInWithGoogle } from "../../services/authService";

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      Alert.alert("로그인 실패", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert("Google 로그인 실패", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← 돌아가기</Text>
        </TouchableOpacity>

        {/* Login Card */}
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={["#6366F1", "#9333EA"]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoIconText}>✨</Text>
            </LinearGradient>
            <Text style={styles.logoText}>OutfitFlow</Text>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>로그인</Text>
            <Text style={styles.subtitle}>OutfitFlow에 오신 것을 환영합니다</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
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
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 입력"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />
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
                <Text style={styles.checkboxLabel}>로그인 상태 유지</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                disabled={loading}
              >
                <Text style={styles.forgotPassword}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#6366F1", "#9333EA"]}
                style={styles.loginButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>로그인</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Google로 계속하기</Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>아직 계정이 없으신가요? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Signup")}
              disabled={loading}
            >
              <Text style={styles.signupLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>계속 진행하면 OutfitFlow의</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>이용약관</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> 및 </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>개인정보처리방침</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>에 동의하게 됩니다</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    marginBottom: 32,
  },
  backButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
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
    color: "#111827",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
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
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
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
    borderColor: "#D1D5DB",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: "#FFFFFF",
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
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#9CA3AF",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
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
    color: "#374151",
    fontWeight: "500",
  },
  signupSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#6B7280",
  },
  signupLink: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 12,
    color: "#6366F1",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
