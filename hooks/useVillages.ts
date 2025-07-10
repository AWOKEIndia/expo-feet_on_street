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
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchVillages = useCallback(async (
    query: string = "",
    page: number = 0,
    reset: boolean = true
  ) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      const limit = 50; // Increased limit for better UX
      const offset = page * limit;

      // Build the API URL with search and pagination
      let apiUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Village/?limit=${limit}&offset=${offset}`;

      // Add search filters if query exists
      if (query.trim()) {
        // Search in both name and village_name fields
        const searchFilter = `["or", ["name", "like", "%${query}%"], ["village_name", "like", "%${query}%"]]`;
        apiUrl += `&filters=${encodeURIComponent(searchFilter)}`;
      }

      // Add fields to get both name and village_name
      apiUrl += `&fields=["name", "village_name", "village_code"]`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();

      if (result.data) {
        const newVillages = result.data;

        if (reset || page === 0) {
          setVillages(newVillages);
        } else {
          setVillages(prev => [...prev, ...newVillages]);
        }

        // Check if there are more pages
        setHasMore(newVillages.length === limit);
        setCurrentPage(page);
      } else {
        if (reset) {
          setVillages([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching villages:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
      if (reset) {
        setVillages([]);
      }
    } finally {
      if (reset) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, [accessToken]);

  const searchVillages = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      fetchVillages(query, 0, true);
    }, 300);
  }, [fetchVillages]);

  const loadMoreVillages = useCallback(() => {
    if (!loading && hasMore) {
      fetchVillages(searchQuery, currentPage + 1, false);
    }
  }, [fetchVillages, loading, hasMore, currentPage, searchQuery]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(0);
    fetchVillages(searchQuery, 0, true);
  }, [fetchVillages, searchQuery]);

  // Initial load with empty search
  useEffect(() => {
    fetchVillages("", 0, true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    data: villages,
    loading,
    error,
    refreshing,
    refresh,
    searchVillages,
    loadMoreVillages,
    hasMore,
    searchQuery,
  };
};

export default useVillage;
