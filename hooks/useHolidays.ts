import { useState, useRef, useCallback, useEffect } from "react";

export interface Holiday {
  name: string;
  holiday_date: string;
  description: string;
}

type HolidaysCache = {
  [key: string]: Holiday[];
};

const useHolidays = (accessToken: string, employeeId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const cacheRef = useRef<HolidaysCache>({});
  const cacheKey = `holidays_${employeeId}`;

  const fetchHolidays = useCallback(async () => {
    if (cacheRef.current[cacheKey] && !refreshing) {
      setHolidays(cacheRef.current[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_holidays_for_employee`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            employee: employeeId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();
      console.log("Holidays retrieved");

      if (result.message) {
        const holidaysList = Array.isArray(result.message)
          ? result.message
          : [];

        // Update cache and current data
        cacheRef.current[cacheKey] = holidaysList;
        setHolidays(holidaysList);
      } else {
        console.warn("No holidays found in response");
        cacheRef.current[cacheKey] = [];
        setHolidays([]);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, employeeId, cacheKey, refreshing]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchHolidays();
  }, [fetchHolidays]);

  // Initial data fetch
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return {
    data: holidays,
    loading,
    error,
    refreshing,
    refresh,
  };
};

export default useHolidays;
