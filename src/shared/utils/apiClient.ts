import type { ApiResponse, ApiError, ApiHeaders } from "../types";
import { apiConfig, apiEndpoints, apiSettings } from "../constants/apiConfig";

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: ApiHeaders;

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
    this.timeout = apiConfig.timeout;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (apiSettings.apiKey) {
      this.defaultHeaders["X-API-Key"] = apiSettings.apiKey;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      mode: "cors",
      credentials: "include",
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      if (apiSettings.enableLogging && apiSettings.isDevelopment) {
        console.log(`🚀 API Request: ${config.method || "GET"} ${url}`);
        console.log(`📋 Request Config:`, config);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle 204 No Content response
      let data = null;
      if (response.status !== 204) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      }

      if (apiSettings.enableLogging && apiSettings.isDevelopment) {
        console.log(`✅ API Response: ${response.status}`, data);
      }

      if (!response.ok) {
        const error: ApiError = {
          message:
            data?.message || `HTTP ${response.status}: ${response.statusText}`,
          code: response.status,
          details: data,
        };
        throw error;
      }

      return {
        success: true,
        data: data, // Return full backend response
        message: data?.message || data?.errorMessage || "Success",
        code: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (apiSettings.enableLogging && apiSettings.isDevelopment) {
        console.error(`❌ API Error:`, error);
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw {
          message: "Request timeout",
          code: 408,
        } as ApiError;
      }

      throw error;
    }
  }

  // HTTP Methods
  async get<T>(
    endpoint: string,
    headers?: ApiHeaders
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "GET", headers });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: ApiHeaders
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: ApiHeaders
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    headers?: ApiHeaders
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "DELETE", headers });
  }

  // Convenience methods for common endpoints
  get endpoints() {
    return apiEndpoints;
  }

  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
