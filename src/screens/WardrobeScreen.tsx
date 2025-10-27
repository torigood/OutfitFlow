import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WardrobeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>옷장</Text>
      <Text style={styles.subtitle}>내 옷을 관리하세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
