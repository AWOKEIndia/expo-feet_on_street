import { useState, useRef, useCallback, useEffect } from 'react';

export interface AttendanceRequest {
  name: string;
  docstatus: number;
  reason: string;
  from_date: string;
  to_date: string;
  employee: string;
  employee_name: string;
  status: string;
  explanation?: string;
  department?: string;
  company?: string;
  shift?: string;
}

type AttendanceRequestsCache = {
  [key: string]: AttendanceRequest[];
};

const useAttendanceRequests = (accessToken: string, employeeId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRequest | null>(null);

  const cacheRef = useRef<AttendanceRequestsCache>({});
  const cacheKey = `attendance_${employeeId}`;

  const getStatusText = (docstatus: number) => {
    switch (docstatus) {
      case 0:
        return "Draft";
      case 1:
        return "Submitted";
      case 2:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const fetchAttendanceRequestDetails = async (requestId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Attendance Request/${requestId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}. ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`Details for attendance request ${requestId} retrieved:`, result);

      if (result && result.data) {
        return {
          ...result.data,
          status: getStatusText(result.data.docstatus)
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching details for attendance request ${requestId}:`, error);
      return null;
    }
  };

  const fetchAttendanceRequests = useCallback(async () => {
    if (cacheRef.current[cacheKey] && !refreshing) {
      setAttendanceRequests(cacheRef.current[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First fetch the list of attendance requests
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Attendance Request`,
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
        throw new Error(
          `HTTP error! Status: ${response.status}. ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Attendance requests list retrieved:", result);

      if (result && result.data) {
        const requestsList = Array.isArray(result.data) ? result.data : [];

        // Then fetch the details for each request
        const detailPromises = requestsList.map((request: { name: string }) =>
          fetchAttendanceRequestDetails(request.name)
        );

        const detailResults = await Promise.all(detailPromises);
        const formattedRequests = detailResults.filter(Boolean) as AttendanceRequest[];

        // Filter requests for the current employee if employeeId is provided
        const filteredRequests = employeeId
          ? formattedRequests.filter(req => req.employee === employeeId)
          : formattedRequests;

        // Update cache and current data
        cacheRef.current[cacheKey] = filteredRequests;
        setAttendanceRequests(filteredRequests);
      } else {
        console.warn("No attendance requests found in response");
        cacheRef.current[cacheKey] = [];
        setAttendanceRequests([]);
      }
    } catch (error) {
      console.error("Error fetching attendance requests:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, employeeId, cacheKey, refreshing]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendanceRequests();
  }, [fetchAttendanceRequests]);

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceRequests();
  }, [fetchAttendanceRequests]);

  const calculateDays = (fromDate: string, toDate: string) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Function to select an attendance request by ID
  const selectAttendanceById = useCallback((id: string) => {
    const attendance = attendanceRequests.find(req => req.name === id) || null;
    setSelectedAttendance(attendance);
    return attendance;
  }, [attendanceRequests]);

  // Clear the selected attendance
  const clearSelectedAttendance = useCallback(() => {
    setSelectedAttendance(null);
  }, []);

  return {
    data: attendanceRequests,
    loading,
    error,
    refreshing,
    refresh,
    calculateDays,
    selectedAttendance,
    selectAttendanceById,
    clearSelectedAttendance
  };
};

export default useAttendanceRequests;
