import type React from "react";
import type { AuthTab } from "../shared/types";

interface TabNavigationProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  disabled?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  disabled = false,
}) => {
  return (
    <div className="relative flex rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 p-2 mb-8 shadow-inner border border-slate-200/50">
      <div
        className={`absolute top-2 bottom-2 bg-white rounded-xl shadow-lg transition-all duration-500 ease-out ${
          activeTab === "register"
            ? "left-2 right-1/2 mr-1"
            : "left-1/2 right-2 ml-1"
        }`}
      />

      <button
        type="button"
        onClick={() => onTabChange("register")}
        disabled={disabled}
        className={`relative flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${
          activeTab === "register"
            ? "text-blue-700 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:scale-[1.02]"
        }`}>
        <span className="relative flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Đăng Ký
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("login")}
        disabled={disabled}
        className={`relative flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${
          activeTab === "login"
            ? "text-blue-700 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:scale-[1.02]"
        }`}>
        <span className="relative flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Đăng Nhập
        </span>
      </button>
    </div>
  );
};

export default TabNavigation;
