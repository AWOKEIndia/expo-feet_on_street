import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, AuthResult, type EmployeeProfile } from '../services/auth';

// Storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  error: Error | null;
  employeeProfile: EmployeeProfile | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    error: null,
    employeeProfile: null,
  });

  // Fetch employee profile helper function
  const fetchEmployeeProfile = async (token: string) => {
    return await authService.getEmployeeProfile(token);
  };

  // Load tokens from storage on mount
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const [accessToken, refreshToken, tokenExpiry] = await Promise.all([
          AsyncStorage.getItem(ACCESS_TOKEN_KEY),
          AsyncStorage.getItem(REFRESH_TOKEN_KEY),
          AsyncStorage.getItem(TOKEN_EXPIRY_KEY),
        ]);

        if (accessToken) {
          const expiryTime = tokenExpiry ? parseInt(tokenExpiry, 10) : 0;
          const isExpired = Date.now() >= expiryTime;

          if (isExpired && refreshToken) {
            // Token is expired, try to refresh it
            try {
              const result = await authService.refreshToken(refreshToken);
              await saveTokens(result);
              const employeeProfile = await fetchEmployeeProfile(result.accessToken);
              setState({
                isAuthenticated: true,
                isLoading: false,
                accessToken: result.accessToken,
                error: null,
                employeeProfile,
              });
            } catch (refreshError) {
              // Refresh failed, clear tokens
              await clearTokens();
              setState({
                isAuthenticated: false,
                isLoading: false,
                accessToken: null,
                error: refreshError as Error,
                employeeProfile: null,
              });
            }
          } else {
            // Token is still valid
            const employeeProfile = await fetchEmployeeProfile(accessToken);
            setState({
              isAuthenticated: true,
              isLoading: false,
              accessToken,
              error: null,
              employeeProfile,
            });
          }
        } else {
          setState({
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
            error: null,
            employeeProfile: null,
          });
        }
      } catch (error) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
          error: error as Error,
          employeeProfile: null,
        });
      }
    };

    loadTokens();
  }, []);

  // Save tokens to storage
  const saveTokens = async (result: AuthResult) => {
    const expiryTime = result.expiresIn
      ? Date.now() + result.expiresIn * 1000
      : Date.now() + 3600 * 1000; // Default 1 hour

    await Promise.all([
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken),
      AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString()),
    ]);

    if (result.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    }
  };

  // Clear tokens from storage
  const clearTokens = async () => {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(TOKEN_EXPIRY_KEY),
    ]);
  };

  // Login function
  const login = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authService.login();
      await saveTokens(result);

      // Fetch employee profile after successful login
      const employeeProfile = await fetchEmployeeProfile(result.accessToken);

      setState({
        isAuthenticated: true,
        isLoading: false,
        accessToken: result.accessToken,
        error: null,
        employeeProfile,
      });

      return result;
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        error: error as Error,
        employeeProfile: null,
      });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Call Frappe logout API if we have an access token
      if (state.accessToken) {
        await authService.logout(state.accessToken);
      }

      // Clear local tokens regardless of API call success
      await clearTokens();

      setState({
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        error: null,
        employeeProfile: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear tokens even if there was an error
      await clearTokens();
      setState({
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        error: null,
        employeeProfile: null,
      });
    }
  }, [state.accessToken]);

  return {
    ...state,
    login,
    logout,
  };
}
