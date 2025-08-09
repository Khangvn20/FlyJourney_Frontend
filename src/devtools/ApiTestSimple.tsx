import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { formatDateForApi } from "../services/flightApiService";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

interface FlightResult {
  flight_id: number;
  flight_number: string;
  airline_name: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  pricing?: {
    grand_total: number;
  };
  fare_class_details?: {
    cabin_class: string;
    baggage_kg: string;
  };
}

interface ApiResponse {
  status: boolean;
  errorCode?: string;
  data?: {
    departure_airport: string;
    arrival_airport: string;
    departure_date: string;
    total_count: number;
    passengers?: {
      adults: number;
    };
    search_results: FlightResult[];
  };
}

const ApiTestSimple: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testFlightAPI = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Test data giống như trong Postman
      const testData = {
        departure_airport_code: "SGN",
        arrival_airport_code: "HAN",
        departure_date: formatDateForApi(new Date()), // Hôm nay: 04/08/2025
        flight_class: "all",
        passenger: {
          adults: 1,
        },
        page: 1,
        limit: 50,
        sort_by: "price",
        sort_order: "asc",
      };

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🚀 Testing API with data:", testData);
      }

      const response = await fetch(
        "http://localhost:3000/api/v1/flights/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        }
      );

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("📡 Response status:", response.status);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("✅ API Response:", result);
      }
      setResponse(result);
    } catch (err) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("❌ API Error:", err);
      }
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔬 API Test - Flight Search (SGN → HAN)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testFlightAPI}
            disabled={isLoading}
            className="w-full">
            {isLoading ? "🔄 Testing API..." : "🚀 Test Flight Search API"}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error:</h3>
              <pre className="text-red-700 text-sm whitespace-pre-wrap">
                {error}
              </pre>
            </div>
          )}

          {response && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-green-800">✅ API Response:</h3>

              {/* Status */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Status:</strong>{" "}
                  {response.status ? "✅ Success" : "❌ Failed"}
                </div>
                <div>
                  <strong>Error Code:</strong> {response.errorCode || "N/A"}
                </div>
                <div>
                  <strong>Total Flights:</strong>{" "}
                  {response.data?.total_count || 0}
                </div>
              </div>

              {/* Search Info */}
              {response.data && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium mb-2">🔍 Search Parameters:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>From:</strong> {response.data.departure_airport}
                    </div>
                    <div>
                      <strong>To:</strong> {response.data.arrival_airport}
                    </div>
                    <div>
                      <strong>Date:</strong> {response.data.departure_date}
                    </div>
                    <div>
                      <strong>Passengers:</strong>{" "}
                      {response.data.passengers?.adults || 1} adults
                    </div>
                  </div>
                </div>
              )}

              {/* Flight Results */}
              {response.data?.search_results &&
                response.data.search_results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      ✈️ Found {response.data.search_results.length} flights:
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {response.data.search_results
                        .slice(0, 3)
                        .map((flight: FlightResult) => (
                          <div
                            key={flight.flight_id}
                            className="bg-white p-3 rounded border text-sm">
                            <div className="flex justify-between items-center">
                              <div>
                                <strong>{flight.flight_number}</strong> -{" "}
                                {flight.airline_name}
                              </div>
                              <div className="text-green-600 font-semibold">
                                {new Intl.NumberFormat("vi-VN").format(
                                  flight.pricing?.grand_total || 0
                                )}{" "}
                                VND
                              </div>
                            </div>
                            <div className="text-gray-600 mt-1">
                              {new Date(
                                flight.departure_time
                              ).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              →{" "}
                              {new Date(flight.arrival_time).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" }
                              )}{" "}
                              ({flight.duration_minutes}m)
                            </div>
                            <div className="text-gray-500 text-xs">
                              {flight.fare_class_details?.cabin_class} •{" "}
                              {flight.fare_class_details?.baggage_kg}
                            </div>
                          </div>
                        ))}
                      {response.data.search_results.length > 3 && (
                        <div className="text-center text-gray-500 text-sm">
                          ... and {response.data.search_results.length - 3} more
                          flights
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Raw Response (collapsible) */}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-blue-600">
                  📋 View Full JSON Response
                </summary>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-x-auto max-h-40">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestSimple;
