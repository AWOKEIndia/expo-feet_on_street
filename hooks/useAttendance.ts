import { useState, useRef, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';

interface CalendarEventData {
  [date: string]: string;
}

type AttendanceCache = {
  [monthKey: string]: CalendarEventData;
};

const useAttendance = (accessToken: string, employee: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    dayjs().date(1).startOf("day")
  );

  const cacheRef = useRef<AttendanceCache>({});

  const [currentMonthData, setCurrentMonthData] = useState<CalendarEventData>(
    {}
  );

  const getMonthKey = (month: dayjs.Dayjs) => {
    return month.format("YYYY-MM");
  };

  const getQueryBody = (month: dayjs.Dayjs) => {
    return {
      employee: employee,
      from_date: month.format("YYYY-MM-DD"),
      to_date: month.endOf("month").format("YYYY-MM-DD"),
    };
  };

  const fetchAttendanceData = useCallback(
    async (month: dayjs.Dayjs) => {
      const monthKey = getMonthKey(month);

      if (cacheRef.current[monthKey]) {
        setCurrentMonthData(cacheRef.current[monthKey]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_attendance_calendar_events`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: getQueryBody(month)
              ? JSON.stringify(getQueryBody(month))
              : null,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! Status: ${response.status}. ${errorText}`
          );
        }

        const result = await response.json();
        console.log("Attendance calendar events retrieved:", result);

        if (result.message) {
          // Update cache and current month data
          cacheRef.current[monthKey] = result.message;
          setCurrentMonthData(result.message);
        } else {
          console.warn("No attendance data found in response");
          cacheRef.current[monthKey] = {};
          setCurrentMonthData({});
        }
      } catch (error) {
        console.error("Error fetching attendance calendar events:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, employee]
  );

  const previousMonth = useCallback(() => {
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => prev.add(1, "month"));
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendanceData(currentMonth);
  }, [currentMonth, fetchAttendanceData]);

  // Load data when month changes
  useEffect(() => {
    fetchAttendanceData(currentMonth);
  }, [currentMonth, fetchAttendanceData]);

  return {
    data: currentMonthData,
    loading,
    error,
    refreshing,
    refresh,
    currentMonth,
    previousMonth,
    setCurrentMonth,
    nextMonth,
  };
};

export default useAttendance;
