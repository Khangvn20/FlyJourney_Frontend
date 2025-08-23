import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "../../hooks/useAuth";

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

  // Auto-fill contact info from user account when component mounts
  React.useEffect(() => {
    if (user) {
      // Auto-fill email if not already set
      if (!contactEmail && user.email) {
        onContactEmailChange(user.email);
      }
      // Auto-fill phone if not already set
      if (!contactPhone && user.phone) {
        onContactPhoneChange(user.phone);
      }
      // Auto-fill name if not already set
      if (!contactName && user.name) {
        onContactNameChange(user.name);
      }
    }
  }, [user, contactName, contactEmail, contactPhone, onContactNameChange, onContactEmailChange, onContactPhoneChange]);

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-900 font-semibold">
          Thông tin liên hệ
          <span className="ml-3 text-sm font-normal text-green-700 bg-green-50 px-3 py-1 rounded-full">
            Người đặt vé
          </span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Thông tin này sẽ được sử dụng để liên hệ về đặt vé và thông báo quan trọng
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
              Họ và tên người liên hệ *
              {user && (
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (Từ tài khoản)
                </span>
              )}
            </Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onContactNameChange(e.target.value)
              }
              placeholder="Nguyễn Văn An"
              className="h-11"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="text-sm font-medium text-gray-700">
              Số điện thoại *
              {user?.phone && (
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (Từ tài khoản)
                </span>
              )}
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              value={contactPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onContactPhoneChange(e.target.value)
              }
              placeholder="0912345678"
              className="h-11"
            />
          </div>
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
            Email liên hệ *
            {user?.email && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Mặc định từ tài khoản, có thể thay đổi)
              </span>
            )}
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={contactEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onContactEmailChange(e.target.value)
            }
            placeholder="example@email.com"
            className="h-11"
          />
          <p className="text-xs text-gray-500">
            Email này sẽ nhận thông tin xác nhận vé và thông báo quan trọng
          </p>
        </div>

        {/* Contact Address */}
        <div className="space-y-2">
          <Label htmlFor="contact-address" className="text-sm font-medium text-gray-700">
            Địa chỉ liên hệ *
          </Label>
          <Input
            id="contact-address"
            value={contactAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onContactAddressChange(e.target.value)
            }
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            className="h-11"
          />
          <p className="text-xs text-gray-500">
            Địa chỉ để gửi thông tin xác nhận booking và liên hệ khi cần thiết
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInformationForm;