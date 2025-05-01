import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";

// Mock data - in a real app, this would be fetched from an API
const getMockSessionData = (id: string) => ({
  id,
  trainer_name: "John Doe",
  date: "2023-06-15",
  participant_count: 35,
  status: "Completed",
  feedback: "Session went well. All participants were engaged and asked good questions.",
  employee: "Jane Smith",
  village: "Greenfield",
  block: "Eastern Block",
  cfl_center: "CFL Center 123",
  district: "North District",
  region: "Western Region",
  state: "Maharashtra",
  session_images: [
    "https://via.placeholder.com/800x600.png?text=Session+Image+1",
    "https://via.placeholder.com/800x600.png?text=Session+Image+2",
    "https://via.placeholder.com/800x600.png?text=Session+Image+3",
  ],
  participant_images: [
    "https://via.placeholder.com/800x600.png?text=Participant+List+1",
    "https://via.placeholder.com/800x600.png?text=Participant+List+2",
  ],
  created_at: "2023-06-16T14:30:00Z",
  updated_at: "2023-06-16T16:45:00Z",
});

const SessionReportScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // Simulate API fetch with a delay
    const timer = setTimeout(() => {
      // In a real app, you would fetch data from an API here
      setSessionData(getMockSessionData(id || "1"));
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const handleViewPhoto = (photoUri: string) => {
    router.push({
      pathname: "/session/photo-review" as any,
      params: { path: encodeURIComponent(photoUri) },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandColors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading session details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Session Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statusBadge, {
          backgroundColor:
            sessionData.status === "Completed"
              ? theme.statusColors.success
              : sessionData.status === "Draft"
                ? theme.statusColors.warning
                : theme.statusColors.info
        }]}>
          <Text style={styles.statusText}>{sessionData.status}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Basic Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Trainer:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.trainer_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Date:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {new Date(sessionData.date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Participants:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.participant_count}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Employee:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.employee}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Location
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Village:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.village}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Block:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.block}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              CFL Center:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.cfl_center}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              District:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.district}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Region:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.region}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              State:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {sessionData.state}
            </Text>
          </View>
        </View>

        {sessionData.feedback && (
          <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Feedback
            </Text>
            <Text style={[styles.feedbackText, { color: theme.colors.textPrimary }]}>
              {sessionData.feedback}
            </Text>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Session Images
          </Text>
          <View style={styles.photosContainer}>
            {sessionData.session_images.map((uri: string, index: number) => (
              <TouchableOpacity
                key={`session-img-${index}`}
                style={styles.photoContainer}
                onPress={() => handleViewPhoto(uri)}
              >
                <Image
                  source={{ uri }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Participant List
          </Text>
          <View style={styles.photosContainer}>
            {sessionData.participant_images.map((uri: string, index: number) => (
              <TouchableOpacity
                key={`participant-img-${index}`}
                style={styles.photoContainer}
                onPress={() => handleViewPhoto(uri)}
              >
                <Image
                  source={{ uri }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.timestampContainer}>
          <Text style={[styles.timestampText, { color: theme.colors.textTertiary }]}>
            Created: {new Date(sessionData.created_at).toLocaleString()}
          </Text>
          <Text style={[styles.timestampText, { color: theme.colors.textTertiary }]}>
            Last updated: {new Date(sessionData.updated_at).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40, // For balanced header
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  infoLabel: {
    width: 100,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
  },
  feedbackText: {
    lineHeight: 22,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoContainer: {
    width: '50%',
    padding: 4,
  },
  photo: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 8,
  },
  timestampContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  timestampText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default SessionReportScreen;
