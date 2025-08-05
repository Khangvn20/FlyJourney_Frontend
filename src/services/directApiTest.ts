/**
 * Direct API Test Service
 * Test with exact format from Postman
 */

import { flightApiConfig } from "../shared/constants/apiConfig";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

export interface DirectApiTestRequest {
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_date: string; // dd/mm/yyyy format
  flight_class: "all" | "economy" | "premium_economy" | "business" | "first";
  passenger: {
    adults: number;
    children?: number;
    infants?: number;
  };
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export const testDirectApiCall = async (params: DirectApiTestRequest) => {
  const url = `${flightApiConfig.baseUrl}/flights/search`;

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🧪 Testing direct API call to:", url);
    console.log("📤 Request body:", JSON.stringify(params, null, 2));
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(
        `📈 Response status: ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error(`❌ HTTP Error:`, errorText);
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("✅ Raw API Response:", data);
    }

    return data;
  } catch (error) {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error("❌ Direct API test failed:", error);
    }
    throw error;
  }
};

export const createTestRequest = (
  from: string,
  to: string,
  date: string
): DirectApiTestRequest => {
  return {
    departure_airport_code: from,
    arrival_airport_code: to,
    departure_date: date,
    flight_class: "all",
    passenger: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    page: 1,
    limit: 50,
    sort_by: "price",
    sort_order: "asc",
  };
};
