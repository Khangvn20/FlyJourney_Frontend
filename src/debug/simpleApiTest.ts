import { API_BASE_URL, buildApiUrl } from "../shared/constants/apiConfig";

/**
 * Simple API test utility for debugging booking API issues
 */

export const testBookingAPI = async (userId: string, token?: string) => {
  console.log("🔍 Testing Booking API...");
  console.log("User ID:", userId);
  console.log("Token:", token ? "Present" : "Missing");

  // Test 1: Direct backend call
  const backendUrl = buildApiUrl(`/booking/user/${userId}`);
  console.log("\n🚀 Testing direct backend call:", backendUrl);

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log("✅ Backend Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const data = await response.text();
    console.log("📄 Response Data:", data);

    if (data) {
      try {
        const json = JSON.parse(data);
        console.log("📋 Parsed JSON:", json);
        console.log("📊 Data Type:", typeof json);
        console.log("📊 Is Array:", Array.isArray(json));

        if (Array.isArray(json)) {
          console.log("📊 Array Length:", json.length);
        } else if (typeof json === "object" && json !== null) {
          console.log("📊 Object Keys:", Object.keys(json));
        }
      } catch {
        console.log("⚠️ Not valid JSON");
      }
    }
  } catch (error) {
    console.error("❌ Backend test failed:", error);
  }

  // Test 2: Proxy call
  const proxyUrl = buildApiUrl(`/booking/user/${userId}`);
  console.log("\n🔄 Testing proxy call:", proxyUrl);

  try {
    const response = await fetch(proxyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log("✅ Proxy Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const data = await response.text();
    console.log("📄 Proxy Data:", data);
  } catch (error) {
    console.error("❌ Proxy test failed:", error);
  }
};

export const testBackendHealth = async () => {
  console.log("🏥 Testing backend health...");

  const apiOrigin = API_BASE_URL.replace(/\/api\/?[\w-]*$/, "");
  const endpoints = [apiOrigin, `${apiOrigin}/api`, API_BASE_URL];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      console.error(`❌ ${endpoint} - Error:`, error);
    }
  }
};
