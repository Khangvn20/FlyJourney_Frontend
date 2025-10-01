import type { ApiResponse, ApiError, ApiHeaders } from "../types";
import { apiConfig, apiEndpoints, apiSettings } from "../constants/apiConfig";
import { DEV_CONFIG, shouldShowDevControls } from "../config/devConfig";

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: ApiHeaders;
  private pendingRequests: Map<string, Promise<ApiResponse<unknown>>> =
    new Map();

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
    this.timeout = apiConfig.timeout;
    // Chỉ set Accept header, Content-Type sẽ được set động
    this.defaultHeaders = {
      Accept: "application/json",
    };

    if (apiSettings.apiKey) {
      this.defaultHeaders["X-API-Key"] = apiSettings.apiKey;
    }
  }

  private createRequestKey(endpoint: string, options: RequestInit): string {
    return `${options.method || "GET"}:${endpoint}:${JSON.stringify(
      options.body || {}
    )}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Create a unique key for this request to prevent duplicates
    const requestKey = this.createRequestKey(endpoint, options);

    // If same request is already pending and deduplication is enabled, return the existing promise
    if (
      apiSettings.enableRequestDeduplication &&
      this.pendingRequests.has(requestKey)
    ) {
      if (
        DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
        shouldShowDevControls() &&
        apiSettings.enableLogging &&
        apiSettings.isDevelopment
      ) {
        console.log(
          `⚡ API Request deduplicated: ${options.method || "GET"} ${endpoint}`
        );
      }
      return this.pendingRequests.get(requestKey) as Promise<ApiResponse<T>>;
    }

    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      // Với proxy, không cần CORS mode đặc biệt
      mode: "cors",
      credentials: "same-origin", // same-origin vì request đi qua proxy
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    const requestPromise = (async () => {
      try {
        if (
          DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
          shouldShowDevControls() &&
          apiSettings.enableLogging &&
          apiSettings.isDevelopment
        ) {
          console.log(`🚀 API Request: ${config.method || "GET"} ${url}`);
          console.log(`📋 Request Config:`, config);
        }

        // Dispatch global debug event for request and store last request
        try {
          const method = (config.method || "GET").toUpperCase();
          const headers = config.headers as Record<string, string> | undefined;
          const bodyText =
            typeof config.body === "string"
              ? config.body
              : config.body
              ? JSON.stringify(config.body)
              : undefined;
          const curlParts = [
            `curl -X ${method} '${url}'`,
            ...(headers
              ? Object.entries(headers).map(([k, v]) => `-H '${k}: ${String(v)}'`)
              : []),
            bodyText ? `-d '${bodyText.replace(/'/g, "'\\''")}'` : undefined,
          ].filter(Boolean) as string[];
          const curl = curlParts.join(" ");
          const debugReq = { url, method, headers, body: bodyText ? JSON.parse(bodyText) : undefined, curl };
          (window as unknown as Record<string, unknown>)["__FJ_DEBUG_LAST_REQUEST__"] = debugReq;
          window.dispatchEvent(
            new CustomEvent("FJ_DEBUG_API", { detail: { phase: "request", data: debugReq } })
          );
        } catch (e) {
          if (apiSettings.enableLogging && apiSettings.isDevelopment) {
            console.debug("(debug) apiClient could not emit request instrumentation", e);
          }
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

        // Dispatch global debug event for response and store last response
        try {
          const debugRes = { url: response.url, status: response.status, ok: response.ok, data };
          (window as unknown as Record<string, unknown>)["__FJ_DEBUG_LAST_RESPONSE__"] = debugRes;
          window.dispatchEvent(
            new CustomEvent("FJ_DEBUG_API", { detail: { phase: "response", data: debugRes } })
          );
        } catch (e) {
          if (apiSettings.enableLogging && apiSettings.isDevelopment) {
            console.debug("(debug) apiClient could not emit response instrumentation", e);
          }
        }

        if (!response.ok) {
          const error: ApiError = {
            message:
              data?.message ||
              data?.errorMessage ||
              `HTTP ${response.status}: ${response.statusText}`,
            code: response.status,
            details: data,
          };
          
          if (apiSettings.enableLogging && apiSettings.isDevelopment) {
            console.error(`❌ API Error Response:`, {
              status: response.status,
              statusText: response.statusText,
              data,
              url: response.url,
            });
          }
          
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
      } finally {
        // Remove request from pending map when done (only if deduplication is enabled)
        if (apiSettings.enableRequestDeduplication) {
          this.pendingRequests.delete(requestKey);
        }
      }
    })();

    // Store the promise to prevent duplicates (only if deduplication is enabled)
    if (apiSettings.enableRequestDeduplication) {
      this.pendingRequests.set(requestKey, requestPromise);
    }

    return requestPromise;
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
    if (apiSettings.enableLogging && apiSettings.isDevelopment) {
      console.log(`📤 POST Request Details:`, {
        endpoint,
        data,
        headers,
        baseUrl: this.baseUrl,
        fullUrl: `${this.baseUrl}${endpoint}`,
      });
    }

    // Chỉ set Content-Type khi có data để tránh CORS preflight
    const requestHeaders = { ...headers };
    if (data) {
      requestHeaders["Content-Type"] = "application/json";
    }

    return this.makeRequest<T>(endpoint, {
      method: "POST",
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: ApiHeaders
  ): Promise<ApiResponse<T>> {
    // Chỉ set Content-Type khi có data để tránh CORS preflight
    const requestHeaders = { ...headers };
    if (data) {
      requestHeaders["Content-Type"] = "application/json";
    }

    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      headers: requestHeaders,
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
