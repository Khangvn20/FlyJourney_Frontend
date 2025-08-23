import React, { useMemo } from "react";
import type { PassengerFormData } from "../../shared/types/passenger.types";

// Lightweight country list (can be expanded or sourced elsewhere later)
const COUNTRIES = [
  "Vietnam",
  "United States",
  "Singapore",
  "Thailand",
  "Malaysia",
  "Japan",
  "South Korea",
  "China",
  "Australia",
  "France",
  "Germany",
  "United Kingdom",
];

interface ExtendedPassengerFormProps {
  value: PassengerFormData;
  onChange: (v: PassengerFormData) => void;
}

export const ExtendedPassengerForm: React.FC<ExtendedPassengerFormProps> = ({
  value,
  onChange,
}) => {
  const update = (patch: Partial<PassengerFormData>) =>
    onChange({ ...value, ...patch });

  // Always default to passport unless user explicitly switches
  const docType: "passport" | "id_card" = value.documentType || "passport";

  const handleDocTypeChange = (t: "passport" | "id_card") => {
    if (t === docType) return;
    if (t === "id_card") {
      update({ documentType: t, passportExpiry: undefined });
    } else {
      update({ documentType: t });
    }
  };

  const countries = useMemo(() => COUNTRIES, []);

  return (
    <div className="space-y-5 p-4 border rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h4 className="text-sm font-semibold text-gray-800">
          Chi tiết giấy tờ
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Loại giấy tờ:</span>
          <div className="inline-flex rounded-lg overflow-hidden border">
            <button
              type="button"
              onClick={() => handleDocTypeChange("passport")}
              className={`px-3 py-1.5 text-xs font-medium transition ${
                docType === "passport"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}>
              Hộ chiếu
            </button>
            <button
              type="button"
              onClick={() => handleDocTypeChange("id_card")}
              className={`px-3 py-1.5 text-xs font-medium transition border-l ${
                docType === "id_card"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}>
              CCCD/CMND
            </button>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Ngày sinh
          </label>
          <input
            type="date"
            value={value.dateOfBirth || ""}
            onChange={(e) => update({ dateOfBirth: e.target.value })}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Quốc tịch
          </label>
          <CountryAutoComplete
            value={value.nationality || ""}
            onChange={(v) => {
              // When nationality changes and issuingCountry empty or previously same nationality, keep them in sync
              if (
                !value.issuingCountry ||
                value.issuingCountry === value.nationality
              ) {
                update({ nationality: v, issuingCountry: v });
              } else {
                update({ nationality: v });
              }
            }}
            countries={countries}
          />
        </div>
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nước cấp
          </label>
          <CountryAutoComplete
            value={value.issuingCountry || ""}
            onChange={(v) => {
              // If user sets issuing country explicitly different, keep separate; if nationality blank set it too
              if (!value.nationality) {
                update({ issuingCountry: v, nationality: v });
              } else {
                update({ issuingCountry: v });
              }
            }}
            countries={countries}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {docType === "passport" ? "Số hộ chiếu" : "Số CCCD"}
          </label>
          <input
            value={value.passportNumber || ""}
            onChange={(e) => update({ passportNumber: e.target.value })}
            placeholder={docType === "passport" ? "P12345678" : "0790xxxxxxx"}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {docType === "passport" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Hết hạn
            </label>
            <input
              type="date"
              value={value.passportExpiry || ""}
              onChange={(e) => update({ passportExpiry: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-500">
        Ngày được gửi dạng dd/MM/yyyy tới backend. Vui lòng kiểm tra chính xác.
      </p>
    </div>
  );
};

// Simple inline autocomplete without external libs.
const CountryAutoComplete: React.FC<{
  value: string;
  onChange: (v: string) => void;
  countries: string[];
}> = ({ value, onChange, countries }) => {
  const [query, setQuery] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const filtered = useMemo(
    () =>
      query.trim()
        ? countries.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
        : countries,
    [countries, query]
  );
  React.useEffect(() => setQuery(value), [value]);
  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="Vietnam"
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-40 overflow-auto w-full bg-white border border-gray-200 rounded-lg shadow-md">
          {filtered.map((c) => (
            <button
              type="button"
              key={c}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(c);
                setQuery(c);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 ${
                c === value ? "bg-blue-100/70" : ""
              }`}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExtendedPassengerForm;
