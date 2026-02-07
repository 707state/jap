import { StyleSheet, View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile Page</ThemedText>
      <ThemedText style={styles.description}>
        This page demonstrates how Expo Router automatically maps files to routes.
      </ThemedText>
      <View style={styles.infoContainer}>
        <ThemedText type="subtitle">File Information:</ThemedText>
        <ThemedText>• File: app/(tabs)/profile.tsx</ThemedText>
        <ThemedText>• Route name: profile</ThemedText>
        <ThemedText>• Access path: /profile</ThemedText>
      </View>
      <View style={styles.infoContainer}>
        <ThemedText type="subtitle">How it works:</ThemedText>
        <ThemedText>1. Expo Router scans the app/ directory</ThemedText>
        <ThemedText>2. Finds profile.tsx file</ThemedText>
        <ThemedText>3. Registers it as "profile" route</ThemedText>
        <ThemedText>4. Tabs.Screen name="profile" references this route</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoContainer: {
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
});
