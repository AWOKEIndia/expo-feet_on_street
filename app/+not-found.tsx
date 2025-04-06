import React from 'react';
import { Link, Stack, usePathname, useSegments, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

export default function NotFoundScreen() {
  const pathname = usePathname();
  const segments = useSegments();
  const params = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>Page Not Found</ThemedText>
          <ThemedText style={styles.subtitle}>The screen you're looking for doesn't exist.</ThemedText>

          <View style={styles.routeInfoContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Route Information</ThemedText>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Full Path:</ThemedText>
              <ThemedText style={styles.value}>{pathname}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Route Segments:</ThemedText>
              <ThemedText style={styles.value}>{segments.join(' > ')}</ThemedText>
            </View>

            {Object.keys(params).length > 0 && (
              <>
                <ThemedText type="subtitle" style={[styles.sectionTitle, styles.paramsTitle]}>URL Parameters</ThemedText>
                {Object.entries(params).map(([key, value]) => (
                  <View key={key} style={styles.infoRow}>
                    <ThemedText style={styles.label}>{key}:</ThemedText>
                    <ThemedText style={styles.value}>{String(value)}</ThemedText>
                  </View>
                ))}
              </>
            )}
          </View>

          <Link href="/" style={styles.link}>
            <ThemedText type="link">Return to Home Screen</ThemedText>
          </Link>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  routeInfoContainer: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  paramsTitle: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 100,
  },
  value: {
    flex: 1,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
});
