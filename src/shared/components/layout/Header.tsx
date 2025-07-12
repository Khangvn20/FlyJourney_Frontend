import React, { useState } from 'react';
import { Menu, Button, Dropdown } from 'antd';
import { Plane, User, Settings, LogOut, Bell, Globe } from 'lucide-react';
import { LoginModal } from '../../../features/auth';
import { useAuth } from '../../../features/auth/context/AuthProvider';

interface HeaderProps {
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Debug logging
  console.log('Header render - isAuthenticated:', isAuthenticated);
  console.log('Header render - user:', user);

  const handleMenuClick = (e: any) => {
    if (e.key === 'profile') {
      window.location.href = '/profile';
    } else if (e.key === 'bookings') {
      window.location.href = '/bookings';
    } else if (e.key === 'settings') {
      window.location.href = '/settings';
    } else if (e.key === 'logout') {
      logout();
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />, 
      label: 'Tài khoản của tôi',
    },
    {
      key: 'bookings',
      icon: <Plane size={16} />, 
      label: 'Đặt chỗ của tôi',
    },
    {
      key: 'settings',
      icon: <Settings size={16} />, 
      label: 'Cài đặt',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />, 
      label: 'Đăng xuất',
    },
  ];

  const menuItems = [
    {
      key: 'flights',
      label: 'Flights',
    },
    {
      key: 'deals',
      label: 'Deals',
    },
    {
      key: 'support',
      label: 'Support',
    },
  ];

  return (
    <>
      <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg mr-3">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FlyJourney</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:block">
              <Menu
                mode="horizontal"
                items={menuItems}
                className="bg-transparent border-none"
                style={{ lineHeight: '64px' }}
              />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button
                type="text"
                icon={<Globe className="h-4 w-4" />}
                className="text-slate-300 hover:text-white"
              >
                EN
              </Button>
              <Button
                type="text"
                icon={<Bell className="h-4 w-4" />}
                className="text-slate-300 hover:text-white"
              />
              {isAuthenticated ? (
                <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
                  <div className="flex items-center cursor-pointer">
                    <User size={24} className="text-slate-300" />
                    <span className="ml-2 text-white font-semibold">{user?.name || user?.email}</span>
                  </div>
                </Dropdown>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    type="text" 
                    className="text-slate-300 hover:text-white"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    type="primary" 
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                  >
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {isLoginModalOpen && (
        <LoginModal
          visible={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </>
  );
};