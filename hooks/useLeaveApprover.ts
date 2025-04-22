import { useState, useEffect } from "react";

interface ApproverInfo {
  user: string;
  name: string;
}

interface ApprovalDetails {
  leave_approvers: ApproverInfo[];
  department_approvers: ApproverInfo[];
}

const useLeaveApprovers = (accessToken: string, employeeId: string) => {
  const [approvalDetails, setApprovalDetails] =
    useState<ApprovalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApprovalDetails = async () => {
    if (!accessToken || !employeeId) {
      setLoading(false);
      setError(new Error("Missing authentication token or email"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_leave_approval_details`,
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

      const details: ApprovalDetails = {
        leave_approvers: data.message?.leave_approvers || [],
        department_approvers: data.message?.department_approvers || [],
      };

      setApprovalDetails(details);
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
    fetchApprovalDetails();
  };

  useEffect(() => {
    fetchApprovalDetails();
  }, [accessToken, employeeId]);

  return { approvalDetails, loading, error, refresh };
};

export default useLeaveApprovers;
