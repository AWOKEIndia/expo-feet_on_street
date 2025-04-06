import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function HomeScreen() {
  const { logout, accessToken, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, accessToken]);

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.auth.get_logged_user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        // Now fetch the user details
        const userResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/User/${data.message}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(
            `Failed to fetch user details: ${userResponse.status}`
          );
        }

        const userData = await userResponse.json();
        setUserName(
          userData.data.full_name || userData.data.first_name || data.message
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileError("Failed to load user profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Function to truncate the token for display
  const truncateToken = (token: string | null) => {
    if (!token) return "Not available";
    if (token.length <= 20) return token;
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.titleContainer}>
        <ThemedText type="title">
          Welcome{userName ? `, ${userName}` : ""}!
        </ThemedText>
        <HelloWave />
      </View>

      {/* Authentication Data Section */}
      <View style={styles.authContainer}>
        <ThemedText type="subtitle">Authentication Status</ThemedText>
        <View style={styles.authDataContainer}>
          <View style={styles.authDataRow}>
            <ThemedText type="defaultSemiBold">Status:</ThemedText>
            <ThemedText
              style={[
                styles.statusText,
                { color: isAuthenticated ? "#4CAF50" : "#FF3B30" },
              ]}
            >
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </ThemedText>
          </View>

          <View style={styles.authDataRow}>
            <ThemedText type="defaultSemiBold">Access Token:</ThemedText>
            <ThemedText style={styles.tokenText}>
              {truncateToken(accessToken)}
            </ThemedText>
          </View>

          <View style={styles.authDataRow}>
            <ThemedText type="defaultSemiBold">User Profile:</ThemedText>
            {isLoadingProfile ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : profileError ? (
              <ThemedText style={styles.errorText}>{profileError}</ThemedText>
            ) : userName ? (
              <ThemedText>{userName}</ThemedText>
            ) : (
              <ThemedText>Not loaded</ThemedText>
            )}
          </View>
        </View>
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  authContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  authDataContainer: {
    marginTop: 8,
  },
  authDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    fontWeight: "bold",
  },
  tokenText: {
    fontFamily: "SpaceMono",
    fontSize: 12,
  },
  errorText: {
    color: "#FF3B30",
  },
  logoutContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
