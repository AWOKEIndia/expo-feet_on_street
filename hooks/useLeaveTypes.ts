import { useState, useRef, useCallback, useEffect } from "react";
import useLeaveBalance from "./useLeaveBalance";

export interface LeaveType {
  name: string;
  docstatus: number;
  leave_type_name: string;
  max_days_allowed: number;
  is_carry_forward: boolean;
  is_earned_leave: boolean;
  allow_encashment: boolean;
  is_lwp: boolean;
  status: string;
  description?: string;
  company?: string;
  applicable_after?: number;
  balance_leaves?: number;
}

type LeaveTypesCache = {
  [key: string]: LeaveType[];
};

const useLeaveTypes = (accessToken: string, employeeId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(
    null
  );

  // Use the leave balance hook
  const {
    data: leaveBalances,
    loading: balanceLoading,
    error: balanceError,
    refresh: refreshBalances,
  } = useLeaveBalance(accessToken, employeeId);

  const cacheRef = useRef<LeaveTypesCache>({});
  const cacheKey = "leave_types";

  const getStatusText = (docstatus: number) => {
    switch (docstatus) {
      case 0:
        return "Draft";
      case 1:
        return "Active";
      case 2:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const fetchLeaveTypeDetails = async (leaveTypeId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Leave Type/${leaveTypeId}`,
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
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();
      console.log(`Details for leave type ${leaveTypeId} retrieved`);

      if (result && result.data) {
        return {
          ...result.data,
          status: getStatusText(result.data.docstatus),
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching details for leave type ${leaveTypeId}`);
      return null;
    }
  };

  const fetchLeaveTypes = useCallback(async () => {
    if (cacheRef.current[cacheKey] && !refreshing) {
      // If we have cached data, use it but still update the balance info
      const enrichedTypes = enrichLeaveTypesWithBalance(
        cacheRef.current[cacheKey],
        leaveBalances
      );
      setLeaveTypes(enrichedTypes);
      // Filter for display in dropdown
      const filtered = filterLeaveTypesForDisplay(enrichedTypes);
      setFilteredLeaveTypes(filtered);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First fetch the list of leave types
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Leave Type`,
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
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();
      console.log("Leave types list retrieved");

      if (result && result.data) {
        const leaveTypesList = Array.isArray(result.data) ? result.data : [];

        // Then fetch the details for each leave type
        const detailPromises = leaveTypesList.map(
          (leaveType: { name: string }) => fetchLeaveTypeDetails(leaveType.name)
        );

        const detailResults = await Promise.all(detailPromises);
        let formattedLeaveTypes = detailResults.filter(Boolean) as LeaveType[];

        // Update cache with all leave types
        cacheRef.current[cacheKey] = formattedLeaveTypes;

        // Enrich all leave types with balance info
        const enrichedTypes = enrichLeaveTypesWithBalance(
          formattedLeaveTypes,
          leaveBalances
        );
        setLeaveTypes(enrichedTypes);

        // Filter for display in dropdown
        const filtered = filterLeaveTypesForDisplay(enrichedTypes);
        setFilteredLeaveTypes(filtered);
      } else {
        console.warn("No leave types found in response");
        cacheRef.current[cacheKey] = [];
        setLeaveTypes([]);
        setFilteredLeaveTypes([]);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, cacheKey, refreshing, leaveBalances]);

  // Helper function to enrich leave types with balance info
  const enrichLeaveTypesWithBalance = (
    types: LeaveType[],
    balances: { leave_type: string; balance_leaves: number }[]
  ) => {
    if (!balances || !balances.length) return types;

    // Create a map of leave type to balance for quick lookup
    const balanceMap: Record<string, number> = {};
    balances.forEach((balance) => {
      balanceMap[balance.leave_type] = balance.balance_leaves;
    });

    // Add balance information to all leave types
    return types.map((type) => ({
      ...type,
      balance_leaves:
        balanceMap[type.leave_type_name] !== undefined
          ? balanceMap[type.leave_type_name]
          : 0,
    }));
  };

  // Filter leave types for display in dropdown
  // Only show types with positive balance OR Leave Without Pay types
  const filterLeaveTypesForDisplay = (types: LeaveType[]) => {
    return types.filter((type) => {
      // Always include Leave Without Pay
      if (type.is_lwp) return true;

      // Include types with positive balance
      return type.balance_leaves !== undefined && type.balance_leaves > 0;
    });
  };

  // Get balance for a specific leave type
  const getBalanceForLeaveType = useCallback(
    (leaveTypeName: string): number => {
      const leaveType = leaveTypes.find((type) => type.name === leaveTypeName);
      return leaveType?.balance_leaves || 0;
    },
    [leaveTypes]
  );

  // Calculate days between two dates (inclusive)
  const calculateDaysBetween = (
    fromDate?: Date | null,
    toDate?: Date | null,
    isHalfDay: boolean = false
  ): number => {
    if (!fromDate || !toDate) return 0;

    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    // Clone dates to avoid modifying the original objects
    const start = new Date(fromDate);
    const end = new Date(toDate);

    // Reset time part for accurate date difference calculation
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffDays =
      Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1;

    // Adjust for half day if applicable
    return isHalfDay ? diffDays - 0.5 : diffDays;
  };

  const refresh = useCallback(() => {
    setRefreshing(true);
    refreshBalances();
    fetchLeaveTypes();
  }, [fetchLeaveTypes, refreshBalances]);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes, leaveBalances]);

  // Function to select a leave type by ID
  const selectLeaveTypeById = useCallback(
    (id: string) => {
      const leaveType = leaveTypes.find((type) => type.name === id) || null;
      setSelectedLeaveType(leaveType);
      return leaveType;
    },
    [leaveTypes]
  );

  const clearSelectedLeaveType = useCallback(() => {
    setSelectedLeaveType(null);
  }, []);

  return {
    data: filteredLeaveTypes, // Return filtered list for display
    allLeaveTypes: leaveTypes, // Return all leave types with balance info
    loading: loading || balanceLoading,
    error: error || balanceError,
    refreshing,
    refresh,
    selectedLeaveType,
    selectLeaveTypeById,
    clearSelectedLeaveType,
    getBalanceForLeaveType,
    calculateDaysBetween,
  };
};

export default useLeaveTypes;
