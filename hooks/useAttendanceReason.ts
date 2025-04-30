import { useState, useCallback, useEffect } from "react";

const useReasonOptions = (accessToken: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  const fetchReasonOptions = useCallback(async () => {

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_doctype_fields?doctype=Attendance Request`,
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
      const fields = result?.message;

      const reasonField = fields.find((field: any) => field.fieldname === "reason");

      if (reasonField?.options) {
        const parsedOptions = reasonField.options.split("\n").filter((opt: string) => opt.trim() !== "");
        setOptions(parsedOptions);
      } else {
        console.warn("No options found for 'reason' field");
        setOptions([]);
      }
    } catch (error) {
      console.error("Error fetching reason options:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, refreshing]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchReasonOptions();
  }, [fetchReasonOptions]);

  useEffect(() => {
    fetchReasonOptions();
  }, [fetchReasonOptions]);

  return {
    data: options,
    loading,
    error,
    refreshing,
    refresh,
  };
};

export default useReasonOptions;
