import React from 'react';


interface FooterProps {
  showNewsletter?: boolean;
}
import { Divider } from 'antd';
import { Plane, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC<FooterProps> = ({ showNewsletter = true }) => {
  const footerLinks = {
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Investor Relations', href: '#' }
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Booking Help', href: '#' },
      { label: 'Flight Status', href: '#' },
      { label: 'Cancellation Policy', href: '#' }
    ],
    services: [
      { label: 'Flights', href: '#' },
      { label: 'Travel Insurance', href: '#' },
      { label: 'Group Bookings', href: '#' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Accessibility', href: '#' },
      { label: 'Sitemap', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: <Facebook size={20} />, href: '#', label: 'Facebook' },
    { icon: <Twitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <Instagram size={20} />, href: '#', label: 'Instagram' },
    { icon: <Linkedin size={20} />, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg mr-3">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FlyJourney</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Your trusted partner for seamless travel experiences. Book flights to anywhere in the world with confidence and convenience.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-slate-400">
              <div className="flex items-center space-x-3">
                <Mail size={16} />
                <span>support@flyjourney.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} />
                <span>123 Sky Avenue, Cloud City, CC 12345</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Divider className="bg-slate-700 my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-400 mb-4 md:mb-0">
            <p>&copy; 2024 FlyJourney. All rights reserved.</p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        {showNewsletter && (
        <div className="mt-8 p-6 bg-slate-800/50 rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold text-white mb-2">Stay Updated</h3>
              <p className="text-slate-400">Get the latest deals and travel tips delivered to your inbox.</p>
            </div> 
            <div className="flex space-x-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
// Để ẩn phần Stay Updated, hãy truyền showNewsletter={false} khi dùng Footer ở các trang không phải trang chủ.