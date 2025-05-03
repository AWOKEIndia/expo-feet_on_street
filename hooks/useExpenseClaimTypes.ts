import { useState, useEffect, useCallback } from "react";

export interface ExpenseClaimType {
  name: string;
}

const useExpenseClaimTypes = (accessToken: string) => {
  const [expenseClaimTypes, setExpenseClaimTypes] = useState<ExpenseClaimType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExpenseClaimTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_expense_claim_types`,
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

      if (result.message) {
        setExpenseClaimTypes(result.message);
      } else {
        setExpenseClaimTypes([]);
      }
    } catch (error) {
      console.error("Error fetching expense claim types:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenseClaimTypes();
  }, [fetchExpenseClaimTypes]);

  useEffect(() => {
    fetchExpenseClaimTypes();
  }, [fetchExpenseClaimTypes]);

  return {
    data: expenseClaimTypes,
    loading,
    error,
    refreshing,
    refresh,
  };
};

export default useExpenseClaimTypes;
