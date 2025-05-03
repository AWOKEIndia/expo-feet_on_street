import { useState, useEffect } from "react";

interface ExpenseApproverInfo {
  user: string;
  name: string;
}

interface ExpenseApprovalDetails {
  leave_approvers: ExpenseApproverInfo[];
  department_approvers: ExpenseApproverInfo[];
}

const useExpenseApprovers = (accessToken: string, employeeId: string) => {
  const [expenseApprovalDetails, setExpenseApprovalDetails] =
    useState<ExpenseApprovalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpenseApprovalDetails = async () => {
    if (!accessToken || !employeeId) {
      setLoading(false);
      setError(new Error("Missing authentication token or email"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_expense_approval_details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            employee: employeeId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}. ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      const details: ExpenseApprovalDetails = {
        leave_approvers: data.message?.leave_approvers || [],
        department_approvers: data.message?.department_approvers || [],
      };

      setExpenseApprovalDetails(details);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leave approval details:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchExpenseApprovalDetails();
  };

  useEffect(() => {
    fetchExpenseApprovalDetails();
  }, [accessToken, employeeId]);

  return { expenseApprovalDetails, loading, error, refresh };
};

export default useExpenseApprovers;
