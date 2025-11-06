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
import { signUpWithEmail, signInWithGoogle } from "../../services/authService";
import { Mail, Lock, User, Sparkles } from "lucide-react-native";

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("알림", "모든 항목을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("알림", "비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      Alert.alert("회원가입 성공", "OutfitFlow에 오신 것을 환영합니다!");
    } catch (error: any) {
      Alert.alert("회원가입 실패", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Landing" }],
            })
          }
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← 돌아가기</Text>
        </TouchableOpacity>

        {/* Signup Card */}
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={["#a3a5ffff", "#b268f7ff"]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Sparkles size={24} color="#fcff59ff" />
            </LinearGradient>
            <Text style={styles.logoText}>OutfitFlow</Text>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>
              AI 스타일리스트와 함께 시작하세요
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이름</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="홍길동"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
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
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="최소 8자 이상"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password-new"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 재입력"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="password-new"
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient
                colors={["#a3a5ffff", "#b268f7ff"]}
                style={styles.signupButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signupButtonText}>회원가입</Text>
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

          {/* Google Signup */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignup}
            disabled={loading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Google로 계속하기</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              disabled={loading}
            >
              <Text style={styles.loginLink}>로그인</Text>
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
    marginBottom: 28,
  },
  backButtonText: {
    paddingTop: 18,
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
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  signupButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  signupButtonText: {
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
    color: "#cc352aff",
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginLink: {
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

export default SignupScreen;
