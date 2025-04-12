import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

interface Log {
  name?: string;
  log_type: string;
  time: string;
}

interface HistoryModalProps {
  visible: boolean;
  employee_id: string;
  accessToken: string;
  onClose: () => void;
  theme: any;
  onSelectLog: (logId: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  employee_id,
  accessToken,
  onClose,
  theme,
  onSelectLog,
}) => {
  const [logList, setLogList] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && employee_id) {
      fetchLogList();
    }
  }, [visible, employee_id]);

  const fetchLogList = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!employee_id) {
        setError("Employee ID is missing");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee Checkin?fields=["name","log_type","time"]&filters=[["employee","=","${employee_id}"]]&order_by=creation desc&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch log list: ${response.status}`);
      }

      const data = await response.json();
      setLogList(data.data || []);
    } catch (error) {
      console.error("Error fetching log list:", error);
      setError("Failed to load check-in history");
    } finally {
      setLoading(false);
    }
  };

  const renderLogItem = ({ item }: { item: Log }) => {
    const formattedDate = moment(item.time);
    const isToday = formattedDate.isSame(moment(), "day");
    const isYesterday = formattedDate.isSame(
      moment().subtract(1, "day"),
      "day"
    );

    let dateDisplay;
    if (isToday) {
      dateDisplay = formattedDate.format("hh:mm a");
    } else if (isYesterday) {
      dateDisplay = formattedDate.format("hh:mm a") + " yesterday";
    } else {
      dateDisplay =
        formattedDate.format("hh:mm a") +
        " on " +
        formattedDate.format("D MMM");
    }

    return (
      <TouchableOpacity
        style={[
          styles.logItem,
          { backgroundColor: theme.colors.surfacePrimary },
        ]}
        onPress={() => item.name && onSelectLog(item.name)}
      >
        <View style={styles.logItemContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.logDetails}>
            <Text
              style={[styles.logTypeText, { color: theme.colors.textPrimary }]}
            >
              Log Type: {item.log_type}
            </Text>
            <Text
              style={[
                styles.logTimeText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {dateDisplay}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textTertiary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalHandleBar} onPress={onClose} />
            <Text
              style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
            >
              Check-in History
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.buttonPrimary}
              />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text
                style={[styles.errorText, { color: theme.statusColors.error }]}
              >
                {error}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: theme.colors.buttonPrimary },
                ]}
                onPress={fetchLogList}
              >
                <Text style={[styles.retryButtonText, { color: theme.colors.textInverted }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={logList}
              renderItem={renderLogItem}
              keyExtractor={(item, index) => item.name || index.toString()}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text
                    style={[
                      styles.emptyText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    No check-in records found
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    marginLeft: 48,
    opacity: 0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    marginBottom: 8,
  },
  logItem: {
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 6,
  },
  logItemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  logDetails: {
    flex: 1,
  },
  logTypeText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  logTimeText: {
    fontSize: 14,
  }
});

export default HistoryModal;
