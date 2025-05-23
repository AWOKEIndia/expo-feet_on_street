import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

// Frappe OAuth configuration
const FRAPPE_OAUTH_CONFIG = {
  clientId: `${process.env.EXPO_PUBLIC_CLIENT_ID}`,
  redirectUri: Linking.createURL("oauth/callback"),
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.integrations.oauth2.authorize`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.integrations.oauth2.get_token`,
  logoutEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.integrations.oauth2.revoke_token`,
};

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}

export interface EmployeeProfile {
  company: string; // This is the company name in the response
  department: string | null; // This is the employee department in the response
  designation: string | null; // This is the employee designation in the response
  employee_name: string; // This is the employee full name in the response
  first_name: string | null; // This is the employee name in the response
  name: string; // This is the employee ID in the response
  reports_to: string | null; // This is the manager ID in the response
  user_id: string | null; // This is the email field in the response
  email: string | null; // This does not exist in the response, but we can add it here for convenience
  [key: string]: any; // Allow additional properties
}

export const authService = {
  /**
   * Start the OAuth flow
   */
  async login(): Promise<AuthResult> {
    try {
      // Construct the authorization URL
      const authUrl =
        `${FRAPPE_OAUTH_CONFIG.authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(FRAPPE_OAUTH_CONFIG.clientId)}&` +
        `redirect_uri=${encodeURIComponent(FRAPPE_OAUTH_CONFIG.redirectUri)}&` +
        `scope=${encodeURIComponent("openid all")}&` +
        `response_type=code`;

      // Open the browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        FRAPPE_OAUTH_CONFIG.redirectUri
      );

      if (result.type === "success") {
        // Extract the authorization code from the redirect URL
        const { queryParams } = Linking.parse(result.url);
        const code = queryParams?.code;

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Exchange the code for tokens
        return await this.exchangeCodeForTokens(code as string);
      } else {
        throw new Error("Authentication was cancelled or failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  },

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<AuthResult> {
    try {
      const response = await fetch(FRAPPE_OAUTH_CONFIG.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: FRAPPE_OAUTH_CONFIG.clientId,
          code,
          redirect_uri: FRAPPE_OAUTH_CONFIG.redirectUri,
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Token exchange failed: ${
            errorData.error_description || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        scope: data.scope,
      };
    } catch (error) {
      console.error("Token exchange error:", error);
      throw error;
    }
  },

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const response = await fetch(FRAPPE_OAUTH_CONFIG.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: FRAPPE_OAUTH_CONFIG.clientId,
          refresh_token: refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Token refresh failed: ${
            errorData.error_description || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        scope: data.scope,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },

  /**
   * Logout from Frappe
   */
  async logout(accessToken: string): Promise<void> {
    try {
      const response = await fetch(FRAPPE_OAUTH_CONFIG.logoutEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          token: accessToken,
        }).toString(),
      });

      if (!response.ok) {
        console.warn("Frappe logout API call failed:", response.status);
        // We don't throw an error here because we still want to clear local tokens
      }
    } catch (error) {
      console.error("Logout error:", error);
      // We don't throw an error here because we still want to clear local tokens
    }
  },

  /**
   * Get the current user's employee record
   */
  async getEmployeeProfile(
    accessToken: string
  ): Promise<EmployeeProfile | null> {
    if (!accessToken) {
      console.warn("No access token provided for fetching employee profile.");
      return null;
    }
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_current_employee_info`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn("Failed to fetch employee profile:", response.status);
        return null;
      }

      const data = await response.json();
      return {
        email: data.message.user_id,
        ...data.message,
      };
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      return null;
    }
  },
};
