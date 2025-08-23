import { DEV_CONFIG, shouldShowDevControls } from "../config/devConfig";

// Test utility to debug API calls
export const testDirectAPI = async () => {
  const url = "http://localhost:3000/api/v1/auth/login";
  const data = {
    email: "devtest01@mailnesia.com",
    password: "abcd1234",
  };

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 Testing direct fetch to:", url);
    console.log("📋 Payload:", data);
    console.log("🌐 Current Origin:", window.location.origin);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "include",
    });

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("📡 Response Status:", response.status);
      console.log("📡 Response Headers:", [...response.headers.entries()]);
    }

    if (response.status === 204) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("⚠️ Got 204 No Content");
      }
      return { status: 204, data: null };
    }

    const responseData = await response.text();
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("📄 Raw Response:", responseData);
    }

    try {
      const jsonData = JSON.parse(responseData);
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("✅ Parsed JSON:", jsonData);
      }
      return { status: response.status, data: jsonData };
    } catch (e) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("❌ Failed to parse JSON:", e);
      }
      return { status: response.status, data: responseData };
    }
  } catch (error) {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error("❌ Network Error:", error);
    }
    throw error;
  }
};

// Test CORS preflight
export const testCORS = async () => {
  const url = "http://localhost:3000/api/v1/auth/login";

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 Testing CORS preflight to:", url);
    console.log("🌐 Current Origin:", window.location.origin);
  }

  try {
    const response = await fetch(url, {
      method: "OPTIONS",
      headers: {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
      mode: "cors",
      credentials: "include",
    });

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("📡 OPTIONS Response Status:", response.status);
      console.log("📡 CORS Headers:", {
        "Access-Control-Allow-Origin": response.headers.get(
          "Access-Control-Allow-Origin"
        ),
        "Access-Control-Allow-Methods": response.headers.get(
          "Access-Control-Allow-Methods"
        ),
        "Access-Control-Allow-Headers": response.headers.get(
          "Access-Control-Allow-Headers"
        ),
      });
    }

    return response.status;
  } catch (error) {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error("❌ CORS Error:", error);
    }
    throw error;
  }
};
