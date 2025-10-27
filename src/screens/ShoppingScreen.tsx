import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ShoppingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>쇼핑</Text>
      <Text style={styles.subtitle}>옷을 쇼핑 하세요</Text>
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
