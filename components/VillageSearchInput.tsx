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
    loading,
    error,
    searchVillages,
  } = useVillage(accessToken);

  const [inputValue, setInputValue] = useState(initialValue);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  const [dropdownAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!showVillageDropdown) setInputValue(initialValue);
  }, [initialValue, showVillageDropdown]);

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showVillageDropdown ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showVillageDropdown]);

  const handleTextChange = (text: string) => {
    setInputValue(text);
    searchVillages(text);
    if (!showVillageDropdown) setShowVillageDropdown(true);
  };

  const handleSelect = (village: Village) => {
    setShowVillageDropdown(false);
    setInputValue(village.village_name || village.name);
    onVillageSelect(village);
  };

  const renderVillageItem = ({ item }: { item: Village }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => handleSelect(item)}
    >
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
    </TouchableOpacity>
  );

  return (
    <View>
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
        value={inputValue}
        onChangeText={handleTextChange}
        onFocus={() => setShowVillageDropdown(true)}
        onBlur={() => setTimeout(() => setShowVillageDropdown(false), 200)}
      />

      {showVillageDropdown && (
        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              opacity: dropdownAnim,
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {loading && <ActivityIndicator style={{ paddingVertical: 20 }} />}
          {!loading && (
            <FlatList
              data={villages.slice(0, 4)}
              renderItem={renderVillageItem}
              keyExtractor={(item) => item.name} // Using stable ID is best practice
              keyboardShouldPersistTaps="handled"
              scrollEnabled={false} // Scrolling is not needed for a list of 3
            />
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  villageName: {
    fontWeight: "500",
    fontSize: 14,
  },
  villageCode: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default VillageSearchInput;
