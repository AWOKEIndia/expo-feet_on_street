import { useState, useRef, useCallback, useEffect } from "react";

export interface Account {
  name: string;
}

export interface CostCenter {
  name: string;
}

type AccountingDataCache = {
  [key: string]: {
    accounts: Account[];
    costCenters: CostCenter[];
  };
};

const useAccountingData = (accessToken: string, companyId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);

  const cacheRef = useRef<AccountingDataCache>({});
  const cacheKey = `accounting_${companyId || "all"}`;

  const fetchAccountingData = useCallback(async () => {
    // Return cached data if available and not refreshing
    if (cacheRef.current[cacheKey] && !refreshing) {
      setAccounts(cacheRef.current[cacheKey].accounts);
      setCostCenters(cacheRef.current[cacheKey].costCenters);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch accounts list
      const accountsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Account`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text();
        throw new Error(`HTTP error! Status: ${accountsResponse.status}. ${errorText}`);
      }

      const accountsResult = await accountsResponse.json();
      console.log("Accounts list retrieved");

      // Fetch cost centers list
      const costCentersResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Cost Center`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!costCentersResponse.ok) {
        const errorText = await costCentersResponse.text();
        throw new Error(`HTTP error! Status: ${costCentersResponse.status}. ${errorText}`);
      }

      const costCentersResult = await costCentersResponse.json();
      console.log("Cost centers list retrieved");

      // Process accounts data
      if (accountsResult && accountsResult.data) {
        const accountsList = Array.isArray(accountsResult.data)
          ? accountsResult.data
          : [];

        setAccounts(accountsList);
      } else {
        console.warn("No accounts found in response");
        setAccounts([]);
      }

      // Process cost centers data
      if (costCentersResult && costCentersResult.data) {
        const costCentersList = Array.isArray(costCentersResult.data)
          ? costCentersResult.data
          : [];

        setCostCenters(costCentersList);
      } else {
        console.warn("No cost centers found in response");
        setCostCenters([]);
      }

      // Update cache
      cacheRef.current[cacheKey] = {
        accounts: accounts.length > 0 ? accounts : (accountsResult?.data || []),
        costCenters: costCenters.length > 0 ? costCenters : (costCentersResult?.data || [])
      };

    } catch (error) {
      console.error("Error fetching accounting data:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, cacheKey, refreshing, accounts, costCenters]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchAccountingData();
  }, [fetchAccountingData]);

  // Initial data fetch
  useEffect(() => {
    fetchAccountingData();
  }, [fetchAccountingData]);

  // Function to select an account by name
  const selectAccountByName = useCallback(
    (name: string) => {
      const account = accounts.find((acc) => acc.name === name) || null;
      setSelectedAccount(account);
      return account;
    },
    [accounts]
  );

  // Function to select a cost center by name
  const selectCostCenterByName = useCallback(
    (name: string) => {
      const costCenter = costCenters.find((cc) => cc.name === name) || null;
      setSelectedCostCenter(costCenter);
      return costCenter;
    },
    [costCenters]
  );

  // Clear selected items
  const clearSelectedAccount = useCallback(() => {
    setSelectedAccount(null);
  }, []);

  const clearSelectedCostCenter = useCallback(() => {
    setSelectedCostCenter(null);
  }, []);

  return {
    accounts,
    costCenters,
    loading,
    error,
    refreshing,
    refresh,
    selectedAccount,
    selectedCostCenter,
    selectAccountByName,
    selectCostCenterByName,
    clearSelectedAccount,
    clearSelectedCostCenter
  };
};

export default useAccountingData;
