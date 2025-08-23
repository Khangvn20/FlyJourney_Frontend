import React from "react";
import type { BookingSelection } from "../BookingSummary";
import { formatDateTime } from "../../../services/flightApiService";

interface FlightSelectionStepProps {
  selection: BookingSelection;
  onBack: () => void;
  onNext: () => void;
}

export const FlightSelectionStep: React.FC<FlightSelectionStepProps> = ({
  selection,
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      {/* Flight Details Display */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chi tiết chuyến bay đã chọn
        </h3>

        <div className="space-y-4">
          {/* Outbound Flight */}
          <div className="border-l-4 border-indigo-500 pl-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {selection.outbound.departure_airport_code} →{" "}
                  {selection.outbound.arrival_airport_code}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(selection.outbound.departure_time).date}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatDateTime(selection.outbound.departure_time).time} -
                  {formatDateTime(selection.outbound.arrival_time).time}
                </p>
                <p className="text-sm text-gray-600">
                  {selection.outbound.airline_name}
                </p>
              </div>
            </div>
          </div>

          {/* Return Flight (if exists) */}
          {selection.tripType === "round-trip" && selection.inbound && (
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {selection.inbound.departure_airport_code} →{" "}
                    {selection.inbound.arrival_airport_code}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(selection.inbound.departure_time).date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatDateTime(selection.inbound.departure_time).time} -
                    {formatDateTime(selection.inbound.arrival_time).time}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selection.inbound.airline_name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tổng giá vé</span>
              <span className="text-xl font-bold text-indigo-600">
                {selection.totalPrice.toLocaleString("vi-VN")}{" "}
                {selection.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          ← Quay lại
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-lg">
          Tiếp tục →
        </button>
      </div>
    </div>
  );
};
