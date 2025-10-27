import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AIRecommendScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 추천</Text>
      <Text style={styles.subtitle}>추천 받으세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
