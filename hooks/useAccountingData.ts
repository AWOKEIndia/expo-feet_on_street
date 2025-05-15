import { useState, useRef, useCallback, useEffect } from "react";

export interface Account {
  name: string;
}

export interface CostCenter {
  name: string;
}

export interface PaymentMode {
  name: string;
}

export interface CompanyCurrency {
  code: string;
  symbol: string;
}

type AccountingDataCache = {
  [key: string]: {
    accounts: Account[];
    costCenters: CostCenter[];
    paymentModes: PaymentMode[];
    companyCurrency: CompanyCurrency | null;
  };
};

const useAccountingData = (accessToken: string, companyId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [companyCurrency, setCompanyCurrency] = useState<CompanyCurrency | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode | null>(null);

  const cacheRef = useRef<AccountingDataCache>({});
  const cacheKey = `accounting_${companyId || "all"}`;

  const fetchAccountingData = useCallback(async () => {
    // Return cached data if available and not refreshing
    if (cacheRef.current[cacheKey] && !refreshing) {
      setAccounts(cacheRef.current[cacheKey].accounts);
      setCostCenters(cacheRef.current[cacheKey].costCenters);
      setPaymentModes(cacheRef.current[cacheKey].paymentModes);
      setCompanyCurrency(cacheRef.current[cacheKey].companyCurrency);
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

      // Fetch payment modes list
      const paymentModesResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Mode of Payment`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!paymentModesResponse.ok) {
        const errorText = await paymentModesResponse.text();
        throw new Error(`HTTP error! Status: ${paymentModesResponse.status}. ${errorText}`);
      }

      const paymentModesResult = await paymentModesResponse.json();
      console.log("Payment modes list retrieved");

      // Fetch company currency
      const currencyResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_company_currencies`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!currencyResponse.ok) {
        const errorText = await currencyResponse.text();
        throw new Error(`HTTP error! Status: ${currencyResponse.status}. ${errorText}`);
      }

      const currencyResult = await currencyResponse.json();
      console.log("Company currency retrieved");

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

      // Process payment modes data
      if (paymentModesResult && paymentModesResult.data) {
        const paymentModesList = Array.isArray(paymentModesResult.data)
          ? paymentModesResult.data
          : [];

        setPaymentModes(paymentModesList);
      } else {
        console.warn("No payment modes found in response");
        setPaymentModes([]);
      }

      // Process company currency data
      let currencyData: CompanyCurrency | null = null;
      if (currencyResult && currencyResult.message) {
        const companyCode = Object.keys(currencyResult.message)[0];
        if (companyCode && Array.isArray(currencyResult.message[companyCode]) && currencyResult.message[companyCode].length >= 2) {
          currencyData = {
            code: currencyResult.message[companyCode][0],
            symbol: currencyResult.message[companyCode][1]
          };
          setCompanyCurrency(currencyData);
          console.log(`Company currency set: ${currencyData.code} (${currencyData.symbol})`);
        } else {
          console.warn("Invalid currency data format in response");
          setCompanyCurrency(null);
        }
      } else {
        console.warn("No currency data found in response");
        setCompanyCurrency(null);
      }

      // Update cache
      cacheRef.current[cacheKey] = {
        accounts: accounts.length > 0 ? accounts : (accountsResult?.data || []),
        costCenters: costCenters.length > 0 ? costCenters : (costCentersResult?.data || []),
        paymentModes: paymentModes.length > 0 ? paymentModes : (paymentModesResult?.data || []),
        companyCurrency: currencyData
      };

    } catch (error) {
      console.error("Error fetching accounting data:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, cacheKey, refreshing, accounts, costCenters, paymentModes]);

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

  // Function to select a payment mode by name
  const selectPaymentModeByName = useCallback(
    (name: string) => {
      const paymentMode = paymentModes.find((pm) => pm.name === name) || null;
      setSelectedPaymentMode(paymentMode);
      return paymentMode;
    },
    [paymentModes]
  );

  // Clear selected items
  const clearSelectedAccount = useCallback(() => {
    setSelectedAccount(null);
  }, []);

  const clearSelectedCostCenter = useCallback(() => {
    setSelectedCostCenter(null);
  }, []);

  const clearSelectedPaymentMode = useCallback(() => {
    setSelectedPaymentMode(null);
  }, []);

  return {
    accounts,
    costCenters,
    paymentModes,
    companyCurrency,
    loading,
    error,
    refreshing,
    refresh,
    selectedAccount,
    selectedCostCenter,
    selectedPaymentMode,
    selectAccountByName,
    selectCostCenterByName,
    selectPaymentModeByName,
    clearSelectedAccount,
    clearSelectedCostCenter,
    clearSelectedPaymentMode
  };
};

export default useAccountingData;
