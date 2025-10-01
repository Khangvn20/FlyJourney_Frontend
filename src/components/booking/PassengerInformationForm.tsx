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
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  User,
  Calendar,
  Award as IdCard,
  PackagePlus,
} from "lucide-react";
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

const getPassengerTypeByAge = (age: number): "adult" | "child" | "infant" => {
  if (age < 2) return "infant";
  if (age < 14) return "child";
  return "adult";
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

    const updatedPassengers = passengers.map((passenger, index) => {
      console.log(
        `🔧 Auto-filling passenger ${index}:`,
        passenger.firstName || "EMPTY"
      );

      const sample = sampleData[index % sampleData.length];
      const age = calculateAge(sample.dateOfBirth);
      const autoType = getPassengerTypeByAge(age);

      const baggageOptions = [
        { option: "bg15", extraKg: 15, price: 260000 },
        { option: "bg10", extraKg: 10, price: 190000 },
        { option: "bg20", extraKg: 20, price: 330000 },
        { option: "none", extraKg: 0, price: 0 },
        { option: "bg10", extraKg: 10, price: 190000 },
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

    if (onBatchPassengerChange) {
      console.log(
        `🔧 Using batch update for all ${updatedPassengers.length} passengers`
      );
      onBatchPassengerChange(updatedPassengers);

      setCurrentPassengerIndex(0);
    } else {
      for (let i = updatedPassengers.length - 1; i >= 0; i--) {
        setTimeout(() => {
          onPassengerChange(i, updatedPassengers[i]);
        }, (updatedPassengers.length - 1 - i) * 20);
      }

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

  if (totalPassengers === 1) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden border-2 border-blue-100 rounded-2xl p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(59,130,246,0.15),transparent_55%)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Thông tin hành khách
                </h3>
                <p className="text-sm text-gray-600 mt-1.5 font-medium">
                  {passengerCounts.adults} người lớn •{" "}
                  {passengerCounts.children} trẻ em • {passengerCounts.infants}{" "}
                  trẻ sơ sinh
                </p>
              </div>
            </div>
            {shouldShowDevControls() && (
              <Button
                onClick={handleAutoFill}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 text-yellow-800 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-400 shadow-md hover:shadow-lg transition-all duration-200 font-semibold">
                <Zap className="h-4 w-4 mr-2" />
                DEV: Auto Fill
              </Button>
            )}
          </div>
        </div>

        <Card className="border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl text-gray-900 font-bold flex items-center gap-3">
              {getPassengerTitle(0, passengers[0])}
              {passengers[0]?.dateOfBirth && (
                <span className="text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-1.5 rounded-full border-2 border-blue-200 shadow-sm">
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

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden border-2 border-blue-100 rounded-2xl p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(59,130,246,0.15),transparent_55%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Thông tin hành khách
              </h3>
              <p className="text-sm text-gray-600 mt-1.5 font-medium">
                {passengerCounts.adults} người lớn • {passengerCounts.children}{" "}
                trẻ em • {passengerCounts.infants} trẻ sơ sinh
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full border-2 border-blue-200 shadow-md">
              {currentPassengerIndex + 1}/{totalPassengers}
            </div>
            {shouldShowDevControls() && (
              <Button
                onClick={handleAutoFill}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 text-yellow-800 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-400 shadow-md hover:shadow-lg transition-all duration-200 font-semibold">
                <Zap className="h-4 w-4 mr-2" />
                DEV: Auto Fill
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-3">
        {passengers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPassengerIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentPassengerIndex
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 scale-125 shadow-lg shadow-blue-500/50"
                : "bg-gray-300 hover:bg-gray-400 hover:scale-110"
            }`}
          />
        ))}
      </div>

      {currentPassenger && (
        <div className="relative">
          <Card className="border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white">
            <CardHeader className="pb-5">
              <CardTitle className="text-xl text-gray-900 font-bold flex items-center gap-3">
                {getPassengerTitle(currentPassengerIndex, currentPassenger)}
                {currentPassenger.dateOfBirth && (
                  <span className="text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-1.5 rounded-full border-2 border-blue-200 shadow-sm">
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

            <div className="absolute top-1/2 -translate-y-1/2 -left-5 z-20">
              <button
                onClick={goToPrevious}
                disabled={currentPassengerIndex === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2 shadow-lg ${
                  currentPassengerIndex === 0
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-blue-600 hover:bg-blue-50 border-blue-300 hover:border-blue-400 hover:shadow-xl hover:scale-110"
                }`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-5 z-20">
              <button
                onClick={goToNext}
                disabled={currentPassengerIndex === passengers.length - 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2 shadow-lg ${
                  currentPassengerIndex === passengers.length - 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-blue-600 hover:bg-blue-50 border-blue-300 hover:border-blue-400 hover:shadow-xl hover:scale-110"
                }`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {passengers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPassengerIndex(index)}
            className={`px-4 py-2.5 text-sm rounded-xl transition-all duration-200 font-bold shadow-md hover:shadow-lg ${
              index === currentPassengerIndex
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105 shadow-blue-500/40"
                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
            }`}>
            HK {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const PassengerForm: React.FC<{
  passenger: PassengerFormData;
  index: number;
  onFieldChange: (
    index: number,
    field: keyof PassengerFormData,
    value: string
  ) => void;
  onBaggageChange: (index: number, optionId: string) => void;
}> = ({ passenger, index, onFieldChange, onBaggageChange }) => {
  const [touched, setTouched] = React.useState({
    lastName: false,
    firstName: false,
    dateOfBirth: false,
    gender: false,
    passportNumber: false,
    passportExpiry: false,
  });

  const inputErrorClass = (t: boolean, err: string) =>
    t && err
      ? "border-red-500 focus-visible:ring-red-500 focus-visible:ring-2"
      : "";

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
    passportNumber: passenger.passportNumber?.trim()
      ? ""
      : "Vui lòng nhập số giấy tờ",
    passportExpiry:
      passenger.documentType === "passport"
        ? passenger.passportExpiry
          ? ""
          : "Vui lòng nhập ngày hết hạn hộ chiếu"
        : "",
  } as const;

  return (
    <div className="space-y-7">
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-200 shadow-md">
        <User className="w-4 h-4" />
        <span className="text-sm font-bold">Thông tin cá nhân</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor={`lastName-${index}`}
            className="text-sm font-bold text-gray-700">
            Họ và tên đệm *
          </Label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
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
              className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                touched.lastName,
                errors.lastName
              )}`}
            />
          </div>
          {touched.lastName && errors.lastName && (
            <p
              id={`lastName-error-${index}`}
              className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
              {errors.lastName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`firstName-${index}`}
            className="text-sm font-bold text-gray-700">
            Tên *
          </Label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
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
              className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                touched.firstName,
                errors.firstName
              )}`}
            />
          </div>
          {touched.firstName && errors.firstName && (
            <p
              id={`firstName-error-${index}`}
              className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
              {errors.firstName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={`dob-${index}`}
            className="text-sm font-bold text-gray-700">
            Ngày sinh *
          </Label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
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
              className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                touched.dateOfBirth,
                errors.dateOfBirth
              )}`}
              aria-invalid={touched.dateOfBirth && !!errors.dateOfBirth}
              aria-describedby={`dob-error-${index}`}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          {touched.dateOfBirth && errors.dateOfBirth && (
            <p
              id={`dob-error-${index}`}
              className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-bold text-gray-700">Giới tính *</Label>
          <Select
            value={passenger.gender || ""}
            onValueChange={(value: string) =>
              onFieldChange(index, "gender", value)
            }>
            <SelectTrigger
              className={`h-12 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                touched.gender,
                errors.gender
              )}`}
              onBlur={() => setTouched((t) => ({ ...t, gender: true }))}>
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Nam</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-bold text-gray-700">Quốc tịch *</Label>
          <Select
            value={passenger.nationality || "VN"}
            onValueChange={(value: string) =>
              onFieldChange(index, "nationality", value)
            }>
            <SelectTrigger className="h-12 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium">
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

      <div className="space-y-2">
        <Label className="text-sm font-bold text-gray-700">Số điện thoại</Label>
        <Input
          value={passenger.phone || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFieldChange(index, "phone", e.target.value)
          }
          placeholder="0912345678"
          className="h-12 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium"
          type="tel"
        />
        <p className="text-xs text-gray-600 font-medium bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100">
          Số điện thoại để liên hệ khẩn cấp với hành khách này
        </p>
      </div>

      <div className="space-y-5 pt-5 mt-4 border-t-2 border-gray-100">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-200 shadow-md">
          <IdCard className="w-4 h-4" />
          <span className="text-sm font-bold">Thông tin giấy tờ tùy thân</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              Loại giấy tờ *
            </Label>
            <Select
              value={passenger.documentType || "id_card"}
              onValueChange={(value: string) =>
                onFieldChange(index, "documentType", value)
              }>
              <SelectTrigger className="h-12 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium">
                <SelectValue placeholder="Chọn loại giấy tờ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_card">CCCD/CMND</SelectItem>
                <SelectItem value="passport">Hộ chiếu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              Số giấy tờ *
            </Label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <IdCard className="h-4 w-4" />
              </div>
              <Input
                value={passenger.passportNumber || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFieldChange(index, "passportNumber", e.target.value)
                }
                onBlur={() =>
                  setTouched((t) => ({ ...t, passportNumber: true }))
                }
                placeholder={
                  passenger.documentType === "passport"
                    ? "Số hộ chiếu"
                    : "Số CCCD/CMND"
                }
                aria-invalid={touched.passportNumber && !!errors.passportNumber}
                aria-describedby={`docnum-error-${index}`}
                className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                  touched.passportNumber,
                  errors.passportNumber
                )}`}
              />
            </div>
            {touched.passportNumber && errors.passportNumber && (
              <p
                id={`docnum-error-${index}`}
                className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                {errors.passportNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              Ngày hết hạn{" "}
              {passenger.documentType === "passport" ? "*" : "(tùy chọn)"}
            </Label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Calendar className="h-4 w-4" />
              </div>
              <Input
                type="date"
                value={passenger.passportExpiry || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFieldChange(index, "passportExpiry", e.target.value)
                }
                onBlur={() =>
                  setTouched((t) => ({ ...t, passportExpiry: true }))
                }
                aria-invalid={touched.passportExpiry && !!errors.passportExpiry}
                aria-describedby={`docexp-error-${index}`}
                className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                  touched.passportExpiry,
                  errors.passportExpiry
                )}`}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {touched.passportExpiry && errors.passportExpiry && (
              <p
                id={`docexp-error-${index}`}
                className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                {errors.passportExpiry}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 pt-5 mt-4 border-t-2 border-gray-100">
        <div>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-200 shadow-md">
            <PackagePlus className="w-4 h-4" />
            <span className="text-sm font-bold">
              Chọn hành lý ký gửi (cá nhân)
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-3 font-medium bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-100">
            Mỗi hành khách có thể chọn hành lý ký gửi riêng biệt. Phí (nếu có)
            sẽ hiển thị trong phần tổng quan.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BAGGAGE_OPTIONS.map((option) => {
            const isSelected =
              passenger.extraBaggage?.option === option.id ||
              (!passenger.extraBaggage && option.id === "none");
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onBaggageChange(index, option.id)}
                className={`relative p-4 rounded-xl border-2 text-left text-sm font-bold transition-all duration-200 group shadow-md hover:shadow-lg ${
                  isSelected
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-300 scale-105"
                    : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/40"
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                {option.extraKg > 0 && (
                  <div className="mt-2 text-xs text-blue-700 font-bold px-2 py-1 rounded-lg bg-blue-100 inline-block">
                    +{option.extraKg}kg
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {passenger.type === "child" && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-5 shadow-md">
          <h6 className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-600"></span>
            Lưu ý cho trẻ em
          </h6>
          {touched.gender && errors.gender && (
            <p className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1 mb-2">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
              {errors.gender}
            </p>
          )}
          <p className="text-sm text-yellow-800 font-medium leading-relaxed">
            Trẻ em dưới 14 tuổi cần mang theo{" "}
            <strong>giấy khai sinh bản gốc</strong> và phải có{" "}
            <strong>người lớn đi cùng</strong> trong suốt chuyến bay.
          </p>
        </div>
      )}

      {passenger.type === "infant" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
          <h6 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
            Lưu ý cho trẻ sơ sinh
          </h6>
          <p className="text-sm text-blue-800 font-medium leading-relaxed">
            Trẻ sơ sinh dưới 2 tuổi sẽ <strong>ngồi cùng người lớn</strong> và
            có thể được <strong>miễn phí hoặc giảm giá vé</strong> máy bay.
          </p>
        </div>
      )}
    </div>
  );
};

export default PassengerInformationForm;
