import { apiClient } from "../shared/utils/apiClient";
import type {
  BackendResponse,
  RegisterRequest,
  ConfirmRegisterRequest,
  ConfirmRegisterResponse,
  LoginRequest,
  LoginResponse,
  BackendUserProfile,
  UpdateUserRequest,
} from "../shared/types/backend-api.types";

class AuthService {
  /**
   * Register a new user - sends OTP to email
   */
  async register(userData: RegisterRequest): Promise<BackendResponse<null>> {
    const response = await apiClient.post<BackendResponse<null>>(
      apiClient.endpoints.auth.register,
      userData
    );
    return response.data!;
  }

  /**
   * Confirm registration with OTP
   */
  async confirmRegister(
    confirmData: ConfirmRegisterRequest
  ): Promise<BackendResponse<ConfirmRegisterResponse>> {
    const response = await apiClient.post<
      BackendResponse<ConfirmRegisterResponse>
    >(apiClient.endpoints.auth.confirmRegister, confirmData);
    return response.data!;
  }

  /**
   * Login user
   */
  async login(
    credentials: LoginRequest
  ): Promise<BackendResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<BackendResponse<LoginResponse>>(
        apiClient.endpoints.auth.login,
        credentials
      );

      console.log("🔍 AuthService - Raw API response:", response);

      // Handle successful response
      if (response.data) {
        console.log("🔍 AuthService - Response data:", response.data);

        // Set token for future requests if login successful
        if (response.data.status && response.data.data?.token) {
          console.log(
            "✅ AuthService - Setting token:",
            response.data.data.token
          );
          apiClient.setAuthToken(response.data.data.token);
        }
        return response.data;
      }

      // Handle 204 No Content or empty response
      throw new Error("Login response is empty");
    } catch (error) {
      console.error("❌ AuthService Login error:", error);
      throw error;
    }
  }

  /**
   * Get current user profile (requires authentication)
   */
  async getUserProfile(): Promise<BackendResponse<BackendUserProfile>> {
    const response = await apiClient.get<BackendResponse<BackendUserProfile>>(
      apiClient.endpoints.user.profile
    );
    return response.data!;
  }

  /**
   * Update user profile (requires authentication)
   */
  async updateUserProfile(
    updateData: UpdateUserRequest
  ): Promise<BackendResponse<BackendUserProfile>> {
    const response = await apiClient.put<BackendResponse<BackendUserProfile>>(
      apiClient.endpoints.user.profile,
      updateData
    );
    return response.data!;
  }

  /**
   * Logout user (requires authentication)
   */
  async logout(): Promise<BackendResponse<null>> {
    const response = await apiClient.post<BackendResponse<null>>(
      apiClient.endpoints.auth.logout
    );

    // Remove token after logout
    apiClient.removeAuthToken();

    return response.data!;
  }

  /**
   * Reset password - send OTP to email
   */
  async resetPassword(email: string): Promise<BackendResponse<null>> {
    const response = await apiClient.post<BackendResponse<null>>(
      apiClient.endpoints.auth.resetPassword,
      { email }
    );
    return response.data!;
  }

  /**
   * Confirm reset password with OTP
   */
  async confirmResetPassword(data: {
    email: string;
    new_password: string;
    otp: string;
  }): Promise<BackendResponse<null>> {
    const response = await apiClient.post<BackendResponse<null>>(
      apiClient.endpoints.auth.confirmResetPassword,
      data
    );
    return response.data!;
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {
    apiClient.setAuthToken(token);
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    apiClient.removeAuthToken();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
