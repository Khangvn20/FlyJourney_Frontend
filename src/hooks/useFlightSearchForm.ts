"use client";

import { useState } from "react";
import type { SearchFormData, PassengerCounts } from "../shared/types";

export const useFlightSearchForm = () => {
  const [formData, setFormData] = useState<SearchFormData>({
    tripType: "round-trip",
    from: "",
    to: "",
    departureDate: undefined,
    returnDate: undefined,
    multiCitySegments: [
      { from: "", to: "", departureDate: undefined },
      { from: "", to: "", departureDate: undefined },
    ],
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    flightClass: "economy",
    specialRequirements: "normal",
    searchFullMonth: false,
  });

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const updatePassengerCount = (
    type: keyof PassengerCounts,
    increment: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: increment
          ? prev.passengers[type] + 1
          : Math.max(type === "adults" ? 1 : 0, prev.passengers[type] - 1),
      },
    }));
  };

  const getPassengerText = () => {
    const { adults, children, infants } = formData.passengers;
    let text = `${adults} Người lớn`;
    if (children > 0) text += `, ${children} Trẻ em`;
    if (infants > 0) text += `, ${infants} Em bé`;
    return text;
  };

  const getClassText = () => {
    const classNames = {
      economy: "Phổ thông",
      premium: "Phổ thông đặc biệt",
      business: "Thương gia",
      first: "Hạng nhất",
    };
    return classNames[formData.flightClass as keyof typeof classNames];
  };

  const swapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  const handleSearch = () => {
    console.log("Searching flights with data:", formData);
    // TODO: Implement actual search logic here
  };

  return {
    formData,
    setFormData,
    showPassengerDropdown,
    setShowPassengerDropdown,
    showFromDropdown,
    setShowFromDropdown,
    showToDropdown,
    setShowToDropdown,
    updatePassengerCount,
    getPassengerText,
    getClassText,
    swapLocations,
    handleSearch,
  };
};
