import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";

export default function SettingScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    console.log("🔘 로그아웃 버튼 클릭됨, Platform:", Platform.OS);

    // 웹에서는 window.confirm 사용, 모바일에서는 Alert.alert 사용
    if (Platform.OS === "web") {
      console.log("🌐 웹 플랫폼 - window.confirm 사용");
      const confirmed = window.confirm("정말 로그아웃 하시겠습니까?");
      console.log("✅ 사용자 확인:", confirmed);

      if (confirmed) {
        try {
          console.log("🚀 로그아웃 시작...");
          await signOut();
          console.log("✅ 로그아웃 성공!");
        } catch (error: any) {
          console.error("❌ 로그아웃 오류:", error);
          window.alert("로그아웃에 실패했습니다: " + error.message);
        }
      } else {
        console.log("❌ 사용자가 로그아웃 취소");
      }
    } else {
      Alert.alert(
        "로그아웃",
        "정말 로그아웃 하시겠습니까?",
        [
          {
            text: "취소",
            style: "cancel",
          },
          {
            text: "로그아웃",
            style: "destructive",
            onPress: async () => {
              try {
                console.log("로그아웃 시작...");
                await signOut();
                console.log("로그아웃 성공!");
              } catch (error: any) {
                console.error("로그아웃 오류:", error);
                Alert.alert("오류", "로그아웃에 실패했습니다: " + error.message);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      {/* 사용자 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 정보</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-circle" size={24} color="#6C63FF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>이름</Text>
              <Text style={styles.infoValue}>{user?.displayName || "사용자"}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={24} color="#6C63FF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>이메일</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 앱 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={24} color="#6C63FF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>버전</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 로그아웃 버튼 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3142",
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#2D3142",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
