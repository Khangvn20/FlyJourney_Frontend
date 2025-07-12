
import React from 'react';
import { User, Gift, Lock, LogOut, Mail, Phone, Bookmark } from 'lucide-react';

export const UpdateProfile: React.FC = () => {
  // Dummy data, replace with real user data from context or props
  const user = {
    name: 'VO NGUYEN VI KHANG',
    email: 'khangvokhang87@gmail.com',
    phone: '0854053526',
    memberCode: '060625233723',
  };

  return (
    <div className="flex justify-center items-start min-h-[70vh] bg-gradient-to-br from-[#1e293b] to-[#182544] py-12">
      {/* Sidebar */}
      <div className="w-80 bg-[#1e293b] rounded-lg shadow border border-[#182544] mr-8">
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center text-3xl font-bold text-white mb-3">
            VK
          </div>
          <div className="text-xl font-bold text-white">{user.name}</div>
          <div className="text-blue-200 text-sm">{user.email}</div>
        </div>
        <div className="border-t border-[#22305a]">
          <ul className="py-2">
            <li className="px-6 py-3 flex items-center font-semibold text-white bg-[#22305a] rounded cursor-pointer">
              <User className="w-5 h-5 mr-2" /> Tài khoản của tôi
            </li>
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[#22305a] rounded-lg shadow p-10 min-w-[500px]">
        <div className="mb-6">
          <div className="font-bold text-lg mb-2 text-white">Họ và tên</div>
          <div className="border-b border-blue-200 pb-2 mb-4 text-white">{user.name}</div>
          <div className="font-bold text-lg mb-2 text-white">Email</div>
          <div className="border-b border-blue-200 pb-2 mb-4 text-white">{user.email}</div>
          <div className="font-bold text-lg mb-2 text-white">Số điện thoại</div>
          <div className="border-b border-blue-200 pb-2 mb-4 text-white">{user.phone}</div>
          <div className="font-bold text-lg mb-2 text-white">Mã thành viên</div>
          <div className="border-b border-blue-200 pb-2 mb-4 text-white">{user.memberCode}</div>
        </div>
      </div>
    </div>
  );
};
