import React from "react";

export interface BasicPassengerData {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other" | "";
}

interface BasicPassengerInfoProps {
  value: BasicPassengerData;
  onChange: (v: BasicPassengerData) => void;
}

const BasicPassengerInfo: React.FC<BasicPassengerInfoProps> = ({
  value,
  onChange,
}) => {
  const update = (patch: Partial<BasicPassengerData>) =>
    onChange({ ...value, ...patch });
  const requiredInvalid = !value.firstName.trim() || !value.lastName.trim();
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        Thông tin hành khách chính
      </h4>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Họ <span className="text-red-500">*</span>
          </label>
          <input
            value={value.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            placeholder="Nguyễn"
            className="w-full text-sm px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tên & tên đệm <span className="text-red-500">*</span>
          </label>
          <input
            value={value.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="Văn A"
            className="w-full text-sm px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Giới tính
          </label>
          <select
            value={value.gender}
            onChange={(e) =>
              update({ gender: e.target.value as BasicPassengerData["gender"] })
            }
            className="w-full text-sm px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300 bg-white">
            <option value="">Chọn</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>
      {requiredInvalid && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
          Vui lòng nhập đầy đủ họ và tên hành khách.
        </p>
      )}
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Tên phải trùng trên giấy tờ tùy thân. Bạn có thể bổ sung thêm hành khách
        khác ở phiên bản sau.
      </p>
    </div>
  );
};

export default BasicPassengerInfo;
