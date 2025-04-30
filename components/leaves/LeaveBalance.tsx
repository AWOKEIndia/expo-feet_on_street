import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Modal from "react-native-modal";
import LeaveRequestForm from "./LeaveRequests/LeaveRequestForm";

type LeaveBalanceType = {
  type: string;
  used: number;
  total: number;
  color: string;
};

type LeaveBalanceProps = {
  theme: any;
  isDark: boolean;
  leaveBalances: LeaveBalanceType[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
};

const LeaveBalance = ({
  theme,
  isDark,
  leaveBalances,
  loading,
  refresh,
}: LeaveBalanceProps) => {
  const scrollViewRef = useRef(null);

  const [isLeaveFormVisible, setIsLeaveFormVisible] = useState(false);

  const handleLeaveFormSubmit = (data: any) => {
    refresh();
    setIsLeaveFormVisible(false);
  };

  const RequestLeaveButton = () => (
    <View style={styles.requestButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.requestButton,
          {
            backgroundColor: theme.colors.buttonPrimary,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
              },
              android: {
                elevation: 5,
              },
            }),
          },
        ]}
        onPress={() => setIsLeaveFormVisible(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={theme.colors.textInverted}
          style={styles.requestButtonIcon}
        />
        <Text
          style={[
            styles.requestButtonText,
            { color: theme.colors.textInverted },
          ]}
        >
          Request a Leave
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={[styles.leaveBalanceContainer, { paddingBottom: 8 }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.brandColors.primary} />
          </View>
        ) : leaveBalances.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            ref={scrollViewRef}
            contentContainerStyle={{ paddingVertical: 6 }}
          >
            {leaveBalances.map((leave, index) => {
              const fillPercentage =
                leave.total > 0
                  ? ((leave.total - leave.used) / leave.total) * 100
                  : 0;
              const remainingLeaves = leave.total - leave.used;

              return (
                <View
                  key={index}
                  style={[
                    styles.leaveBalanceCard,
                    {
                      backgroundColor: theme.colors.surfacePrimary,
                      ...Platform.select({
                        ios: {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isDark ? 0.22 : 0.15,
                          shadowRadius: 3,
                        },
                        android: {
                          elevation: 4,
                        },
                      }),
                    },
                  ]}
                >
                  <View style={styles.leaveBalanceProgress}>
                    <View style={styles.gaugeContainer}>
                      <View style={[styles.gaugeLabel, styles.startLabel]}>
                        <Text
                          style={[
                            styles.gaugeLabelText,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          0
                        </Text>
                      </View>

                      <AnimatedCircularProgress
                        size={100}
                        width={8}
                        fill={fillPercentage}
                        tintColor={leave.color}
                        backgroundColor={
                          isDark ? theme.colors.surfaceSecondary : "#f0f0f0"
                        }
                        arcSweepAngle={240}
                        rotation={240}
                        lineCap="round"
                      >
                        {() => (
                          <View style={styles.gaugeTextContainer}>
                            <Text
                              style={[
                                styles.gaugeValueText,
                                { color: theme.colors.textPrimary },
                              ]}
                            >
                              {remainingLeaves.toFixed(
                                remainingLeaves % 1 === 0 ? 0 : 1
                              )}
                            </Text>
                            <Text
                              style={[
                                styles.gaugeUnitText,
                                { color: theme.colors.textSecondary },
                              ]}
                            >
                              left
                            </Text>
                          </View>
                        )}
                      </AnimatedCircularProgress>

                      <View style={[styles.gaugeLabel, styles.endLabel]}>
                        <Text
                          style={[
                            styles.gaugeLabelText,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {leave.total}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.leaveBalanceType,
                      { color: theme.colors.textPrimary, marginTop: 12 },
                    ]}
                  >
                    {leave.type}
                  </Text>
                  <Text
                    style={[
                      styles.leaveBalanceDetails,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {leave.used.toFixed(leave.used % 1 === 0 ? 0 : 1)}/
                    {leave.total.toFixed(leave.total % 1 === 0 ? 0 : 1)} used
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text
            style={[
              styles.emptyListText,
              {
                color: theme.colors.textSecondary,
                textAlign: "center",
                padding: 16,
              },
            ]}
          >
            No leave balance information available
          </Text>
        )}
      </View>
      <RequestLeaveButton />

      {/* Modal to contain the LeaveRequestForm */}
      <Modal
        isVisible={isLeaveFormVisible}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
        style={{ margin: 0, justifyContent: "flex-end" }}
        onBackdropPress={() => setIsLeaveFormVisible(false)}
        onBackButtonPress={() => setIsLeaveFormVisible(false)}
      >
        <LeaveRequestForm
          onSubmit={handleLeaveFormSubmit}
          onCancel={() => setIsLeaveFormVisible(false)}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  leaveBalanceContainer: {
    paddingLeft: 16,
  },
  leaveBalanceCard: {
    width: 170,
    height: 200,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  leaveBalanceProgress: {
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeLabel: {
    position: "absolute",
    top: 78,
  },
  startLabel: {
    left: 0,
  },
  endLabel: {
    right: -2,
  },
  gaugeLabelText: {
    fontSize: 12,
    fontWeight: "500",
  },
  gaugeTextContainer: {
    alignItems: "center",
  },
  gaugeValueText: {
    fontSize: 24,
    fontWeight: "600",
  },
  gaugeUnitText: {
    fontSize: 12,
  },
  leaveBalanceType: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  leaveBalanceDetails: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  requestButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  requestButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  requestButtonIcon: {
    marginRight: 8,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyListText: {
    textAlign: "center",
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LeaveBalance;
