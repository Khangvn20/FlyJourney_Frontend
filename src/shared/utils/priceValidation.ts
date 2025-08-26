import { DEV_CONFIG, shouldShowDevControls } from "../config/devConfig";
import type { BookingSelection } from "../../components/booking/BookingSummary";
import type { PassengerFormData } from "../types/passenger.types";

export interface PriceAuditTrail {
  timestamp: string;
  step: string;
  selectionPrice: number;
  baggageTotal: number;
  servicesTotal: number;
  addonsTotal: number;
  calculatedTotal: number;
  currency: string;
  passengerCount: number;
  tripType: "one-way" | "round-trip";
  details?: Record<string, unknown>;
}

export interface PriceValidationResult {
  isValid: boolean;
  calculatedTotal: number;
  auditTrail: PriceAuditTrail;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive price validation utility
 */
export class PriceValidator {
  private static readonly PRICE_TOLERANCE = 1; // 1 VND tolerance for rounding

  /**
   * Validate price calculation consistency
   */
  static validatePriceCalculation(
    selection: BookingSelection,
    passengers: PassengerFormData[],
    baggageTotal: number,
    servicesTotal: number,
    expectedTotal: number,
    step: string = "validation"
  ): PriceValidationResult {
    const timestamp = new Date().toISOString();
    const addonsTotal = baggageTotal + servicesTotal;
    const calculatedTotal = selection.totalPrice + addonsTotal;
    
    const auditTrail: PriceAuditTrail = {
      timestamp,
      step,
      selectionPrice: selection.totalPrice,
      baggageTotal,
      servicesTotal,
      addonsTotal,
      calculatedTotal,
      currency: selection.currency,
      passengerCount: passengers.length,
      tripType: selection.inbound ? "round-trip" : "one-way",
      details: {
        outboundPricing: selection.outbound.pricing,
        inboundPricing: selection.inbound?.pricing,
        individualBaggage: passengers.map(p => ({
          passenger: `${p.firstName} ${p.lastName}`,
          baggage: p.extraBaggage
        }))
      }
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for negative prices
    if (selection.totalPrice < 0) {
      errors.push("Selection price cannot be negative");
    }
    if (baggageTotal < 0) {
      errors.push("Baggage total cannot be negative");
    }
    if (servicesTotal < 0) {
      errors.push("Services total cannot be negative");
    }

    // Check for price consistency
    const priceDifference = Math.abs(calculatedTotal - expectedTotal);
    if (priceDifference > this.PRICE_TOLERANCE) {
      errors.push(
        `Price calculation mismatch: calculated=${calculatedTotal}, expected=${expectedTotal}, difference=${priceDifference}`
      );
    }

    // Check for unreasonable prices
    if (calculatedTotal > 50000000) { // 50M VND seems unreasonable for a flight
      warnings.push(`Total price seems unusually high: ${calculatedTotal} ${selection.currency}`);
    }
    if (calculatedTotal < 100000) { // 100K VND seems too low
      warnings.push(`Total price seems unusually low: ${calculatedTotal} ${selection.currency}`);
    }

    // Validate passenger pricing consistency
    if (selection.outbound.pricing?.total_prices) {
      const outboundPrices = selection.outbound.pricing.total_prices;
      let expectedOutboundTotal = 0;
      
      passengers.forEach(p => {
        const passengerPrice = outboundPrices[p.type as keyof typeof outboundPrices] || 0;
        expectedOutboundTotal += passengerPrice;
      });

      if (selection.inbound?.pricing?.total_prices) {
        const inboundPrices = selection.inbound.pricing.total_prices;
        passengers.forEach(p => {
          const passengerPrice = inboundPrices[p.type as keyof typeof inboundPrices] || 0;
          expectedOutboundTotal += passengerPrice;
        });
      }

      const pricingDifference = Math.abs(selection.totalPrice - expectedOutboundTotal);
      if (pricingDifference > this.PRICE_TOLERANCE) {
        warnings.push(
          `Selection price doesn't match passenger pricing breakdown: selection=${selection.totalPrice}, calculated=${expectedOutboundTotal}`
        );
      }
    }

    const isValid = errors.length === 0;

    // Log audit trail if enabled
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(`🔍 PRICE VALIDATION - ${step.toUpperCase()}:`, auditTrail);
      if (errors.length > 0) {
        console.error("❌ Price validation errors:", errors);
      }
      if (warnings.length > 0) {
        console.warn("⚠️ Price validation warnings:", warnings);
      }
      if (isValid) {
        console.log("✅ Price validation passed");
      }
    }

    return {
      isValid,
      calculatedTotal,
      auditTrail,
      errors,
      warnings
    };
  }

  /**
   * Compare two prices with tolerance
   */
  static comparePrices(price1: number, price2: number, tolerance: number = this.PRICE_TOLERANCE): {
    isEqual: boolean;
    difference: number;
    percentageDiff: number;
  } {
    const difference = Math.abs(price1 - price2);
    const percentageDiff = price1 > 0 ? (difference / price1) * 100 : 0;
    
    return {
      isEqual: difference <= tolerance,
      difference,
      percentageDiff
    };
  }

  /**
   * Create a comprehensive price audit log
   */
  static createPriceAuditLog(
    step: string,
    prices: Record<string, number>,
    metadata?: Record<string, unknown>
  ): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      step,
      prices,
      metadata: metadata || {}
    };

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(`💰 PRICE AUDIT LOG - ${step.toUpperCase()}:`, auditLog);
    }

    // In a real application, you might want to send this to a logging service
    // or store it in a database for analysis
  }

  /**
   * Validate API response price against frontend calculation
   */
  static validateApiResponsePrice(
    frontendPrice: number,
    apiPrice: number,
    bookingId: string,
    currency: string = "VND"
  ): {
    isValid: boolean;
    shouldInvestigate: boolean;
    auditLog: Record<string, unknown>;
  } {
    const comparison = this.comparePrices(frontendPrice, apiPrice);
    const shouldInvestigate = comparison.difference > 1000 || comparison.percentageDiff > 5; // Investigate if >1000 VND or >5% difference

    const auditLog = {
      timestamp: new Date().toISOString(),
      step: "api_response_price_validation",
      bookingId,
      frontendPrice,
      apiPrice,
      currency,
      difference: comparison.difference,
      percentageDiff: comparison.percentageDiff,
      isValid: comparison.isEqual,
      shouldInvestigate
    };

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      if (shouldInvestigate) {
        console.error("🚨 PRICE DISCREPANCY REQUIRES INVESTIGATION:", auditLog);
      } else if (!comparison.isEqual) {
        console.warn("⚠️ Minor price difference detected:", auditLog);
      } else {
        console.log("✅ API price validation passed:", auditLog);
      }
    }

    return {
      isValid: comparison.isEqual,
      shouldInvestigate,
      auditLog
    };
  }
}

export default PriceValidator;