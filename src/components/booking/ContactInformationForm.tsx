import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "../../hooks/useAuth";
import { User, Phone, Mail, MapPin } from "lucide-react";

interface ContactInformationFormProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  onContactNameChange: (name: string) => void;
  onContactEmailChange: (email: string) => void;
  onContactPhoneChange: (phone: string) => void;
  onContactAddressChange: (address: string) => void;
}

const ContactInformationForm: React.FC<ContactInformationFormProps> = ({
  contactName,
  contactEmail,
  contactPhone,
  contactAddress,
  onContactNameChange,
  onContactEmailChange,
  onContactPhoneChange,
  onContactAddressChange,
}) => {
  const { user } = useAuth();
  const [touched, setTouched] = React.useState({
    name: false,
    email: false,
    phone: false,
    address: false,
  });

  const isValidEmail = (email: string) => {
    if (!email.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    if (!phone.trim()) return false;
    const normalized = phone.replace(/[\s-]/g, "");
    return /^(0\d{9}|\+?84\d{9})$/.test(normalized);
  };

  const errors = {
    name: contactName.trim() ? "" : "Vui lòng nhập họ và tên",
    email: isValidEmail(contactEmail)
      ? ""
      : contactEmail.trim()
      ? "Email không hợp lệ"
      : "Vui lòng nhập email",
    phone: isValidPhone(contactPhone)
      ? ""
      : contactPhone.trim()
      ? "Số điện thoại không hợp lệ"
      : "Vui lòng nhập số điện thoại",
    address: contactAddress.trim() ? "" : "Vui lòng nhập địa chỉ liên hệ",
  } as const;

  const inputErrorClass = (fieldTouched: boolean, errorMsg: string) =>
    fieldTouched && errorMsg
      ? "border-red-500 focus-visible:ring-red-500 focus-visible:ring-2"
      : "";

  return (
    <Card className="relative overflow-hidden border-2 border-blue-100 bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_80%_75%,rgba(99,102,241,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-200/30 blur-3xl" />
      <CardHeader className="pb-5 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl text-gray-900 font-bold flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40">
              <User className="h-5 w-5" />
            </span>
            Thông tin liên hệ
            <span className="ml-2 text-xs font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full border-2 border-blue-200 shadow-sm">
              Người đặt vé
            </span>
          </CardTitle>
          {user && (
            <button
              type="button"
              onClick={() => {
                if (user.name) onContactNameChange(user.name);
                if (user.email) onContactEmailChange(user.email);
                if (user.phone) onContactPhoneChange(user.phone);
              }}
              className="text-xs text-blue-700 hover:text-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold">
              Dùng thông tin tài khoản
            </button>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-600 font-medium bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100">
          Dùng thông tin tài khoản để điền nhanh, bạn vẫn có thể chỉnh sửa.
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="contact-name"
              className="text-sm font-bold text-gray-700">
              Họ và tên người liên hệ *
              {user && (
                <span className="text-xs text-gray-500 font-normal ml-2"></span>
              )}
            </Label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onContactNameChange(e.target.value)
                }
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Nguyễn Văn An"
                aria-invalid={touched.name && !!errors.name}
                aria-describedby="contact-name-error"
                className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                  touched.name,
                  errors.name
                )}`}
              />
            </div>
            {touched.name && errors.name && (
              <p
                id="contact-name-error"
                className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="contact-phone"
              className="text-sm font-bold text-gray-700">
              Số điện thoại *
            </Label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Phone className="h-4 w-4" />
              </div>
              <Input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onContactPhoneChange(e.target.value)
                }
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="0912345678"
                aria-invalid={touched.phone && !!errors.phone}
                aria-describedby="contact-phone-error"
                className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                  touched.phone,
                  errors.phone
                )}`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p
                id="contact-phone-error"
                className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="contact-email"
            className="text-sm font-bold text-gray-700">
            Email liên hệ *
            {user?.email && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Tự điền - có thể chỉnh)
              </span>
            )}
          </Label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onContactEmailChange(e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="example@email.com"
              aria-invalid={touched.email && !!errors.email}
              aria-describedby="contact-email-error"
              className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                touched.email,
                errors.email
              )}`}
            />
          </div>
          <p className="text-xs text-gray-600 font-medium bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100">
            Email này sẽ nhận thông tin xác nhận vé và thông báo quan trọng
          </p>
          {touched.email && errors.email && (
            <p
              id="contact-email-error"
              className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="contact-address"
            className="text-sm font-bold text-gray-700">
            Địa chỉ liên hệ *
          </Label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="contact-address"
              value={contactAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onContactAddressChange(e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              aria-invalid={touched.address && !!errors.address}
              aria-describedby="contact-address-error"
              className={`h-12 pl-11 bg-gray-50 hover:bg-white focus:bg-white border-2 transition-all duration-200 font-medium ${inputErrorClass(
                touched.address,
                errors.address
              )}`}
            />
          </div>
          <p className="text-xs text-gray-600 font-medium bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100">
            Địa chỉ để gửi thông tin xác nhận booking và liên hệ khi cần thiết
          </p>
          {touched.address && errors.address && (
            <p
              id="contact-address-error"
              className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
              {errors.address}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInformationForm;
