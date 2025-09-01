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
import { ChevronLeft, ChevronRight, Zap, User, Calendar, IdCard, PackagePlus } from "lucide-react";
import type { PassengerFormData } from "../../shared/types/passenger.types";
import { shouldShowDevControls } from "../../shared/config/devConfig";
import { BAGGAGE_OPTIONS } from "./bookingAddons.constants";

interface PassengerInformationFormProps {
  passengers: PassengerFormData[];
  onPassengerChange: (index: number, passenger: PassengerFormData) => void;
  onBatchPassengerChange?: (updatedPassengers: PassengerFormData[]) => void;
  passengerCounts: {
    adults: number;
    children: number;
    infants: number;
  };
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

const PassengerInformationForm: React.FC<PassengerInformationFormProps> = ({
  passengers,
  onPassengerChange,
  onBatchPassengerChange,
  passengerCounts,
}) => {
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const totalPassengers =
    passengerCounts.adults + passengerCounts.children + passengerCounts.infants;

  // Auto-fill function for dev mode
  const handleAutoFill = () => {
    console.log("🔧 Auto-fill started with", passengers.length, "passengers");

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
        phone: "0912345678",
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
        phone: "0987654321",
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
        phone: "0901234567",
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
        phone: "0876543210",
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
      const baggageOptions = [
        { option: "bg15", extraKg: 15, price: 260000 }, // HK1 - frequent traveler
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

  // Single passenger layout
  if (totalPassengers === 1) {
    return (
      <div className="space-y-6">
        {/* Enhanced Header for single passenger */}
        <div className="relative overflow-hidden border border-blue-100 rounded-lg p-4 bg-white">
          <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.10),transparent_60%)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thông tin hành khách</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {passengerCounts.adults} người lớn • {passengerCounts.children} trẻ em • {passengerCounts.infants} trẻ sơ sinh
                </p>
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

        {/* Single passenger form */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 font-semibold">
              {getPassengerTitle(0, passengers[0])}
              {passengers[0]?.dateOfBirth && (
                <span className="ml-3 text-sm font-normal text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {getAgeInfo(passengers[0])}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passengers[0] && (
              <PassengerForm
                passenger={passengers[0]}
                index={0}
                onFieldChange={handleFieldChange}
                onBaggageChange={handleBaggageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Multiple passengers horizontal slider layout
  return (
    <div className="space-y-6">
      {/* Header with passenger counter */}
      <div className="relative overflow-hidden border border-blue-100 rounded-lg p-4 bg-white">
        <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.10),transparent_60%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow">
              <User className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin hành khách</h3>
              <p className="text-sm text-gray-600 mt-1">
                {passengerCounts.adults} người lớn • {passengerCounts.children} trẻ em • {passengerCounts.infants} trẻ sơ sinh
              </p>
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

      {/* Navigation dots */}
      <div className="flex justify-center space-x-2">
        {passengers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPassengerIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentPassengerIndex
                ? "bg-blue-600"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Current passenger form */}
      {currentPassenger && (
        <div className="relative">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900 font-semibold">
                {getPassengerTitle(currentPassengerIndex, currentPassenger)}
                {currentPassenger.dateOfBirth && (
                  <span className="ml-3 text-sm font-normal text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                    {getAgeInfo(currentPassenger)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <PassengerForm
                key={`passenger-${currentPassengerIndex}-${
                  currentPassenger?.firstName || "empty"
                }`}
                passenger={currentPassenger}
                index={currentPassengerIndex}
                onFieldChange={handleFieldChange}
                onBaggageChange={handleBaggageChange}
              />
            </CardContent>

            {/* Navigation arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-20">
              <button
                onClick={goToPrevious}
                disabled={currentPassengerIndex === 0}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                  currentPassengerIndex === 0
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                }`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-20">
              <button
                onClick={goToNext}
                disabled={currentPassengerIndex === passengers.length - 1}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                  currentPassengerIndex === passengers.length - 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                }`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Quick jump buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {passengers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPassengerIndex(index)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
              index === currentPassengerIndex
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            HK {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

// Separate PassengerForm component for reusability (without contact info)
const PassengerForm: React.FC<{
  passenger: PassengerFormData;
  index: number;
  onFieldChange: (
    index: number,
    field: keyof PassengerFormData,
    value: string
  ) => void;
  onBaggageChange: (index: number, optionId: string) => void;
}> = ({
  passenger,
  index,
  onFieldChange,
  onBaggageChange,
}) => {
  const [touched, setTouched] = React.useState({
    lastName: false,
    firstName: false,
    dateOfBirth: false,
    gender: false,
    passportNumber: false,
    passportExpiry: false,
  });

  const inputErrorClass = (t: boolean, err: string) =>
    t && err ? "border-red-500 focus-visible:ring-red-500 focus-visible:ring-2" : "";

  const today = new Date().toISOString().split("T")[0];
  const isFuture = (iso: string) => iso && iso > today;

  const errors = {
    lastName: passenger.lastName?.trim() ? "" : "Vui lòng nhập họ và tên đệm",
    firstName: passenger.firstName?.trim() ? "" : "Vui lòng nhập tên",
    dateOfBirth: passenger.dateOfBirth
      ? isFuture(passenger.dateOfBirth)
        ? "Ngày sinh không hợp lệ"
        : ""
      : "Vui lòng nhập ngày sinh",
    gender: passenger.gender ? "" : "Vui lòng chọn giới tính",
    passportNumber: passenger.passportNumber?.trim() ? "" : "Vui lòng nhập số giấy tờ",
    passportExpiry:
      passenger.documentType === "passport"
        ? passenger.passportExpiry
          ? ""
          : "Vui lòng nhập ngày hết hạn hộ chiếu"
        : "",
  } as const;
  return (
    <div className="space-y-6">
      {/* Section: Personal info header */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
        <User className="w-4 h-4" />
        <span className="text-sm font-semibold">Thông tin cá nhân</span>
      </div>
      {/* Name Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor={`lastName-${index}`} className="text-sm font-medium text-gray-700">
            Họ và tên đệm *
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <User className="h-4 w-4" />
            </div>
            <Input
              id={`lastName-${index}`}
              value={passenger.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(index, "lastName", e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
              placeholder="Nguyễn Văn"
              aria-invalid={touched.lastName && !!errors.lastName}
              aria-describedby={`lastName-error-${index}`}
              className={`h-11 pl-9 bg-gray-50 focus:bg-white transition-colors ${inputErrorClass(touched.lastName, errors.lastName)}`}
            />
          </div>
          {touched.lastName && errors.lastName && (
            <p id={`lastName-error-${index}`} className="text-xs text-red-600 mt-1">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`firstName-${index}`} className="text-sm font-medium text-gray-700">
            Tên *
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <User className="h-4 w-4" />
            </div>
            <Input
              id={`firstName-${index}`}
              value={passenger.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(index, "firstName", e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
              placeholder="An"
              aria-invalid={touched.firstName && !!errors.firstName}
              aria-describedby={`firstName-error-${index}`}
              className={`h-11 pl-9 bg-gray-50 focus:bg-white transition-colors ${inputErrorClass(touched.firstName, errors.firstName)}`}
            />
          </div>
          {touched.firstName && errors.firstName && (
            <p id={`firstName-error-${index}`} className="text-xs text-red-600 mt-1">{errors.firstName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ngày sinh */}
        <div className="space-y-2">
          <Label htmlFor={`dob-${index}`} className="text-sm font-medium text-gray-700">
            Ngày sinh *
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              id={`dob-${index}`}
              type="date"
              value={passenger.dateOfBirth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(index, "dateOfBirth", e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, dateOfBirth: true }))}
              className={`h-11 pl-9 bg-gray-50 focus:bg-white transition-colors ${inputErrorClass(touched.dateOfBirth, errors.dateOfBirth)}`}
              aria-invalid={touched.dateOfBirth && !!errors.dateOfBirth}
              aria-describedby={`dob-error-${index}`}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          {touched.dateOfBirth && errors.dateOfBirth && (
            <p id={`dob-error-${index}`} className="text-xs text-red-600 mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Giới tính */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Giới tính *
          </Label>
          <Select
            value={passenger.gender || ""}
            onValueChange={(value: string) =>
              onFieldChange(index, "gender", value)
            }>
            <SelectTrigger className={`h-11 bg-gray-50 focus:bg-white transition-colors ${inputErrorClass(touched.gender, errors.gender)}`} onBlur={() => setTouched((t) => ({ ...t, gender: true }))}>
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Nam</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quốc tịch */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Quốc tịch *
          </Label>
          <Select
            value={passenger.nationality || "VN"}
            onValueChange={(value: string) =>
              onFieldChange(index, "nationality", value)
            }>
            <SelectTrigger className="h-11 bg-gray-50 focus:bg-white transition-colors">
              <SelectValue placeholder="Chọn quốc tịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VN">Việt Nam</SelectItem>
              <SelectItem value="US">Hoa Kỳ</SelectItem>
              <SelectItem value="GB">Vương quốc Anh</SelectItem>
              <SelectItem value="JP">Nhật Bản</SelectItem>
              <SelectItem value="KR">Hàn Quốc</SelectItem>
              <SelectItem value="CN">Trung Quốc</SelectItem>
              <SelectItem value="TH">Thái Lan</SelectItem>
              <SelectItem value="SG">Singapore</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Phone Number Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Số điện thoại
        </Label>
        <Input
          value={passenger.phone || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFieldChange(index, "phone", e.target.value)
          }
          placeholder="0912345678"
          className="h-11 bg-gray-50 focus:bg-white transition-colors"
          type="tel"
        />
        <p className="text-xs text-gray-500">
          Số điện thoại để liên hệ khẩn cấp với hành khách này
        </p>
      </div>

      {/* Thông tin giấy tờ */}
      <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
          <IdCard className="w-4 h-4" />
          <span className="text-sm font-semibold">Thông tin giấy tờ tùy thân</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Loại giấy tờ */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Loại giấy tờ *
            </Label>
            <Select
              value={passenger.documentType || "id_card"}
              onValueChange={(value: string) =>
                onFieldChange(index, "documentType", value)
              }>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Chọn loại giấy tờ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_card">CCCD/CMND</SelectItem>
                <SelectItem value="passport">Hộ chiếu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Số giấy tờ */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Số giấy tờ *
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <IdCard className="h-4 w-4" />
              </div>
              <Input
                value={passenger.passportNumber || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFieldChange(index, "passportNumber", e.target.value)
                }
                onBlur={() => setTouched((t) => ({ ...t, passportNumber: true }))}
                placeholder={
                  passenger.documentType === "passport"
                    ? "Số hộ chiếu"
                    : "Số CCCD/CMND"
                }
                aria-invalid={touched.passportNumber && !!errors.passportNumber}
                aria-describedby={`docnum-error-${index}`}
                className={`h-11 pl-9 bg-gray-50 focus:bg-white transition-colors ${inputErrorClass(touched.passportNumber, errors.passportNumber)}`}
              />
            </div>
            {touched.passportNumber && errors.passportNumber && (
              <p id={`docnum-error-${index}`} className="text-xs text-red-600 mt-1">{errors.passportNumber}</p>
            )}
          </div>

          {/* Ngày hết hạn */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Ngày hết hạn {passenger.documentType === "passport" ? "*" : "(tùy chọn)"}
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Calendar className="h-4 w-4" />
              </div>
            <Input
              type="date"
              value={passenger.passportExpiry || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(index, "passportExpiry", e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, passportExpiry: true }))}
              aria-invalid={touched.passportExpiry && !!errors.passportExpiry}
              aria-describedby={`docexp-error-${index}`}
              className={`h-11 pl-9 bg-gray-50 focus:bg-white transition-colors ${inputErrorClass(touched.passportExpiry, errors.passportExpiry)}`}
              min={new Date().toISOString().split("T")[0]}
            />
            </div>
            {touched.passportExpiry && errors.passportExpiry && (
              <p id={`docexp-error-${index}`} className="text-xs text-red-600 mt-1">{errors.passportExpiry}</p>
            )}
          </div>
        </div>
      </div>

      {/* Individual Baggage Selection */}
      <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <PackagePlus className="w-4 h-4" />
            <span className="text-sm font-semibold">Chọn hành lý ký gửi (cá nhân)</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Mỗi hành khách có thể chọn hành lý ký gửi riêng biệt. Phí (nếu có) sẽ hiển thị trong phần tổng quan.
          </p>
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
                className={`relative p-3 rounded-lg border text-left text-xs font-medium transition group shadow-sm ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/40"
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
                {option.extraKg > 0 && (
                  <div className="mt-1 text-[10px] text-blue-600 font-medium">
                    +{option.extraKg}kg
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected baggage info removed to avoid duplication; summary handled elsewhere */}
      </div>

      {/* Special notes */}
      {passenger.type === "child" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-yellow-800 mb-2">
            Lưu ý cho trẻ em
          </h6>
          {touched.gender && errors.gender && (
            <p className="text-xs text-red-600 mt-1">{errors.gender}</p>
          )}
          <p className="text-sm text-yellow-700">
            Trẻ em dưới 14 tuổi cần mang theo <strong>giấy khai sinh bản gốc</strong> và phải có <strong>người lớn đi cùng</strong> trong suốt chuyến bay.
          </p>
        </div>
      )}

      {passenger.type === "infant" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-blue-800 mb-2">
            Lưu ý cho trẻ sơ sinh
          </h6>
          <p className="text-sm text-blue-700">
            Trẻ sơ sinh dưới 2 tuổi sẽ <strong>ngồi cùng người lớn</strong> và có thể được <strong>miễn phí hoặc giảm giá vé</strong> máy bay.
          </p>
        </div>
      )}
    </div>
  );
};

export default PassengerInformationForm;
              
