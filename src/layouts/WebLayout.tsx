import React from "react";
import { View, StyleSheet } from "react-native";
import Sidebar from "../components/Sidebar";

interface WebLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export default function WebLayout({
  children,
  currentRoute,
  onNavigate,
}: WebLayoutProps) {
  return (
    <View style={styles.container}>
      <Sidebar currentRoute={currentRoute} onNavigate={onNavigate} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
});
