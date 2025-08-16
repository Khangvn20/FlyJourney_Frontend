import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChevronLeft, ChevronRight, Briefcase, Zap } from "lucide-react";
import type { PassengerFormData } from "../../shared/types/passenger.types";
import { shouldShowDevControls } from "../../shared/config/devConfig";
import { BAGGAGE_OPTIONS } from "./bookingAddons.constants";

interface PassengerInfoCollectorProps {
  passengers: PassengerFormData[];
  onPassengerChange: (index: number, passenger: PassengerFormData) => void;
  onBatchPassengerChange?: (updatedPassengers: PassengerFormData[]) => void;
  passengerCounts: {
    adults: number;
    children: number;
    infants: number;
  };
  contactAddress?: string;
  onContactAddressChange?: (address: string) => void;
}

// Quy định độ tuổi theo luật Việt Nam
const getPassengerTypeByAge = (age: number): "adult" | "child" | "infant" => {
  if (age < 2) return "infant"; // Trẻ sơ sinh: dưới 2 tuổi
  if (age < 14) return "child"; // Trẻ em: 2-13 tuổi
  return "adult"; // Người lớn: từ 14 tuổi trở lên
};

const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const PassengerInfoCollector: React.FC<PassengerInfoCollectorProps> = ({
  passengers,
  onPassengerChange,
  onBatchPassengerChange,
  passengerCounts,
  contactAddress,
  onContactAddressChange,
}) => {
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const totalPassengers =
    passengerCounts.adults + passengerCounts.children + passengerCounts.infants;

  // Auto-fill function for dev mode
  const handleAutoFill = () => {
    console.log("🔧 Auto-fill started with", passengers.length, "passengers");

    // Auto-fill contact address cho người đặt vé
    if (onContactAddressChange) {
      const sampleAddresses = [
        "123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP.Hồ Chí Minh",
        "456 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.Hồ Chí Minh",
        "789 Đường Hai Bà Trưng, Phường Tân Định, Quận 1, TP.Hồ Chí Minh",
        "101 Đường Pasteur, Phường Bến Nghé, Quận 1, TP.Hồ Chí Minh",
      ];
      const randomAddress =
        sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
      onContactAddressChange(randomAddress);
      console.log("🔧 Auto-filled contact address:", randomAddress);
    }

    const sampleData = [
      {
        firstName: "Anh",
        lastName: "Nguyen Van",
        gender: "male",
        nationality: "VN",
        documentType: "id_card",
        dateOfBirth: "1990-05-15",
        passportNumber: "001099001234",
        passportExpiry: "2030-05-15",
      },
      {
        firstName: "Hoa",
        lastName: "Tran Thi",
        gender: "female",
        nationality: "VN",
        documentType: "id_card",
        dateOfBirth: "1992-08-22",
        passportNumber: "001099005678",
        passportExpiry: "2030-08-22",
      },
      {
        firstName: "Minh",
        lastName: "Le Van",
        gender: "male",
        nationality: "VN",
        documentType: "id_card",
        dateOfBirth: "2015-03-10",
        passportNumber: "001099009012",
        passportExpiry: "2030-03-10",
      },
      {
        firstName: "Linh",
        lastName: "Pham Thi",
        gender: "female",
        nationality: "VN",
        documentType: "id_card",
        dateOfBirth: "2023-01-15",
        passportNumber: "001099003456",
        passportExpiry: "2030-01-15",
      },
    ];

    // Batch update approach - create new array with all updates
    const updatedPassengers = passengers.map((passenger, index) => {
      console.log(
        `🔧 Auto-filling passenger ${index}:`,
        passenger.firstName || "EMPTY"
      );

      const sample = sampleData[index % sampleData.length];
      const age = calculateAge(sample.dateOfBirth);
      const autoType = getPassengerTypeByAge(age);

      // Auto-assign different baggage for testing based on passenger index
      // Now includes index 0 (người đặt) as well
      const baggageOptions = [
        { option: "bg15", extraKg: 15, price: 260000 }, // Người đặt - frequent traveler
        { option: "bg10", extraKg: 10, price: 190000 }, // HK2 - light packer
        { option: "bg20", extraKg: 20, price: 330000 }, // HK3 - heavy packer
        { option: "none", extraKg: 0, price: 0 }, // HK4 - no extra
        { option: "bg10", extraKg: 10, price: 190000 }, // HK5+ - light packer
      ];

      const baggageChoice =
        baggageOptions[Math.min(index, baggageOptions.length - 1)];

      const updatedPassenger: PassengerFormData = {
        ...passenger,
        ...sample,
        type: autoType,
        gender: sample.gender as "male" | "female" | "other",
        documentType: sample.documentType as "passport" | "id_card",
        extraBaggage: baggageChoice,
      };

      console.log(`🔧 Updated passenger ${index}:`, updatedPassenger.firstName);
      return updatedPassenger;
    });

    // Apply all updates at once using batch update if available
    if (onBatchPassengerChange) {
      console.log(
        `🔧 Using batch update for all ${updatedPassengers.length} passengers`
      );
      onBatchPassengerChange(updatedPassengers);

      // Reset to show first passenger immediately after batch update
      setCurrentPassengerIndex(0);
    } else {
      // Fallback: Update in reverse order to avoid race conditions
      for (let i = updatedPassengers.length - 1; i >= 0; i--) {
        setTimeout(() => {
          onPassengerChange(i, updatedPassengers[i]);
        }, (updatedPassengers.length - 1 - i) * 20);
      }

      // Reset to show first passenger after all updates
      setTimeout(() => {
        setCurrentPassengerIndex(0);
      }, updatedPassengers.length * 20 + 50);
    }
  };

  const handleFieldChange = (
    index: number,
    field: keyof PassengerFormData,
    value: string
  ) => {
    const currentPassenger = passengers[index];
    const updatedPassenger = { ...currentPassenger, [field]: value };

    // Tự động cập nhật loại hành khách dựa trên ngày sinh
    if (field === "dateOfBirth" && value) {
      const age = calculateAge(value);
      const autoType = getPassengerTypeByAge(age);
      updatedPassenger.type = autoType;
    }

    onPassengerChange(index, updatedPassenger);
  };

  const handleBaggageChange = (index: number, optionId: string) => {
    const baggageOption = BAGGAGE_OPTIONS.find((opt) => opt.id === optionId);
    if (!baggageOption) return;

    const currentPassenger = passengers[index];
    const updatedPassenger = {
      ...currentPassenger,
      extraBaggage: {
        option: optionId,
        extraKg: baggageOption.extraKg,
        price: baggageOption.price,
      },
    };

    onPassengerChange(index, updatedPassenger);
  };

  const getPassengerTitle = (index: number, passenger: PassengerFormData) => {
    const passengerNumber = index + 1;

    if (index === 0) {
      return `Hành khách ${passengerNumber} (Người đặt vé)`;
    }

    let typeLabel = "";
    switch (passenger.type) {
      case "adult":
        typeLabel = "Người lớn";
        break;
      case "child":
        typeLabel = "Trẻ em";
        break;
      case "infant":
        typeLabel = "Trẻ sơ sinh";
        break;
      default:
        typeLabel = "Chưa xác định";
    }

    return `Hành khách ${passengerNumber} (${typeLabel})`;
  };

  const getAgeInfo = (passenger: PassengerFormData) => {
    if (!passenger.dateOfBirth) return "";

    const age = calculateAge(passenger.dateOfBirth);
    const autoType = getPassengerTypeByAge(age);

    let ageInfo = `${age} tuổi`;

    if (autoType !== passenger.type) {
      ageInfo += ` - Sẽ tự động phân loại thành ${
        autoType === "adult"
          ? "Người lớn"
          : autoType === "child"
          ? "Trẻ em"
          : "Trẻ sơ sinh"
      }`;
    }

    return ageInfo;
  };

  const goToPrevious = () => {
    setCurrentPassengerIndex(Math.max(0, currentPassengerIndex - 1));
  };

  const goToNext = () => {
    setCurrentPassengerIndex(
      Math.min(passengers.length - 1, currentPassengerIndex + 1)
    );
  };

  const currentPassenger = passengers[currentPassengerIndex];

  // Debug current passenger info
  React.useEffect(() => {
    console.log(
      `🔧 Current passenger index: ${currentPassengerIndex}, passenger:`,
      currentPassenger?.firstName || "EMPTY"
    );
  }, [currentPassengerIndex, currentPassenger]);

  // Single passenger layout
  if (totalPassengers === 1) {
    return (
      <div className="space-y-6">
        {/* Enhanced Header for single passenger */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm shadow-lg">
                  1
                </div>
                Thông tin hành khách
              </div>
              <div className="text-xs text-gray-600 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
                {passengerCounts.adults} người lớn • {passengerCounts.children}{" "}
                trẻ em • {passengerCounts.infants} trẻ sơ sinh
              </div>
            </div>
            {/* Dev Mode Auto Fill Button */}
            {shouldShowDevControls() && (
              <Button
                onClick={handleAutoFill}
                variant="outline"
                size="sm"
                className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                <Zap className="h-4 w-4 mr-2" />
                DEV: Auto Fill
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Single passenger form */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-white">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30" />

          <CardHeader className="pb-4 pt-6 relative z-10">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
                <div>
                  <span className="text-gray-900 font-semibold">
                    {getPassengerTitle(0, passengers[0])}
                  </span>
                  {passengers[0]?.dateOfBirth && (
                    <div className="text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-1 shadow-sm">
                      {getAgeInfo(passengers[0])}
                    </div>
                  )}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {passengers[0] && (
              <PassengerForm
                passenger={passengers[0]}
                index={0}
                onFieldChange={handleFieldChange}
                onBaggageChange={handleBaggageChange}
                contactAddress={contactAddress}
                onContactAddressChange={onContactAddressChange}
              />
            )}
          </CardContent>
        </Card>

        {/* Enhanced Regulation info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
              ℹ️
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-3">
                📋 Quy định độ tuổi tại Việt Nam
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <div>
                    <strong>Trẻ sơ sinh (dưới 2 tuổi):</strong> Có thể không cần
                    vé riêng, ngồi cùng người lớn
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <div>
                    <strong>Trẻ em (2-13 tuổi):</strong> Cần có người lớn đi
                    cùng và mang theo giấy khai sinh
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <div>
                    <strong>Người lớn (từ 14 tuổi):</strong> Có thể tự mình đặt
                    vé và làm thủ tục như người lớn
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple passengers horizontal slider layout
  return (
    <div className="space-y-6">
      {/* Enhanced Header with passenger counter */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm shadow-lg">
                {totalPassengers}
              </div>
              Thông tin hành khách
            </div>
            <div className="text-xs text-gray-600 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
              {passengerCounts.adults} người lớn • {passengerCounts.children}{" "}
              trẻ em • {passengerCounts.infants} trẻ sơ sinh
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              {currentPassengerIndex + 1}/{totalPassengers}
            </div>
            {/* Dev Mode Auto Fill Button */}
            {shouldShowDevControls() && (
              <Button
                onClick={handleAutoFill}
                variant="outline"
                size="sm"
                className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                <Zap className="h-4 w-4 mr-2" />
                DEV: Auto Fill
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Navigation dots */}
      <div className="flex justify-center space-x-3">
        {passengers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPassengerIndex(index)}
            className={`relative transition-all duration-300 ${
              index === currentPassengerIndex ? "scale-125" : "hover:scale-110"
            }`}>
            <div
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                index === currentPassengerIndex
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
            {index === currentPassengerIndex && (
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-blue-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Current passenger form */}
      {currentPassenger && (
        <div className="relative">
          <Card className="relative overflow-hidden border-0 shadow-xl bg-white">
            {/* Animated gradient top */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            {/* Background decoration */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30" />

            <CardHeader className="pb-4 pt-6 relative z-10">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {currentPassengerIndex + 1}
                  </div>
                  <div>
                    <span className="text-gray-900 font-semibold">
                      {getPassengerTitle(
                        currentPassengerIndex,
                        currentPassenger
                      )}
                    </span>
                    {currentPassenger.dateOfBirth && (
                      <div className="text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-1 shadow-sm">
                        {getAgeInfo(currentPassenger)}
                      </div>
                    )}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <PassengerForm
                key={`passenger-${currentPassengerIndex}-${
                  currentPassenger?.firstName || "empty"
                }`}
                passenger={currentPassenger}
                index={currentPassengerIndex}
                onFieldChange={handleFieldChange}
                onBaggageChange={handleBaggageChange}
                contactAddress={contactAddress}
                onContactAddressChange={onContactAddressChange}
              />
            </CardContent>

            {/* Enhanced Navigation arrows - improved styling */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-20">
              <button
                onClick={goToPrevious}
                disabled={currentPassengerIndex === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border ${
                  currentPassengerIndex === 0
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl hover:scale-110 border-blue-200 hover:border-blue-300"
                }`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-20">
              <button
                onClick={goToNext}
                disabled={currentPassengerIndex === passengers.length - 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border ${
                  currentPassengerIndex === passengers.length - 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl hover:scale-110 border-blue-200 hover:border-blue-300"
                }`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Quick jump buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {passengers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPassengerIndex(index)}
            className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
              index === currentPassengerIndex
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}>
            {index === 0 ? "Người đặt" : `HK ${index + 1}`}
          </button>
        ))}
      </div>

      {/* Enhanced Regulation info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
            ℹ️
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-3">
              📋 Quy định độ tuổi tại Việt Nam
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <div>
                  <strong>Trẻ sơ sinh (dưới 2 tuổi):</strong> Có thể không cần
                  vé riêng, ngồi cùng người lớn
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <div>
                  <strong>Trẻ em (2-13 tuổi):</strong> Cần có người lớn đi cùng
                  và mang theo giấy khai sinh
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <div>
                  <strong>Người lớn (từ 14 tuổi):</strong> Có thể tự mình đặt vé
                  và làm thủ tục như người lớn
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate PassengerForm component for reusability
const PassengerForm: React.FC<{
  passenger: PassengerFormData;
  index: number;
  onFieldChange: (
    index: number,
    field: keyof PassengerFormData,
    value: string
  ) => void;
  onBaggageChange: (index: number, optionId: string) => void;
  contactAddress?: string;
  onContactAddressChange?: (address: string) => void;
}> = ({
  passenger,
  index,
  onFieldChange,
  onBaggageChange,
  contactAddress,
  onContactAddressChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Name Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor={`lastName-${index}`}
            className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Họ và tên đệm
          </Label>
          <Input
            id={`lastName-${index}`}
            value={passenger.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(index, "lastName", e.target.value)
            }
            placeholder="Nguyễn Văn"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`firstName-${index}`}
            className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Tên
          </Label>
          <Input
            id={`firstName-${index}`}
            value={passenger.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(index, "firstName", e.target.value)
            }
            placeholder="An"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ngày sinh */}
        <div className="space-y-2">
          <Label
            htmlFor={`dob-${index}`}
            className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Ngày sinh
          </Label>
          <Input
            id={`dob-${index}`}
            type="date"
            value={passenger.dateOfBirth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(index, "dateOfBirth", e.target.value)
            }
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Giới tính */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Giới tính
          </Label>
          <Select
            value={passenger.gender || ""}
            onValueChange={(value: string) =>
              onFieldChange(index, "gender", value)
            }>
            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">👨 Nam</SelectItem>
              <SelectItem value="female">👩 Nữ</SelectItem>
              <SelectItem value="other">⚧ Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quốc tịch */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Quốc tịch
          </Label>
          <Select
            value={passenger.nationality || "VN"}
            onValueChange={(value: string) =>
              onFieldChange(index, "nationality", value)
            }>
            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">
              <SelectValue placeholder="Chọn quốc tịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VN">🇻🇳 Việt Nam</SelectItem>
              <SelectItem value="US">🇺🇸 Hoa Kỳ</SelectItem>
              <SelectItem value="GB">🇬🇧 Vương quốc Anh</SelectItem>
              <SelectItem value="JP">🇯🇵 Nhật Bản</SelectItem>
              <SelectItem value="KR">🇰🇷 Hàn Quốc</SelectItem>
              <SelectItem value="CN">🇨🇳 Trung Quốc</SelectItem>
              <SelectItem value="TH">🇹🇭 Thái Lan</SelectItem>
              <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Thông tin giấy tờ - moved up before baggage selection */}
      <div className="bg-indigo-50 rounded-lg p-4 space-y-4">
        <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-indigo-500 rounded"></span>
          Thông tin giấy tờ tùy thân
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Loại giấy tờ */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Loại giấy tờ
            </Label>
            <Select
              value={passenger.documentType || "id_card"}
              onValueChange={(value: string) =>
                onFieldChange(index, "documentType", value)
              }>
              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-white">
                <SelectValue placeholder="Chọn loại giấy tờ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_card">🆔 CCCD/CMND</SelectItem>
                <SelectItem value="passport">📔 Hộ chiếu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Số giấy tờ */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Số giấy tờ
            </Label>
            <Input
              value={passenger.passportNumber || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(index, "passportNumber", e.target.value)
              }
              placeholder={
                passenger.documentType === "passport"
                  ? "Số hộ chiếu"
                  : "Số CCCD/CMND"
              }
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-white"
            />
          </div>

          {/* Ngày hết hạn */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              {passenger.documentType === "passport" ? (
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              )}
              Ngày hết hạn
              {passenger.documentType !== "passport" && (
                <span className="text-xs text-gray-500">(tùy chọn)</span>
              )}
            </Label>
            <Input
              type="date"
              value={passenger.passportExpiry || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(index, "passportExpiry", e.target.value)
              }
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-white"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      {/* Contact Address Section - only for first passenger (người đặt vé) */}
      {index === 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 space-y-4">
          <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded"></span>
            Địa chỉ liên hệ (Người đặt vé)
          </h5>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Địa chỉ liên hệ
            </Label>
            <Input
              value={contactAddress || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onContactAddressChange?.(e.target.value)
              }
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              className="h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg bg-white"
            />
            <div className="text-xs text-gray-500">
              Địa chỉ này sẽ được sử dụng để gửi thông tin xác nhận booking và
              liên hệ khi cần thiết.
            </div>
          </div>
        </div>
      )}

      {/* Individual Baggage Selection - moved down after document info */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 space-y-4">
        <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          Chọn hành lý ký gửi (cá nhân)
        </h5>
        <div className="text-xs text-gray-600 mb-3">
          Mỗi hành khách có thể chọn hành lý ký gửi riêng biệt. Giá đã bao gồm
          7kg xách tay + 20kg ký gửi cơ bản.
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BAGGAGE_OPTIONS.map((option) => {
            const isSelected =
              passenger.extraBaggage?.option === option.id ||
              (!passenger.extraBaggage && option.id === "none");
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onBaggageChange(index, option.id)}
                className={`relative p-3 rounded-lg border text-left text-xs font-medium transition group ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/40"
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-gray-800">
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-gray-500">
                  {option.price === 0
                    ? "Đã bao gồm"
                    : `+${option.price.toLocaleString("vi-VN")} ₫`}
                </div>
                {option.extraKg > 0 && (
                  <div className="mt-1 text-[10px] text-blue-600 font-medium">
                    +{option.extraKg}kg
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected baggage info */}
        {passenger.extraBaggage && passenger.extraBaggage.extraKg > 0 && (
          <div className="bg-blue-100/50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs font-medium text-blue-800">
              Đã chọn: +{passenger.extraBaggage.extraKg}kg hành lý ký gửi
            </div>
            <div className="text-xs text-blue-600">
              Phụ thu: {passenger.extraBaggage.price.toLocaleString("vi-VN")} ₫
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Special notes */}
      {passenger.type === "child" && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
              👶
            </div>
            <div>
              <h6 className="text-sm font-bold text-yellow-800 mb-1">
                Lưu ý cho trẻ em
              </h6>
              <p className="text-sm text-yellow-700">
                Trẻ em dưới 14 tuổi cần mang theo{" "}
                <strong>giấy khai sinh bản gốc</strong> và phải có
                <strong> người lớn đi cùng</strong> trong suốt chuyến bay.
              </p>
            </div>
          </div>
        </div>
      )}

      {passenger.type === "infant" && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
              🍼
            </div>
            <div>
              <h6 className="text-sm font-bold text-blue-800 mb-1">
                Lưu ý cho trẻ sơ sinh
              </h6>
              <p className="text-sm text-blue-700">
                Trẻ sơ sinh dưới 2 tuổi sẽ <strong>ngồi cùng người lớn</strong>{" "}
                và có thể được
                <strong> miễn phí hoặc giảm giá vé</strong> máy bay.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerInfoCollector;
