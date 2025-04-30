import { useState, useRef, useCallback, useEffect } from "react";

export interface LeaveApplication {
  name: string;
  id: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  status: string;
}

type LeaveApplicationsCache = {
  [key: string]: LeaveApplication[];
};

const useLeaveApplications = (accessToken: string, employeeId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveApplications, setLeaveApplications] = useState<
    LeaveApplication[]
  >([]);

  const cacheRef = useRef<LeaveApplicationsCache>({});
  const cacheKey = `leaves_${employeeId}`;

  const fetchLeaveApplications = useCallback(async () => {
    if (cacheRef.current[cacheKey] && !refreshing) {
      setLeaveApplications(cacheRef.current[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_leave_applications`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            employee: employeeId,
            limit: 10,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();
      console.log("Leave applications retrieved");

      if (result.message) {
        const applications = Array.isArray(result.message)
          ? result.message
          : [];

        // Update cache and current data
        cacheRef.current[cacheKey] = applications;
        setLeaveApplications(applications);
      } else {
        console.warn("No leave applications found in response");
        cacheRef.current[cacheKey] = [];
        setLeaveApplications([]);
      }
    } catch (error) {
      console.error("Error fetching leave applications:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, employeeId, cacheKey, refreshing]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaveApplications();
  }, [fetchLeaveApplications]);

  // Initial data fetch
  useEffect(() => {
    fetchLeaveApplications();
  }, [fetchLeaveApplications]);

  return {
    data: leaveApplications,
    loading,
    error,
    refreshing,
    refresh,
  };
};

export default useLeaveApplications;
