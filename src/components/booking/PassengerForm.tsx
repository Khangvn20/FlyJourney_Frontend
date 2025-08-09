import React, { useState, useMemo } from "react";
import type {
  PassengerFormData,
  PassengerType,
} from "../../shared/types/passenger.types";
import { User, Baby, Users, ChevronDown, Search } from "lucide-react";
import {
  DEV_CONFIG,
  shouldShowDevControls,
} from "../../shared/config/devConfig";
import { COUNTRIES, sortCountries } from "../../shared/constants/countries";
import ReactCountryFlag from "react-country-flag";

interface PassengerFormProps {
  passengers: PassengerFormData[];
  onChange: (list: PassengerFormData[]) => void;
  requiredCounts: { adult: number; child: number; infant: number };
  referenceDate?: string; // ISO date string (departure date)
}

// --- Helpers -----------------------------------------------------------------
const emptyPassenger = (type: PassengerType): PassengerFormData => ({
  id: crypto.randomUUID(),
  type,
  firstName: "",
  lastName: "",
});

function ensureCounts(
  list: PassengerFormData[],
  req: PassengerFormProps["requiredCounts"]
) {
  const result = [...list];
  const countType = (t: PassengerType) =>
    result.filter((p) => p.type === t).length;
  (["adult", "child", "infant"] as PassengerType[]).forEach((type) => {
    const needed = req[type];
    while (countType(type) < needed) result.push(emptyPassenger(type));
  });
  return result;
}

const MAX_ADULT_AGE = 100; // business rule
const ABSOLUTE_MAX_AGE = 120; // hard safety cap

const computeAge = (dobStr: string, ref?: string) => {
  const dob = new Date(dobStr + "T00:00:00");
  if (isNaN(dob.getTime())) return null;
  const base = ref ? new Date(ref) : new Date();
  if (isNaN(base.getTime())) return null;
  let age = base.getFullYear() - dob.getFullYear();
  const m = base.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && base.getDate() < dob.getDate())) age--;
  return age;
};

// Convert ISO 3166-1 alpha-2 country code to emoji flag (fallback if SVG not supported)
const flagEmoji = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

