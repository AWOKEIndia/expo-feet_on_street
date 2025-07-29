// hooks/useVillage.ts (Updated)

import { useState, useEffect, useCallback, useRef } from "react";

export interface Village {
  name: string;
  village_name?: string;
  village_code?: string;
}

const useVillage = (accessToken: string) => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Pagination state is no longer needed for this UI, but we leave it for potential future use
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchVillages = useCallback(
    async (query: string = "") => {
      if (!accessToken) return;
      setLoading(true);
      setError(null);

      // ✅ FIX: Fetch a smaller number of results suitable for a suggestion list.
      const limit = 10;

      try {
        let apiUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Village/?limit=${limit}`;

        if (query.trim()) {
          const searchFilter = `[["village_name", "like", "%${query}%"]]`;
          apiUrl += `&filters=${encodeURIComponent(searchFilter)}`;
        }
        apiUrl += `&fields=["name", "village_name", "village_code"]`;

        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch villages.");

        const result = await response.json();
        setVillages(result.data || []);
      } catch (err) {
        console.error("Error fetching villages:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setVillages([]);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const searchVillages = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        fetchVillages(query);
      }, 300);
    },
    [fetchVillages]
  );

  useEffect(() => {
    fetchVillages("");
  }, [fetchVillages]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return {
    data: villages,
    loading,
    error,
    searchVillages,
  };
};

export default useVillage;
