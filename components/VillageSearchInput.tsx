// src/components/VillageSearchInput.tsx (Corrected)

import { useTheme } from "@/contexts/ThemeContext";
import useVillage from "@/hooks/useVillages";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Village = {
  name: string;
  village_name?: string;
  village_code?: string;
  [key: string]: any;
};

type VillageSearchInputProps = {
  accessToken: string;
  onVillageSelect: (village: Village) => void;
  initialValue?: string;
};

const VillageSearchInput = ({
  accessToken,
  onVillageSelect,
  initialValue = "",
}: VillageSearchInputProps) => {
  const { theme } = useTheme();
  const {
    data: villages,
    loading: villagesLoading,
    error: villagesError,
    refreshing: villagesRefreshing,
    searchVillages,
    loadMoreVillages,
    hasMore,
    refresh: refreshVillages,
  } = useVillage(accessToken);

  const [dropdownAnim] = useState(new Animated.Value(0));
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  const [villageSearch, setVillageSearch] = useState(initialValue);

  useEffect(() => {
    setVillageSearch(initialValue);
  }, [initialValue]);

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showVillageDropdown ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showVillageDropdown]);

  const handleSearchChange = (text: string) => {
    setVillageSearch(text);
    setShowVillageDropdown(true);
    searchVillages(text);
  };

  const handleSelect = (village: Village) => {
    setShowVillageDropdown(false);
    setVillageSearch(village.village_name || village.name);
    onVillageSelect(village);
  };

  const renderVillageItem = ({ item }: { item: Village }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => handleSelect(item)}
    >
      <View>
        <Text style={[styles.villageName, { color: theme.colors.textPrimary }]}>
          {item.village_name || item.name}
        </Text>
        {item.village_code && (
          <Text
            style={[styles.villageCode, { color: theme.colors.textSecondary }]}
          >
            Code: {item.village_code}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    // Show loader at the bottom only when loading more
    if (!villagesLoading || villages.length === 0) return null;
    return (
      <View style={styles.dropdownFooter}>
        <ActivityIndicator size="small" color={theme.colors.textPrimary} />
      </View>
    );
  };

  // ✅ This function correctly handles all states and fixes the error
  const renderListEmpty = () => {
    if (villagesLoading && villages.length === 0) {
      // Don't show an empty message while the initial load is happening
      return null;
    }

    if (villagesError) {
      return (
        <View style={styles.dropdownEmpty}>
          <Text style={{ color: theme.colors.textSecondary }}>
            Error loading villages
          </Text>
          <TouchableOpacity
            onPress={refreshVillages}
            style={[styles.retryButton, { borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.brandColors.primary }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.dropdownEmpty}>
        <Text style={{ color: theme.colors.textSecondary }}>
          No villages found
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textInput,
          {
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surfacePrimary,
          },
        ]}
        placeholder="Search village by name"
        placeholderTextColor={theme.colors.textTertiary}
        value={villageSearch}
        onChangeText={handleSearchChange}
        onFocus={() => setShowVillageDropdown(true)}
        onBlur={() => setTimeout(() => setShowVillageDropdown(false), 200)}
      />

      {villagesLoading && !villagesRefreshing && villages.length === 0 && (
        // Show a loader only on initial load, not when paginating
        <View style={styles.dropdownLoading}>
          <ActivityIndicator size="small" color={theme.colors.textPrimary} />
        </View>
      )}

      {showVillageDropdown && (
        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              opacity: dropdownAnim,
              transform: [
                {
                  translateY: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <FlatList
            data={villages}
            renderItem={renderVillageItem}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            ListEmptyComponent={renderListEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={loadMoreVillages}
            onEndReachedThreshold={0.5}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            style={styles.dropdownList}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: "relative", width: "100%", marginBottom: 20 },
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  dropdownContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownList: { maxHeight: 198 },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  villageName: { fontWeight: "500", fontSize: 14 },
  villageCode: { fontSize: 12, marginTop: 2 },
  dropdownLoading: { position: "absolute", right: 12, top: 12 },
  dropdownEmpty: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  dropdownFooter: { padding: 10, alignItems: "center" },
  retryButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
});

export default VillageSearchInput;
