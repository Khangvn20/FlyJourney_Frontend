/**
 * Debug utility for tracking price calculation issues between frontend and backend
 */

import { DEV_CONFIG, shouldShowDevControls } from "../config/devConfig";

export interface PriceDebugInfo {
  timestamp: string;
  bookingId?: string;
  step: string;
  frontend: {
    selectionPrice: number;
    baggageTotal: number;
    servicesTotal: number;
    addonsTotal: number;
    totalPriceWithAddons: number;
  };
  backend?: {
    totalPrice: number;
    status?: string;
  };
  payload?: {
    totalPrice: number;
  };
  comparison?: {
    difference: number;
    percentageDifference: string;
    issue: "backend_higher" | "backend_lower" | "match";
  };
}

export class PriceDebugger {
  private static debugLogs: PriceDebugInfo[] = [];

  static logPriceIssue(info: PriceDebugInfo) {
    this.debugLogs.push(info);

    // Only log to console if dev logging is enabled
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      // Console logging with clear indicators
      console.group(`💰 PRICE DEBUG - ${info.step.toUpperCase()}`);
      console.log("📅 Timestamp:", info.timestamp);
      if (info.bookingId) console.log("🎫 Booking ID:", info.bookingId);

      console.log("🔢 Frontend Calculations:");
      console.log(
        "  - Selection Price:",
        info.frontend.selectionPrice.toLocaleString(),
        "VND"
      );
      console.log(
        "  - Baggage Total:",
        info.frontend.baggageTotal.toLocaleString(),
        "VND"
      );
      console.log(
        "  - Services Total:",
        info.frontend.servicesTotal.toLocaleString(),
        "VND"
      );
      console.log(
        "  - Addons Total:",
        info.frontend.addonsTotal.toLocaleString(),
        "VND"
      );
      console.log(
        "  - Total Price:",
        info.frontend.totalPriceWithAddons.toLocaleString(),
        "VND"
      );

      if (info.payload) {
        console.log(
          "📤 Payload Sent:",
          info.payload.totalPrice.toLocaleString(),
          "VND"
        );
      }

      if (info.backend) {
        console.log(
          "📥 Backend Returned:",
          info.backend.totalPrice.toLocaleString(),
          "VND"
        );
        console.log("📊 Backend Status:", info.backend.status);
      }

      if (info.comparison) {
        console.log("⚖️ Comparison:");
        console.log(
          "  - Difference:",
          info.comparison.difference.toLocaleString(),
          "VND"
        );
        console.log("  - Percentage:", info.comparison.percentageDifference);

        if (info.comparison.issue === "backend_higher") {
          console.error("🚨 ISSUE: Backend price is HIGHER than frontend!");
        } else if (info.comparison.issue === "backend_lower") {
          console.warn("⚠️ ISSUE: Backend price is LOWER than frontend!");
        } else {
          console.log("✅ PRICE MATCH: Frontend and backend prices match!");
        }
      }

      console.groupEnd();
    }

    // Keep only last 10 logs to prevent memory issues
    if (this.debugLogs.length > 10) {
      this.debugLogs = this.debugLogs.slice(-10);
    }
  }

  static getDebugLogs(): PriceDebugInfo[] {
    return [...this.debugLogs];
  }

  static clearLogs() {
    this.debugLogs = [];
  }

  static exportLogs(): string {
    return JSON.stringify(this.debugLogs, null, 2);
  }
}
