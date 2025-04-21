import { useState, useRef, useCallback, useEffect } from 'react';

export interface LeaveBalance {
  leave_type: string;
  used_leaves: number;
  total_leaves: number;
  balance_leaves: number;
}

type LeaveBalanceMapResponse = {
  message: {
    [key: string]: {
      allocated_leaves: number;
      balance_leaves: number;
    }
  }
};

type LeaveBalanceCache = {
  [key: string]: LeaveBalance[];
};

const useLeaveBalance = (accessToken: string, employeeId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);

  const cacheRef = useRef<LeaveBalanceCache>({});
  const cacheKey = `leave_balance_${employeeId}`;

  const fetchLeaveBalance = useCallback(async () => {
    if (cacheRef.current[cacheKey] && !refreshing) {
      setLeaveBalances(cacheRef.current[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_leave_balance_map`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            employee: employeeId
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}. ${errorText}`
        );
      }

      const result = await response.json() as LeaveBalanceMapResponse;
      console.log("Leave balance retrieved:", result);

      if (result.message) {
        // Transform the nested object format to an array of LeaveBalance objects
        const balances: LeaveBalance[] = Object.entries(result.message).map(([leaveType, details]) => ({
          leave_type: leaveType,
          total_leaves: details.allocated_leaves,
          balance_leaves: details.balance_leaves,
          used_leaves: details.allocated_leaves - details.balance_leaves
        }));

        // Update cache and current data
        cacheRef.current[cacheKey] = balances;
        setLeaveBalances(balances);
      } else {
        console.warn("No leave balance found in response");
        cacheRef.current[cacheKey] = [];
        setLeaveBalances([]);
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, employeeId, cacheKey, refreshing]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaveBalance();
  }, [fetchLeaveBalance]);

  // Initial data fetch
  useEffect(() => {
    if (employeeId) {
      fetchLeaveBalance();
    }
  }, [fetchLeaveBalance, employeeId]);

  return {
    data: leaveBalances,
    loading,
    error,
    refreshing,
    refresh
  };
};

export default useLeaveBalance;
