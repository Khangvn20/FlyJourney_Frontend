import React, { useState, useEffect } from 'react';
import { User, Gift, Lock, LogOut, Calendar, Edit3, Save, X } from 'lucide-react';
import { getUserInfo } from '../services/userService'; 
import { useAuth } from '../context/AuthProvider';
import { authService } from '../services/authService';

export const UpdateProfile: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const auth = useAuth();
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const res = await response.json();
      if (response.ok && res.status) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        if (onLogout) onLogout();
        window.location.href = '/';
      } else {
        console.warn('Logout failed:', res.errorMessage || 'Unknown error');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [editForm, setEditForm] = useState(user);

  useEffect(() => {
    const fetchUser = async () => {
      const info = await getUserInfo(); 
      if (info) {
        setUser(info);
        setEditForm(info);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    const res = await import('../services/userService').then(m => m.updateUserInfo(editForm));
    if (res.status) {
      setUser(editForm);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } else {
      alert(res.errorMessage || 'Cập nhật thất bại!');
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const menuItems = [
    { id: 'account', label: 'Tài khoản của tôi', icon: User, active: true },
    { id: 'orders', label: 'Mã đặt chỗ', icon: Calendar, active: false },
    { id: 'promotions', label: 'Khuyến mãi của tôi', icon: Gift, active: false },
    { id: 'security', label: 'Đổi mật khẩu', icon: Lock, active: false },
  ];
  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-br from-[#1e293b] to-[#182544] py-12 px-4">
      <div className="flex w-full max-w-6xl gap-8">
        {/* Sidebar */}
        <div className="w-80 bg-[#1e293b] rounded-lg shadow-xl border border-[#334155]">
          {/* Profile Header */}
          <div className="flex flex-col items-center py-8 px-6 border-b border-[#334155]">
            <div className="w-16 h-16 rounded-full bg-[#334155] flex items-center justify-center text-2xl font-bold text-white mb-4">
              VK
            </div>
            <div className="text-lg font-bold text-white text-center mb-1">
              VO NGUYEN VI KHANG
            </div>
            <div className="text-blue-200 text-sm text-center">
              khangvokhang87@gmail.com
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-black text-white'
                      : 'text-blue-200 hover:bg-[#334155] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
            
            <div className="border-t border-[#334155] mx-6 my-4"></div>
            
            <button 
              className="w-full flex items-center px-6 py-3 text-left font-medium text-blue-200 hover:bg-[#334155] hover:text-white transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#22305a] rounded-lg shadow-xl p-8 min-w-0">
          {/* Header with Edit Button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Thông tin tài khoản</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            {/* Name Field */}
            <div>
              <label className="block text-lg font-bold mb-3 text-white">
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-0 py-3 border-0 border-b-2 border-blue-200 focus:border-blue-400 focus:outline-none text-white bg-transparent text-lg"
                />
              ) : (
                <div className="w-full py-3 border-b-2 border-blue-200 text-white text-lg">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-lg font-bold mb-3 text-white">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-0 py-3 border-0 border-b-2 border-blue-200 focus:border-blue-400 focus:outline-none text-white bg-transparent text-lg"
                />
              ) : (
                <div className="w-full py-3 border-b-2 border-blue-200 text-white text-lg">
                  {user.email}
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-lg font-bold mb-3 text-white">
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-0 py-3 border-0 border-b-2 border-blue-200 focus:border-blue-400 focus:outline-none text-white bg-transparent text-lg"
                />
              ) : (
                <div className="w-full py-3 border-b-2 border-blue-200 text-white text-lg">
                  {user.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};