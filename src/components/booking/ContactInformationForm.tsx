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
  // Inline validation state & helpers
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
    <Card className="relative overflow-hidden border border-blue-100 bg-white shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.08),transparent_60%)]" />
      <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-100/40 blur-3xl" />
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg text-gray-900 font-semibold flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow">
              <User className="h-4 w-4" />
            </span>
            Thông tin liên hệ
            <span className="ml-2 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
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
              className="text-xs text-blue-700 hover:text-blue-800 bg-blue-50/90 border border-blue-200 px-3 py-1 rounded-md shadow-sm">
              Dùng thông tin tài khoản
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Dùng thông tin tài khoản để điền nhanh, bạn vẫn có thể chỉnh sửa.
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Name */}
          <div className="space-y-2">
            <Label
              htmlFor="contact-name"
              className="text-sm font-medium text-gray-700">
              Họ và tên người liên hệ *
              {user && (
                <span className="text-xs text-gray-500 font-normal ml-2"></span>
              )}
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
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
                className={`h-11 pl-9 ${inputErrorClass(touched.name, errors.name)}`}
              />
            </div>
            {touched.name && errors.name && (
              <p id="contact-name-error" className="text-xs text-red-600 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label
              htmlFor="contact-phone"
              className="text-sm font-medium text-gray-700">
              Số điện thoại *
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
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
                className={`h-11 pl-9 ${inputErrorClass(touched.phone, errors.phone)}`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p id="contact-phone-error" className="text-xs text-red-600 mt-1">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
            Email liên hệ *
            {user?.email && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Tự điền - có thể chỉnh)
              </span>
            )}
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
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
              className={`h-11 pl-9 ${inputErrorClass(touched.email, errors.email)}`}
            />
          </div>
          <p className="text-xs text-gray-500">
            Email này sẽ nhận thông tin xác nhận vé và thông báo quan trọng
          </p>
          {touched.email && errors.email && (
            <p id="contact-email-error" className="text-xs text-red-600 mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Contact Address */}
        <div className="space-y-2">
          <Label
            htmlFor="contact-address"
            className="text-sm font-medium text-gray-700">
            Địa chỉ liên hệ *
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
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
              className={`h-11 pl-9 ${inputErrorClass(touched.address, errors.address)}`}
            />
          </div>
          <p className="text-xs text-gray-500">
            Địa chỉ để gửi thông tin xác nhận booking và liên hệ khi cần thiết
          </p>
          {touched.address && errors.address && (
            <p id="contact-address-error" className="text-xs text-red-600 mt-1">
              {errors.address}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInformationForm;
