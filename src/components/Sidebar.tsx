import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SidebarProps {
  currentRoute: string;
  onNavigate: (screen: string) => void;
}

export default function Sidebar({ currentRoute, onNavigate }: SidebarProps) {
  const menuItems = [
    { name: "Home", label: "홈", icon: "home" },
    { name: "Wardrobe", label: "내 옷장", icon: "shirt" },
    { name: "AIRecommend", label: "AI 추천", icon: "sparkles" },
    { name: "Community", label: "커뮤니티", icon: "people" },
    { name: "Shopping", label: "쇼핑 추천", icon: "cart" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>StyleMate</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => onNavigate(item.name)}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={isActive ? "#000" : "#666"}
                style={styles.icon}
              />
              <Text
                style={[styles.menuText, isActive && styles.menuTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    height: "100%",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  menu: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: "#f0f0f0",
  },
  icon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#666",
  },
  menuTextActive: {
    color: "#000",
    fontWeight: "600",
  },
});
