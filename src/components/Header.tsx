import React, { useState } from 'react';
import { Menu, Button, Avatar, Dropdown } from 'antd';
import { Plane, User, Settings, LogOut, Bell, Globe } from 'lucide-react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'My Profile',
    },
    {
      key: 'bookings',
      icon: <Plane size={16} />,
      label: 'My Bookings',
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Sign Out',
      onClick: () => setIsLoggedIn(false),
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

            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar 
                  size={32} 
                  className="bg-blue-500 cursor-pointer hover:bg-blue-600 transition-colors"
                  icon={<User size={16} />}
                />
              </Dropdown>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  type="text" 
                  className="text-slate-300 hover:text-white"
                  onClick={() => setIsLoggedIn(true)}
                >
                  Sign In
                </Button>
                <Button 
                  type="primary" 
                  className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                  onClick={() => setIsLoggedIn(true)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;