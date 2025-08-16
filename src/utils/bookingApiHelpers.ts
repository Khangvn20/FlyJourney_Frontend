import type { PassengerFormData } from "../shared/types/passenger.types";
import type { BookingSelection } from "../components/booking/BookingSummary";
import type {
  BookingCreateRequest,
  BookingPassengerDetailRequest,
  BookingAncillaryRequest,
} from "../shared/types/backend-api.types";

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
    console.warn("Invalid date format:", dateString);
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
  basePrice: number
): BookingPassengerDetailRequest {
  const age = calculateAge(passenger.dateOfBirth);

  return {
    passenger_age: age,
    passenger_gender: passenger.gender || "other",
    flight_class_id: flightClassId,
    price: basePrice,
    last_name: passenger.lastName.trim(),
    first_name: passenger.firstName.trim(),
    date_of_birth: formatDateForApi(passenger.dateOfBirth || ""),
    id_type: passenger.documentType || "id_card",
    id_number: (passenger.passportNumber || "").trim(),
    expiry_date: formatDateForApi(passenger.passportExpiry || ""),
    issuing_country: passenger.issuingCountry || "VN",
    nationality: passenger.nationality || "VN",
  };
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
      ancillaries.push({
        type: "baggage",
        description: `Hành lý ký gửi thêm cho hành khách ${index + 1} (${
          passenger.firstName
        } ${passenger.lastName})`,
        quantity: passenger.extraBaggage.extraKg,
        price: passenger.extraBaggage.price, // Use the already calculated price
      });
    }
  });

  // Handle global services
  globalAddons.services.forEach((serviceId) => {
    let description = "";
    let pricePerService = 0;

    switch (serviceId) {
      case "seat_selection":
        description = "Chọn chỗ ngồi";
        pricePerService = 150000;
        break;
      case "priority_boarding":
        description = "Lên máy bay ưu tiên";
        pricePerService = 100000;
        break;
      case "lounge_access":
        description = "Phòng chờ VIP";
        pricePerService = 300000;
        break;
      case "extra_legroom":
        description = "Ghế khoang rộng";
        pricePerService = 250000;
        break;
      case "wifi":
        description = "WiFi trên chuyến bay";
        pricePerService = 80000;
        break;
      case "meal_upgrade":
        description = "Nâng cấp suất ăn";
        pricePerService = 200000;
        break;
      default:
        description = serviceId;
        pricePerService = 50000;
    }

    ancillaries.push({
      type: "service",
      description,
      quantity: passengers.length, // Apply to all passengers
      price: pricePerService * passengers.length,
    });
  });

  return ancillaries;
}

/**
 * Create booking request payload from frontend data
 */
export function createBookingPayload(
  selection: BookingSelection,
  passengers: PassengerFormData[],
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

  // Calculate base price per passenger (excluding addons)
  const basePrice = Math.round(
    (selection.totalPrice - globalAddons.extraPrice) / passengers.length
  );

  // Convert passengers to API format
  const details = passengers.map((passenger) =>
    convertPassengerToApiFormat(passenger, flightClassId, basePrice)
  );

  // Convert addons to ancillaries
  const ancillaries = convertAddonsToAncillaries(passengers, globalAddons);

  return {
    flight_id: selection.outbound.flight_id,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    contact_address: contactAddress,
    note: note || undefined,
    total_price: selection.totalPrice + globalAddons.extraPrice,
    details,
    ancillaries: ancillaries.length > 0 ? ancillaries : undefined,
  };
}
