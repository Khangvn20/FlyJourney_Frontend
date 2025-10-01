import type { PassengerFormData } from "../types/passenger.types";
import type { BookingSelection } from "../../components/booking/BookingSummary";
import type {
  BookingCreateRequest,
  BookingPassengerDetailRequest,
  BookingAncillaryRequest,
} from "../types/booking-api.types";
import {
  getServiceMapping,
  getBaggageApiDescription,
} from "../constants/serviceMapping";
import { DEV_CONFIG, shouldShowDevControls } from "../config/devConfig";

/**
 * Convert date from MM/DD/YYYY or YYYY-MM-DD to dd/MM/yyyy format for API
 */
export function formatDateForApi(dateString: string): string {
  if (!dateString) return "";

  let date: Date;

  // Handle MM/DD/YYYY format
  if (dateString.includes("/") && dateString.split("/")[0].length <= 2) {
    const [month, day, year] = dateString.split("/");
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  // Handle YYYY-MM-DD format
  else if (dateString.includes("-")) {
    date = new Date(dateString);
  }
  // Handle DD/MM/YYYY format (already correct)
  else if (dateString.includes("/") && dateString.split("/")[2].length === 4) {
    return dateString;
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.warn("Invalid date format:", dateString);
    }
    return "";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Calculate passenger age from date of birth
 */
export function calculateAge(dateOfBirth: string | undefined): number {
  if (!dateOfBirth) return 0;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Convert frontend passenger data to backend format
 */
export function convertPassengerToApiFormat(
  passenger: PassengerFormData,
  flightClassId: number,
  returnFlightClassId: number | undefined,
  price: number
): BookingPassengerDetailRequest {
  const age = calculateAge(passenger.dateOfBirth);

  const result: BookingPassengerDetailRequest = {
    passenger_age: age,
    passenger_gender: passenger.gender || "other",
    flight_class_id: flightClassId,
    price,
    last_name: passenger.lastName.trim(),
    first_name: passenger.firstName.trim(),
    date_of_birth: formatDateForApi(passenger.dateOfBirth || ""),
    id_type: passenger.documentType || "id_card",
    id_number: (passenger.passportNumber || "").trim(),
    expiry_date: formatDateForApi(passenger.passportExpiry || ""),
    issuing_country: passenger.issuingCountry || "VN",
    nationality: passenger.nationality || "VN",
  };

  // Add return flight class ID if it's a round-trip booking
  if (returnFlightClassId) {
    result.return_flight_class_id = returnFlightClassId;
  }

  return result;
}

/**
 * Convert addons to ancillaries format
 */
export function convertAddonsToAncillaries(
  passengers: PassengerFormData[],
  globalAddons: { extraBaggageKg: number; services: string[] }
): BookingAncillaryRequest[] {
  const ancillaries: BookingAncillaryRequest[] = [];

  // Handle individual baggage for each passenger
  passengers.forEach((passenger, index) => {
    if (passenger.extraBaggage && passenger.extraBaggage.extraKg > 0) {
      // Format name as: Last Name, First Name (international standard)
      const passengerName = `${passenger.lastName.trim()}, ${passenger.firstName.trim()}`;
      const baggageWeight = passenger.extraBaggage.extraKg;

      ancillaries.push({
        type: "baggage",
        description: getBaggageApiDescription(
          baggageWeight,
          index,
          passengerName
        ),
        quantity: baggageWeight,
        price: passenger.extraBaggage.price, // Use the already calculated price
      });
    }
  });

  // Handle global services
  globalAddons.services.forEach((serviceId) => {
    const serviceMapping = getServiceMapping(serviceId);

    if (serviceMapping) {
      ancillaries.push({
        type: "service",
        description: serviceMapping.apiDescription(passengers.length),
        quantity: passengers.length,
        price: serviceMapping.price * passengers.length,
      });
    } else {
      // Fallback for unknown service IDs
      ancillaries.push({
        type: "service",
        description: `[${serviceId}] Dịch vụ bổ sung - ${passengers.length} hành khách`,
        quantity: passengers.length,
        price: 50000 * passengers.length,
      });
    }
  });

  return ancillaries;
}

/**
 * Create booking request payload from frontend data
 */
export function createBookingPayload(
  selection: BookingSelection,
  passengers: PassengerFormData[],
  contactName: string,
  contactEmail: string,
  contactPhone: string,
  contactAddress: string,
  note: string,
  globalAddons: {
    extraBaggageKg: number;
    services: string[];
    extraPrice: number;
  }
): BookingCreateRequest {
  const flightClassId = selection.outbound.flight_class_id || 1;
  const returnFlightClassId = selection.inbound?.flight_class_id;
  const outboundPrices = selection.outbound.pricing?.total_prices || {};
  const inboundPrices = selection.inbound?.pricing?.total_prices || {};

  // Convert passengers to API format using per-type pricing from API
  const details = passengers.map((p) => {
    // Use individual passenger pricing from flight API
    const outboundPrice =
      outboundPrices[p.type as keyof typeof outboundPrices] || 0;
    const inboundPrice =
      inboundPrices[p.type as keyof typeof inboundPrices] || 0;
    const totalPassengerPrice = outboundPrice + inboundPrice;

    return convertPassengerToApiFormat(
      p,
      flightClassId,
      returnFlightClassId,
      totalPassengerPrice
    );
  });

  // Convert addons to ancillaries
  const ancillaries = convertAddonsToAncillaries(passengers, globalAddons);

  // Use the first passenger's phone as contact phone if not provided
  const finalContactPhone = contactPhone || passengers[0]?.phone || "";

  // IMPORTANT: Use selection.totalPrice (from flight search API) + addons
  // This ensures consistency with what user saw during booking flow
  const finalTotalPrice = selection.totalPrice + globalAddons.extraPrice;

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 BOOKING PAYLOAD PRICE CALCULATION:", {
      selectionTotalPrice: selection.totalPrice,
      globalAddonsExtraPrice: globalAddons.extraPrice,
      finalTotalPrice,
      selectionDetails: {
        outboundFlightId: selection.outbound.flight_id,
        outboundPricing: selection.outbound.pricing,
        inboundFlightId: selection.inbound?.flight_id,
        inboundPricing: selection.inbound?.pricing,
      },
      globalAddons: {
        extraBaggageKg: globalAddons.extraBaggageKg,
        services: globalAddons.services,
        extraPrice: globalAddons.extraPrice,
      },
      passengersCount: passengers.length,
    });
  }

  const payload: BookingCreateRequest = {
    flight_id: selection.outbound.flight_id,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: finalContactPhone,
    contact_address: contactAddress,
    note: note || undefined,
    total_price: finalTotalPrice,
    details,
    ancillaries: ancillaries.length > 0 ? ancillaries : undefined,
  };

  // Add return flight ID for round-trip bookings
  if (selection.inbound) {
    payload.return_flight_id = selection.inbound.flight_id;
  }

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 FINAL BOOKING PAYLOAD:", {
      payloadTotalPrice: payload.total_price,
      payloadFlightId: payload.flight_id,
      payloadReturnFlightId: payload.return_flight_id,
      payloadDetailsCount: payload.details.length,
      payloadAncillariesCount: payload.ancillaries?.length || 0,
      payloadAncillaries: payload.ancillaries?.map((a) => ({
        type: a.type,
        description: a.description,
        quantity: a.quantity,
        price: a.price,
      })),
    });
  }

  return payload;
}
