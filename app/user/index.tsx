import { ThemedText } from "@/components/ThemedText";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface InfoRowProps {
  icon: string;
  label: string;
  value: string | undefined;
  theme: any; // Ideally, replace 'any' with your specific theme type
  noBorder?: boolean;
}

interface ActionButtonProps {
  icon: string;
  text: string;
  onPress: () => void;
  theme: any; // Ideally, replace 'any' with your specific theme type
  noBorder?: boolean;
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { employeeProfile, isAuthenticated, logout } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!employeeProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.brandColors.primary} />
      </View>
    );
  }

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            setIsLoggingOut(false);
          },
        },
      ]
    );
  };

  const handleCameraPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Future implementation: open image picker or camera
    Alert.alert(
      "Update Profile Photo",
      "Choose a new profile photo",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: () => console.log("Take Photo") },
        { text: "Choose from Library", onPress: () => console.log("Choose from Library") },
      ]
    );
  };

  return (
    <View style={[styles.container, {
      backgroundColor: theme.colors.background,
      paddingTop: insets.top
    }]}>

      {/* Header with gradient background */}
      <View
        style={[styles.headerBackground, { backgroundColor: theme.brandColors.primary }]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, {
          backgroundColor: theme.colors.surfacePrimary,
          ...theme.shadows.md,
        }]}>
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handleCameraPress} activeOpacity={0.8}>
              {employeeProfile.profile_image ? (
                <Image
                  source={{ uri: employeeProfile.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.brandColors.primary }]}>
                  <ThemedText style={styles.avatarText}>
                    {employeeProfile?.employee_name ? employeeProfile?.employee_name.charAt(0).toUpperCase() : "?"}
                  </ThemedText>
                </View>
              )}

              <View style={[styles.cameraBadge, { backgroundColor: theme.brandColors.secondary }]}>
                <Ionicons name="camera" size={14} color={theme.baseColors.white} />
              </View>
            </TouchableOpacity>

            <ThemedText style={styles.name}>
              {employeeProfile?.employee_name}
            </ThemedText>
            <ThemedText style={[styles.email, { color: theme.colors.textTertiary }]}>
              {employeeProfile?.email || "No email provided"}
            </ThemedText>

            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: theme.statusColors.infoBackground }]}>
                <ThemedText style={[styles.badgeText, { color: theme.statusColors.infoText }]}>
                  {employeeProfile?.designation || "Employee"}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Information Cards */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/user/edit-profile");
              }}
            >
              <ThemedText style={[styles.editButtonText, { color: theme.brandColors.primary }]}>
                Edit
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, {
            backgroundColor: theme.colors.surfacePrimary,
            ...theme.shadows.sm,
          }]}>
            <InfoRow
              icon="person-outline"
              label="Full Name"
              value={employeeProfile?.employee_name}
              theme={theme}
            />
            <InfoRow
              icon="id-card-outline"
              label="Employee ID"
              value={employeeProfile?.name}
              theme={theme}
            />
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={employeeProfile?.email || "Not set"}
              theme={theme}
            />
            <InfoRow
              icon="business-outline"
              label="Department"
              value={employeeProfile?.department || "Not set"}
              theme={theme}
            />
            <InfoRow
              icon="briefcase-outline"
              label="Designation"
              value={employeeProfile?.designation || "Not set"}
              theme={theme}
            />
            <InfoRow
              icon="globe-outline"
              label="Company"
              value={employeeProfile?.company || "Not set"}
              theme={theme}
              noBorder
            />
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Settings & Preferences</ThemedText>

          <View style={[styles.card, {
            backgroundColor: theme.colors.surfacePrimary,
            ...theme.shadows.sm,
          }]}>
            <ActionButton
              icon="settings-outline"
              text="App Settings"
              onPress={() => router.push("/user/settings")}
              theme={theme}
            />
            <ActionButton
              icon="key-outline"
              text="Change Password"
              onPress={() => router.push("/user/change-password")}
              theme={theme}
              noBorder
            />
          </View>

          {/* Logout button */}
          <TouchableOpacity
            style={[styles.logoutButton, {
              borderColor: theme.statusColors.errorLight,
              backgroundColor: theme.colors.surfacePrimary
            }]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={theme.statusColors.error} />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={theme.statusColors.error}
                  style={styles.logoutIcon}
                />
                <ThemedText style={[styles.logoutText, { color: theme.statusColors.error }]}>
                  Log Out
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          <ThemedText style={[styles.versionText, { color: theme.colors.textTertiary }]}>
            Version 1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

// Helper components for better organization
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, theme, noBorder = false }) => (
  <View style={[
    styles.infoRow,
    !noBorder && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }
  ]}>
    <View style={styles.infoRowLeft}>
      <Ionicons
        // @ts-ignore
        name={icon}
        size={20}
        color={theme.colors.textTertiary}
        style={styles.infoIcon}
      />
      <ThemedText style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </ThemedText>
    </View>
    <ThemedText style={[styles.value, { color: theme.colors.textPrimary }]}>
      {value || "Not set"}
    </ThemedText>
  </View>
);

const ActionButton: React.FC<ActionButtonProps> = ({ icon, text, onPress, theme, noBorder = false }) => (
  <Pressable
    style={({ pressed }) => [
      styles.actionButton,
      pressed && { backgroundColor: theme.colors.backgroundAlt },
      !noBorder && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }
    ]}
    onPress={() => {
      Haptics.selectionAsync();
      onPress();
    }}
  >
    <View style={styles.actionButtonContent}>
      <Ionicons
        // @ts-ignore
        name={icon}
        size={22}
        color={theme.colors.textPrimary}
        style={styles.actionIcon}
      />
      <ThemedText style={styles.actionText}>{text}</ThemedText>
    </View>
    <Ionicons
      name="chevron-forward"
      size={18}
      color={theme.colors.textTertiary}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackground: {
    height: 120,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0, // Lower z-index so it doesn't overlap content
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 16,
    zIndex: 2, // Keep on top
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    zIndex: 1, // Ensure it's above the header background
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  profileCard: {
    marginTop: 60,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 16,
    backgroundColor: "#666",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 36, // Reduced from 42
    fontWeight: "bold",
    lineHeight: 42, // Add lineHeight to prevent vertical clipping
    textAlign: "center", // Ensure text is properly centered
    textAlignVertical: "center", // Important for Android centering
    includeFontPadding: false, // Remove extra padding Android adds to text
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 12,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    maxWidth: '50%',
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "400",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
  },
  versionText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
  },
});
