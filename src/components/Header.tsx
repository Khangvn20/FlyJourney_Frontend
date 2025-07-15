import React, { useState } from 'react';
import { Menu, Button, Dropdown, Avatar } from 'antd';
import { Plane, Bell, Globe, User, Settings, LogOut } from 'lucide-react';
import { LoginModal, RegisterModal } from '../features/auth';
import { useAuth } from '../features/auth/context/AuthProvider';

interface HeaderProps {
  onLogoClick: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onProfileClick }) => {
  const auth = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Debug logging
  console.log('Header render - auth:', auth);
  console.log('Header render - user:', auth.user);
  console.log('Header render - isAuthenticated:', auth.isAuthenticated);

  // Debug function to check localStorage


  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />, 
      label: 'Hồ sơ của tôi',
      onClick: onProfileClick,
    },
    {
      type: 'divider' as const,
    },
    {
      key : 'bookings',
      icon: <Plane size={16} />, 
      label: 'Đặt chỗ của tôi',
      onClick: () => window.location.href = '/bookings',
    },
    {
      key: 'settings',
      icon: <Settings size={16} />, 
      label: 'Cài đặt',
      onClick: () => window.location.href = '/settings',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />, 
      label: 'Đăng xuất',
      onClick: async () => {
        try {
          await auth.logout();
          if (typeof onLogoClick === 'function') {
            onLogoClick();
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    },
  ];

  const menuItems = [
    {
      key: 'about',
      label: 'Về chúng tôi',
    },
    {
      key: 'support',
      label: 'Hỗ trợ',
    },
    {
      key: 'promotion',
      label: 'Khuyến mãi',
    },
  ];

  return (
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

          {/* User Actions - This is the key conditional rendering section */}
          <div className="flex items-center space-x-4">
  

        
           
           
            {/* Conditional rendering: User menu OR Login/Register buttons */}
            {auth.user ? (
              // User is logged in - Show user menu
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center cursor-pointer">
                  <Avatar size={32} className="bg-blue-500 hover:bg-blue-600 transition-colors" icon={<User size={16} />} />
                  <span className="ml-2 text-white font-semibold">{auth.user.name || auth.user.email}</span>
                </div>
              </Dropdown>
            ) : (
              // User is not logged in - Show login/register buttons
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
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal 
          visible={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      
      {/* Register Modal */}
      {isRegisterModalOpen && (
        <RegisterModal 
          visible={isRegisterModalOpen} 
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}
    </header>
  );
};

export default Header;