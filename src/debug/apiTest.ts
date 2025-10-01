import { apiClient } from "../shared/utils/apiClient";
import { DEV_CONFIG } from "../shared/config/devConfig";
import { API_BASE_URL, buildApiUrl } from "../shared/constants/apiConfig";

/**
 * Debug utility để test API calls trực tiếp
 */
export const debugBookingAPI = async (userId: string, token?: string) => {
  console.log("🔍 === BOOKING API DEBUG ===");
  console.log("📋 User ID:", userId);
  console.log("🔑 Token:", token ? `${token.substring(0, 20)}...` : "No token");
  console.log("🌐 API Base URL:", apiClient.endpoints);

  // Test 1: Check API client configuration
  console.log("\n📡 API Client Configuration:");
  console.log(
    "- Base URL:",
    (apiClient as unknown as { baseUrl: string }).baseUrl
  );
  console.log(
    "- Timeout:",
    (apiClient as unknown as { timeout: number }).timeout
  );
  console.log(
    "- Default Headers:",
    (apiClient as unknown as { defaultHeaders: Record<string, string> })
      .defaultHeaders
  );

  // Test 2: Build full endpoint URL
  const endpoint = `${apiClient.endpoints.user.bookings}/${userId}`;
  const fullUrl = buildApiUrl(endpoint);
  console.log("\n🔗 Endpoint Details:");
  console.log("- Endpoint:", endpoint);
  console.log("- Full URL:", fullUrl);

  // Test 3: Test direct fetch to check if backend is running
  console.log("\n🚀 Testing direct fetch to backend...");
  try {
    const directResponse = await fetch(buildApiUrl(`/booking/user/${userId}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log("✅ Direct fetch response:", {
      status: directResponse.status,
      statusText: directResponse.statusText,
      headers: Object.fromEntries(directResponse.headers.entries()),
    });

    const directData = await directResponse.text();
    console.log("📄 Direct response data:", directData);

    try {
      const jsonData = JSON.parse(directData);
      console.log("📋 Parsed JSON:", jsonData);
    } catch {
      console.log("⚠️ Response is not JSON");
    }
  } catch (error) {
    console.error("❌ Direct fetch failed:", error);
  }

  // Test 4: Test through proxy (via apiClient)
  console.log("\n🔄 Testing through Vite proxy...");
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const proxyResponse = await apiClient.get(endpoint, headers);

    console.log("✅ Proxy response:", proxyResponse);
  } catch (error) {
    console.error("❌ Proxy request failed:", error);
  }

  console.log("\n🔍 === DEBUG COMPLETE ===");
};

/**
 * Test backend connectivity
 */
export const testBackendConnectivity = async () => {
  console.log("🔍 === BACKEND CONNECTIVITY TEST ===");

  const apiOrigin = API_BASE_URL.replace(/\/api\/?[\w-]*$/, "");
  const testUrls = [
    apiOrigin,
    `${apiOrigin}/api`,
    API_BASE_URL,
    `${API_BASE_URL}/booking`,
  ];

  for (const url of testUrls) {
    try {
      console.log(`\n🚀 Testing: ${url}`);
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
      });

      console.log(`✅ ${url} - Status: ${response.status}`);

      if (response.status === 200) {
        const text = await response.text();
        console.log(`📄 Response preview: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error(`❌ ${url} - Error:`, error);
    }
  }

  console.log("\n🔍 === CONNECTIVITY TEST COMPLETE ===");
};

// Export for use in browser console
if (DEV_CONFIG.ENABLE_CONSOLE_LOGS) {
  (
    window as unknown as {
      debugBookingAPI: typeof debugBookingAPI;
      testBackendConnectivity: typeof testBackendConnectivity;
    }
  ).debugBookingAPI = debugBookingAPI;
  (
    window as unknown as {
      debugBookingAPI: typeof debugBookingAPI;
      testBackendConnectivity: typeof testBackendConnectivity;
    }
  ).testBackendConnectivity = testBackendConnectivity;
}
