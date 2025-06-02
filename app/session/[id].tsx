import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface CFLSessionDetail {
  name: string;
  employee: string;
  trainer_name?: string;
  date?: string;
  participant_count?: number;
  feedback?: string;
  village?: string;
  block?: string;
  cfl_center?: string;
  district?: string;
  region?: string;
  state?: string;
  session_duration?: string;
  session_type?: string;
  topics_covered?: string[];
  materials_used?: string[];
  attendance_rate?: number;
  session_photos?: string[];
  session_image_1?: string;
  session_image_2?: string;
  participant_list_page_1?: string;
  next_session_date?: string;
  challenges_faced?: string;
  recommendations?: string;
  created_by?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
}

const SessionReportScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const { accessToken } = useAuthContext();

  const [sessionData, setSessionData] = useState<CFLSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchSessionDetails = async () => {
    if (!id) {
      Alert.alert("Error", "Session ID not found");
      return;
    }

    try {
      setLoading(true);

      const fields = [
        "name",
        "employee",
        "cfl_center",
        "trainer_name",
        "date",
        "participant_count",
        "village",
        "district",
        "block",
        "region",
        "state",
        "feedback",
        "session_duration",
        "session_type",
        "topics_covered",
        "materials_used",
        "attendance_rate",
        "session_photos",
        "session_image_1",
        "session_image_2",
        "participant_list_page_1",
        "next_session_date",
        "challenges_faced",
        "recommendations",
        "created_by",
        "creation",
        "modified",
        "modified_by"
      ];

      const params = new URLSearchParams({
        fields: JSON.stringify(fields),
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/CFL Session/${id}?${params}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server response: ${response.status} ${response.statusText}`);
        console.error(`Error details: ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Session details:", JSON.stringify(data, null, 2));

      setSessionData(data.data || data);
    } catch (error) {
      console.error("Error fetching session details:", error);
      Alert.alert(
        "Error",
        "Failed to load session details. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessionDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const getSessionPhotos = (): { url: string; label: string; headers?: any }[] => {
    if (!sessionData) return [];

    const photos: { url: string; label: string; headers?: any }[] = [];

    const createImageUrl = (imagePath: string | undefined, label: string) => {
      if (!imagePath) return null;

      // Handle both full URLs and relative paths
      const isFullUrl = imagePath.startsWith('http');
      const url = isFullUrl ? imagePath : `${process.env.EXPO_PUBLIC_BASE_URL}${imagePath}`;

      return {
        url,
        label,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      };
    };

    const image1 = createImageUrl(sessionData.session_image_1, "Session Image 1");
    if (image1) photos.push(image1);

    const image2 = createImageUrl(sessionData.session_image_2, "Session Image 2");
    if (image2) photos.push(image2);

    const participantList = createImageUrl(sessionData.participant_list_page_1, "Participant List");
    if (participantList) photos.push(participantList);

    // Handle session_photos array
    if (sessionData.session_photos?.length) {
      sessionData.session_photos.forEach((photo, index) => {
        const photoData = createImageUrl(photo, `Session Photo ${index + 1}`);
        if (photoData) photos.push(photoData);
      });
    }

    return photos;
  };

  const AuthImage = ({ source, style, label }: {
    source: { uri: string; headers?: any };
    style: any;
    label: string;
  }) => {
    const [error, setError] = useState(false);

    if (error) {
      return (
        <View style={[style, styles.imageErrorContainer]}>
          <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.imageErrorText, { color: theme.colors.textSecondary }]}>
            Could not load image
          </Text>
        </View>
      );
    }

    return (
      <Image
        source={{
          uri: source.uri,
          headers: source.headers
        }}
        style={style}
        resizeMode="cover"
        onError={() => {
          console.error(`Error loading image: ${label}`);
          console.error(`Failed URL: ${source.uri}`);
          setError(true);
        }}
      />
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderInfoSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={[styles.infoSection, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.border }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color={theme.brandColors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderInfoRow = (label: string, value: string | number | undefined, icon?: string) => (
    <View style={styles.infoRow}>
      {icon && <Ionicons name={icon as any} size={16} color={theme.colors.textSecondary} style={styles.infoIcon} />}
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
          {value || "Not specified"}
        </Text>
      </View>
    </View>
  );

  const renderListItems = (items: string[] | undefined, emptyText: string) => {
    if (!items || items.length === 0) {
      return <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{emptyText}</Text>;
    }

    return (
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={index} style={[styles.listItem, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.bulletPoint, { backgroundColor: theme.brandColors.primary }]} />
            <Text style={[styles.listText, { color: theme.colors.textPrimary }]}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

const renderPhotoGallery = () => {
  const photos = getSessionPhotos();

  if (photos.length === 0) {
    return (
      <View style={styles.noPhotosContainer}>
        <Ionicons name="camera-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={[styles.noPhotosText, { color: theme.colors.textSecondary }]}>
          No photos available for this session
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.photoCount, { color: theme.colors.textSecondary }]}>
        {photos.length} photo{photos.length !== 1 ? 's' : ''} available
      </Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setSelectedImageIndex(index);
        }}
        scrollEventThrottle={16}
        style={styles.photoScrollView}
        contentContainerStyle={styles.photoScrollContent}
      >
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <View style={styles.photoImageContainer}>
              <AuthImage
                source={{ uri: photo.url, headers: photo.headers }}
                style={styles.sessionPhoto}
                label={photo.label}
              />
            </View>
            <View style={[styles.photoLabel, { backgroundColor: theme.colors.background + 'E6' }]}>
              <Text style={[styles.photoLabelText, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {photo.label}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {photos.length > 1 && (
        <View style={styles.photoIndicators}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.photoIndicator,
                {
                  backgroundColor: index === selectedImageIndex
                    ? theme.brandColors.primary
                    : theme.colors.textSecondary + "40"
                }
              ]}
            />
          ))}
        </View>
      )}

      {photos.length > 1 && (
        <Text style={[styles.photoNavText, { color: theme.colors.textSecondary }]}>
          {selectedImageIndex + 1} of {photos.length}
        </Text>
      )}
    </View>
  );
};

  if (loading) {
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

  if (!sessionData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
            Session Not Found
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            The requested session could not be loaded.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.brandColors.primary }]}
            onPress={fetchSessionDetails}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.textInverted }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.brandColors.primary}
          />
        }
      >
        {/* Session Title Card */}
        <View style={[styles.titleCard, { backgroundColor: theme.brandColors.primary }]}>
          <Text style={[styles.sessionTitle, { color: theme.colors.textInverted }]}>
            {sessionData.session_type || "CFL Session"}
          </Text>
          <Text style={[styles.sessionSubtitle, { color: theme.colors.textInverted + "CC" }]}>
            {sessionData.cfl_center || "CFL Center"}
          </Text>
          <View style={styles.sessionMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textInverted} />
              <Text style={[styles.metaText, { color: theme.colors.textInverted }]}>
                {formatDate(sessionData.date)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={theme.colors.textInverted} />
              <Text style={[styles.metaText, { color: theme.colors.textInverted }]}>
                {sessionData.participant_count || 0} participants
              </Text>
            </View>
          </View>
        </View>

        {/* Session Photos */}
        {renderInfoSection("Session Photos", "camera-outline", renderPhotoGallery())}

        {/* Basic Information */}
        {renderInfoSection("Basic Information", "information-circle-outline", (
          <>
            {renderInfoRow("Session ID", sessionData.name, "bookmark-outline")}
            {renderInfoRow("Trainer", sessionData.trainer_name, "person-outline")}
            {renderInfoRow("Duration", sessionData.session_duration, "time-outline")}
            {renderInfoRow("Attendance Rate", sessionData.attendance_rate ? `${sessionData.attendance_rate}%` : undefined, "checkmark-circle-outline")}
          </>
        ))}

        {/* Location Details */}
        {renderInfoSection("Location Details", "location-outline", (
          <>
            {renderInfoRow("Village", sessionData.village)}
            {renderInfoRow("Block", sessionData.block)}
            {renderInfoRow("District", sessionData.district)}
            {renderInfoRow("Region", sessionData.region)}
            {renderInfoRow("State", sessionData.state)}
          </>
        ))}

        {/* Session Content */}
        {renderInfoSection("Session Content", "book-outline", (
          <>
            <View style={styles.contentSection}>
              <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>Topics Covered</Text>
              {renderListItems(sessionData.topics_covered, "No topics specified")}
            </View>
            <View style={styles.contentSection}>
              <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>Materials Used</Text>
              {renderListItems(sessionData.materials_used, "No materials specified")}
            </View>
          </>
        ))}

        {/* Feedback & Observations */}
        {renderInfoSection("Feedback & Observations", "chatbubble-outline", (
          <>
            {sessionData.feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>Session Feedback</Text>
                <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>
                  {sessionData.feedback}
                </Text>
              </View>
            )}
            {sessionData.challenges_faced && (
              <View style={styles.feedbackContainer}>
                <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>Challenges Faced</Text>
                <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>
                  {sessionData.challenges_faced}
                </Text>
              </View>
            )}
            {sessionData.recommendations && (
              <View style={styles.feedbackContainer}>
                <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>Recommendations</Text>
                <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>
                  {sessionData.recommendations}
                </Text>
              </View>
            )}
          </>
        ))}

        {/* Next Session */}
        {sessionData.next_session_date && renderInfoSection("Next Session", "calendar-outline", (
          <View style={[styles.nextSessionCard, { backgroundColor: theme.statusColors.success + "15" }]}>
            <Ionicons name="calendar" size={24} color={theme.statusColors.success} />
            <View style={styles.nextSessionInfo}>
              <Text style={[styles.nextSessionTitle, { color: theme.statusColors.success }]}>
                Next Session Scheduled
              </Text>
              <Text style={[styles.nextSessionDate, { color: theme.colors.textPrimary }]}>
                {formatDate(sessionData.next_session_date)}
              </Text>
            </View>
          </View>
        ))}

        {/* System Information */}
        {renderInfoSection("System Information", "settings-outline", (
          <>
            {renderInfoRow("Created By", sessionData.created_by, "person-add-outline")}
            {renderInfoRow("Created On", formatDateTime(sessionData.creation), "time-outline")}
            {renderInfoRow("Last Modified By", sessionData.modified_by, "create-outline")}
            {renderInfoRow("Last Modified", formatDateTime(sessionData.modified), "refresh-outline")}
          </>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.statusColors.success }]}
          >
            <Ionicons name="download-outline" size={20} color={theme.colors.textInverted} />
            <Text style={[styles.actionButtonText, { color: theme.colors.textInverted }]}>
              Download PDF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.brandColors.primary }]}
            onPress={() => router.push(`/session/edit/${sessionData.name}`)}
          >
            <Ionicons name="create-outline" size={20} color={theme.colors.textInverted} />
            <Text style={[styles.actionButtonText, { color: theme.colors.textInverted }]}>
              Edit Session
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  titleCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  sessionMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoSection: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  contentSection: {
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  listContainer: {
    gap: 6,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    gap: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  listText: {
    fontSize: 14,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  feedbackContainer: {
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noPhotosContainer: {
    alignItems: "center",
    padding: 40,
  },
  noPhotosText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  photoCount: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: '500',
  },
  photoScrollView: {
    marginHorizontal: -16,
    marginBottom: 8,
  },
  photoContainer: {
    width: screenWidth - 64,
    marginRight: 32,
    marginLeft: -1,
    alignItems: 'center',
  },
  sessionPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
  photoLabel: {
    position: 'absolute',
    bottom: 12,
    left: 28,
    right: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  photoLabelText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  photoNavText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  nextSessionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  nextSessionInfo: {
    flex: 1,
  },
  nextSessionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  nextSessionDate: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 32,
  },
  imageErrorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageErrorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
    photoScrollContent: {
    paddingHorizontal: 16,
  },
   photoImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default SessionReportScreen;
