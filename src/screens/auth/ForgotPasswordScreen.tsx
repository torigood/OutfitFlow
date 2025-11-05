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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { resetPassword } from "../../services/authService";

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("알림", "이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        "이메일 전송 완료",
        "비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.",
        [
          {
            text: "확인",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("오류", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← 돌아가기</Text>
          </TouchableOpacity>
          <Text style={styles.title}>비밀번호 찾기</Text>
          <Text style={styles.subtitle}>
            가입하신 이메일 주소를 입력하시면{"\n"}비밀번호 재설정 링크를
            보내드립니다.
          </Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>재설정 링크 전송</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            이메일이 도착하지 않는다면 스팸함을 확인해주세요.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#6C63FF",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3142",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3142",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  resetButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
