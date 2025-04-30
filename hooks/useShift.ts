import { useState, useEffect, useCallback } from "react";

export interface ShiftType {
  name: string;
}

const useShift = (accessToken: string) => {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShiftTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Shift Type`,
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

      if (result.data) {
        setShiftTypes(result.data);
      } else {
        setShiftTypes([]);
      }
    } catch (error) {
      console.error("Error fetching shift types:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchShiftTypes();
  }, [fetchShiftTypes]);

  useEffect(() => {
    fetchShiftTypes();
  }, [fetchShiftTypes]);

  return {
    data: shiftTypes,
    loading,
    error,
    refreshing,
    refresh,
  };
};

export default useShift;