// --- Component ----------------------------------------------------------------
const PassengerForm: React.FC<PassengerFormProps> = ({
  passengers,
  onChange,
  requiredCounts,
  referenceDate,
}) => {
  const normalized = useMemo(
    () => ensureCounts(passengers, requiredCounts),
    [passengers, requiredCounts]
  );

  // Expand state (store passenger ids that are open)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(normalized.map((p) => p.id))
  ); // open all by default
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  // Touched tracking for required field errors
  const [touched, setTouched] = useState<
    Record<string, Partial<Record<keyof PassengerFormData, boolean>>>
  >({});
  const markTouched = (id: string, field: keyof PassengerFormData) =>
    setTouched((prev) => ({ ...prev, [id]: { ...prev[id], [field]: true } }));

  // Nationality selection panel state
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryPanel, setShowCountryPanel] = useState<string | null>(null);
  const countryOptions = useMemo(() => {
    const list = sortCountries(COUNTRIES);
    if (!countrySearch.trim()) return list;
    const q = countrySearch.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const updateField = (
    id: string,
    field: keyof PassengerFormData,
    value: string
  ) => {
    onChange(
      normalized.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };
  const updateNationality = (id: string, countryName: string) => {
    onChange(
      normalized.map((p) =>
        p.id === id ? { ...p, nationality: countryName } : p
      )
    );
  };

  const typeMeta: Record<
    PassengerType,
    { label: string; icon: React.ReactNode; gradient: string }
  > = {
    adult: {
      label: "Người lớn",
      icon: <User className="w-4 h-4" />,
      gradient: "from-blue-500/90 to-blue-600/90",
    },
    child: {
      label: "Trẻ em",
      icon: <Users className="w-4 h-4" />,
      gradient: "from-emerald-500/90 to-emerald-600/90",
    },
    infant: {
      label: "Em bé",
      icon: <Baby className="w-4 h-4" />,
      gradient: "from-rose-500/90 to-rose-600/90",
    },
  };

  // Required field error logic
  const requiredError = (
    p: PassengerFormData,
    field: keyof PassengerFormData
  ) => {
    const isRequired = field === "firstName" || field === "lastName";
    if (!isRequired) return false;
    if (DEV_CONFIG.BYPASS_PASSENGER_NAME_VALIDATION && shouldShowDevControls())
      return false;
    if (!touched[p.id]?.[field]) return false;
    if (field === "firstName") return !p.firstName?.trim();
    if (field === "lastName") return !p.lastName?.trim();
    return false;
  };

  // Basic profanity filter (simple substring list)
  const banned = ["fuck", "shit", "bitch", "dm"]; // extend as needed
  const hasBanned = (text: string) =>
    DEV_CONFIG.ENABLE_NAME_PROFANITY_FILTER &&
    banned.some((t) => text.toLowerCase().includes(t));

  // Age validation by type
  const validateAge = (p: PassengerFormData) => {
    if (!p.dateOfBirth) return null;
    if (DEV_CONFIG.BYPASS_PASSENGER_AGE_VALIDATION && shouldShowDevControls())
      return null;
    const age = computeAge(p.dateOfBirth, referenceDate);
    if (age == null) return null;
    if (age < 0) return "Ngày sinh không hợp lệ.";
    if (age > ABSOLUTE_MAX_AGE)
      return `Tuổi vượt quá giới hạn hỗ trợ (≤${ABSOLUTE_MAX_AGE}).`;
    if (p.type === "infant" && age >= 2) return "Em bé phải dưới 2 tuổi.";
    if (p.type === "child" && (age < 2 || age >= 12))
      return "Trẻ em phải từ 2 đến dưới 12 tuổi.";
    if (p.type === "adult" && age < 12)
      return "Người lớn phải từ 12 tuổi trở lên.";
    if (p.type === "adult" && age > MAX_ADULT_AGE)
      return `Người lớn vượt quá giới hạn tuổi (${MAX_ADULT_AGE}).`;
    return null;
  };

  return (
    <div className="space-y-4">
      {normalized.map((p, idx) => {
        const meta = typeMeta[p.type as PassengerType];
        if (!meta)
          return (
            <div
              key={p.id}
              className="p-4 border rounded bg-red-50 text-red-600 text-sm">
              Loại hành khách không hợp lệ: {String(p.type)}
            </div>
          );
        return (
          <div
            key={p.id}
            className="rounded-xl border shadow-sm bg-white overflow-hidden transition hover:shadow-md">
            <button
              type="button"
              onClick={() => toggle(p.id)}
              className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r ${meta.gradient} text-white text-left group`}>
              <div className="flex items-center gap-3">
                <span className="p-2 bg-white/15 rounded-md backdrop-blur-sm">
                  {meta.icon}
                </span>
                <div>
                  <div className="text-xs uppercase tracking-wide opacity-90">
                    Hành khách {idx + 1}
                  </div>
                  <div className="font-semibold flex items-center gap-2">
                    {meta.label}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm font-medium">
                      {p.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  expanded.has(p.id) ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                expanded.has(p.id) ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}>
              <div className="overflow-hidden">
                <div className="p-4 md:p-5 space-y-5 bg-gradient-to-b from-white to-gray-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Last Name */}
                    <div>
                      <label className="flex text-xs font-medium text-gray-600 mb-1 items-center gap-1">
                        Họ <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={p.lastName || ""}
                        onChange={(e) =>
                          updateField(p.id, "lastName", e.target.value)
                        }
                        onBlur={() => markTouched(p.id, "lastName")}
                        className={`w-full text-sm px-3 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 transition placeholder:text-gray-400 ${
                          requiredError(p, "lastName")
                            ? "border-red-400 focus:ring-red-300"
                            : "border-gray-300 focus:ring-blue-300"
                        }`}
                        placeholder="Nguyễn"
                        aria-required
                        aria-invalid={requiredError(p, "lastName")}
                      />
                      {requiredError(p, "lastName") && (
                        <p className="mt-1 text-xs text-red-500">
                          Vui lòng nhập họ.
                        </p>
                      )}
                    </div>
                    {/* First Name */}
                    <div>
                      <label className="flex text-xs font-medium text-gray-600 mb-1 items-center gap-1">
                        Tên đệm & tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={p.firstName || ""}
                        onChange={(e) =>
                          updateField(p.id, "firstName", e.target.value)
                        }
                        onBlur={() => markTouched(p.id, "firstName")}
                        className={`w-full text-sm px-3 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 transition placeholder:text-gray-400 ${
                          requiredError(p, "firstName")
                            ? "border-red-400 focus:ring-red-300"
                            : "border-gray-300 focus:ring-blue-300"
                        }`}
                        placeholder="Văn A"
                        aria-required
                        aria-invalid={requiredError(p, "firstName")}
                      />
                      {requiredError(p, "firstName") && (
                        <p className="mt-1 text-xs text-red-500">
                          Vui lòng nhập tên.
                        </p>
                      )}
                    </div>
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={p.dateOfBirth || ""}
                        onChange={(e) =>
                          updateField(p.id, "dateOfBirth", e.target.value)
                        }
                        className="w-full text-sm px-3 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 border-gray-300 placeholder:text-gray-400"
                      />
                      {validateAge(p) && (
                        <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                          {validateAge(p)}
                        </div>
                      )}
                    </div>
                    {/* Nationality */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quốc tịch
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowCountryPanel((cur) =>
                            cur === p.id ? null : p.id
                          )
                        }
                        className="text-xs inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 transition bg-white shadow-sm">
                        <span className="text-gray-600 font-medium flex items-center gap-1">
                          {p.nationality ? (
                            <>
                              {/* Try to find country code for emoji */}
                              {(() => {
                                const match = COUNTRIES.find(
                                  (c) => c.name === p.nationality
                                );
                                if (!match) return null;
                                return (
                                  <span className="flex items-center justify-center w-5 h-5 rounded overflow-hidden ring-1 ring-gray-200 bg-white">
                                    <ReactCountryFlag
                                      svg
                                      countryCode={match.code}
                                      className="!w-full !h-full object-cover"
                                      style={{ width: "100%", height: "100%" }}
                                      aria-label={match.name}
                                      title={match.code}
                                    />
                                    <noscript>{flagEmoji(match.code)}</noscript>
                                  </span>
                                );
                              })()}
                              {p.nationality}
                            </>
                          ) : (
                            "Chọn quốc tịch"
                          )}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            showCountryPanel === p.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showCountryPanel === p.id && (
                        <div className="relative mt-2 z-10">
                          <div className="p-3 border rounded-lg bg-white shadow-lg space-y-2">
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                              <input
                                value={countrySearch}
                                onChange={(e) =>
                                  setCountrySearch(e.target.value)
                                }
                                placeholder="Tìm quốc gia..."
                                className="w-full text-xs pl-8 pr-3 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 border-gray-300 placeholder:text-gray-400"
                              />
                            </div>
                            <div className="max-h-60 overflow-auto rounded border border-gray-100">
                              {countryOptions.map((c) => (
                                <button
                                  type="button"
                                  key={c.code}
                                  onClick={() => {
                                    updateNationality(p.id, c.name);
                                    setShowCountryPanel(null);
                                    setCountrySearch("");
                                  }}
                                  className={`w-full text-left px-2 py-1.5 text-[11px] flex items-center justify-between hover:bg-blue-50 ${
                                    p.nationality === c.name
                                      ? "bg-blue-100/70 text-blue-700 font-medium"
                                      : "text-gray-700"
                                  }`}>
                                  <span className="flex items-center gap-1">
                                    <span className="flex items-center justify-center w-4 h-4 rounded overflow-hidden ring-1 ring-gray-200 bg-white">
                                      <ReactCountryFlag
                                        svg
                                        countryCode={c.code}
                                        className="!w-full !h-full object-cover"
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                        }}
                                        aria-label={c.name}
                                        title={c.code}
                                      />
                                      <noscript>{flagEmoji(c.code)}</noscript>
                                    </span>
                                    {c.name}
                                  </span>
                                  <span className="text-[9px] opacity-60 font-mono">
                                    {c.code}
                                  </span>
                                </button>
                              ))}
                              {countryOptions.length === 0 && (
                                <div className="px-2 py-2 text-[11px] text-gray-500">
                                  Không tìm thấy quốc gia
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end items-center gap-2 text-[10px] text-gray-500">
                              <button
                                type="button"
                                onClick={() => setShowCountryPanel(null)}
                                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">
                                Đóng
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 mt-1" />
                    Tên hành khách phải trùng với giấy tờ tùy thân (CMND/CCCD,
                    hộ chiếu...).
                  </div>
                  {(p.firstName || p.lastName) &&
                    hasBanned((p.firstName || "") + (p.lastName || "")) && (
                      <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                        Tên chứa từ không hợp lệ. Vui lòng chỉnh sửa.
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Instruction Panel */}
      <div className="rounded-md bg-sky-50 border border-sky-200 text-[11px] md:text-xs px-4 py-3 space-y-2 leading-relaxed text-sky-800">
        <div className="text-center font-semibold text-sky-700">
          Lưu ý: Vui lòng điền đúng đầy đủ thông tin hành khách: Giới tính, ngày
          sinh...
          <br className="hidden md:block" />
          Các hãng từ chối hỗ trợ với các trường hợp không điền đúng hoặc điền
          thiếu.
        </div>
        <hr className="border-sky-200" />
        <div className="grid md:grid-cols-2 gap-4">
          <ol className="list-decimal list-inside space-y-1">
            <li>Các trường có dấu sao (*) là thông tin bắt buộc.</li>
            <li>
              <b>Họ</b>: Ví dụ: Nguyễn. <b>Tên đệm & Tên</b>: Ví dụ: Thu Hằng.
            </li>
            <li>
              Tên hành khách phải hợp lệ, không dùng tên giả, tên chứa số, ký tự
              đặc biệt.
            </li>
            <li>
              Nếu gặp khó khăn khi nhập tên khách, liên hệ tổng đài hỗ trợ để
              được trợ giúp.
            </li>
          </ol>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Trẻ em có độ tuổi từ <b>2-12</b> tính đến ngày bay.
            </li>
            <li>Em bé dưới 2 tuổi tính đến ngày bay.</li>
            <li>
              Nếu ngày sinh không nằm trong khoảng hợp lệ của loại hành khách đã
              chọn, vui lòng chọn lại loại hoặc ngày bay khác.
            </li>
            <li>
              Kiểm tra kỹ tiếng Việt có dấu để tránh phí chỉnh sửa phát sinh sau
              này.
            </li>
          </ol>
        </div>
        {DEV_CONFIG.BYPASS_PASSENGER_NAME_VALIDATION &&
          shouldShowDevControls() && (
            <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              Dev: Validation tên đang được bỏ qua
              (BYPASS_PASSENGER_NAME_VALIDATION=true).
            </div>
          )}
        {DEV_CONFIG.BYPASS_PASSENGER_AGE_VALIDATION &&
          shouldShowDevControls() && (
            <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              Dev: Validation tuổi đang được bỏ qua
              (BYPASS_PASSENGER_AGE_VALIDATION=true).
            </div>
          )}
      </div>
    </div>
  );
};

export default PassengerForm;
