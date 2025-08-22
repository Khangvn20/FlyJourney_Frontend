import React, { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Calendar,
  Plane,
  ChevronRight,
  RefreshCw,
  Lock,
  Edit3,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { shouldShowDevControls } from "../../shared/config/devConfig";
import {
  validatePassword,
  validateName,
  validatePhone,
  getPasswordStrength,
} from "../../shared/utils/userMenuValidation";
import type { BackendUserProfile } from "../../shared/types/backend-api.types";

/**
 * Enhanced UserMenu Component
 *
 * Features:
 * - Separate OTP send button with 5-minute timeout
 * - Password strength validation and visual indicator
 * - Vietnamese name validation (bad words filter)
 * - Vietnamese phone number validation
 * - Persistent state when menu closes (preserve "where they left off")
 * - Dev bypass mode for testing
 *
 * Token Info:
 * - User token: Valid for 24 hours after login
 * - OTP codes: Valid for 5 minutes after being sent
 */

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<BackendUserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Reset Password Form State
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    message: "",
  });
  const [resetApiCalled, setResetApiCalled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Update Account Form State
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [nameValidation, setNameValidation] = useState({
    isValid: true,
    message: "",
  });
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: true,
    message: "",
  });

  // Load user profile when menu opens
  useEffect(() => {
    if (isOpen && !userProfile) {
      loadUserProfile();
    }
  }, [isOpen, userProfile]);

  // Preserve state when menu closes (don't reset forms)
  useEffect(() => {
    if (!isOpen) {
      // Don't reset form states - preserve "where they left off"
      // Only stop timers to avoid memory leaks
    }
  }, [isOpen]);

  // Countdown timer for reset password timeout
  useEffect(() => {
    let interval: number | null = null;

    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setResetApiCalled(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      console.log("📋 Loading user profile from API...");
      const response = await authService.getUserProfile();

      if (response.status && response.data) {
        setUserProfile(response.data);
        console.log("✅ User profile loaded:", response.data);
      } else {
        console.error("❌ Failed to load profile:", response.errorMessage);
      }
    } catch (error) {
      console.error("❌ Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  const handleSendResetOTP = async () => {
    try {
      const email = user?.email || "";
      console.log("🔄 Sending reset password OTP to:", email);
      await authService.resetPassword(email);
      console.log("✅ OTP sent successfully");

      // Set timeout state
      setResetApiCalled(true);
      setTimeRemaining(300); // 5 minutes = 300 seconds
    } catch (error) {
      console.error("❌ Reset password error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">
              {userProfile?.name || user?.name || "Loading..."}
            </div>
            <div className="text-sm text-gray-500">
              {userProfile?.email || user?.email || "Loading..."}
            </div>
            {(userProfile?.phone || user?.phone) && (
              <div className="text-sm text-gray-500">
                📱 {userProfile?.phone || user?.phone}
              </div>
            )}
            {userProfile && shouldShowDevControls() && (
              <div className="text-xs text-gray-400 mt-1">
                ID: {userProfile.user_id} • {userProfile.roles || "User"}
              </div>
            )}
          </div>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
      </div>

      {/* Menu Actions */}
      <div className="py-2">
        {/* New Booking Flow */}
        <Link
          to="/search"
          onClick={onClose}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors">
          <Plane className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">Đặt Vé Mới</span>
        </Link>
        {/* My Bookings (paid / confirmed) */}
        <Link
          to="/my-bookings"
          onClick={onClose}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">Đặt Chỗ Của Tôi</span>
        </Link>

        {/* Settings Forms */}
        <div className="space-y-1">
          {/* Reset Password Form */}
          <div className="px-4">
            <button
              onClick={() => {
                setShowResetForm(!showResetForm);
                // Don't auto-call API - let user decide when to send OTP
              }}
              className="w-full py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors text-sm">
              <Lock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 flex-1">Đặt Lại Mật Khẩu</span>
              <ChevronRight
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  showResetForm ? "rotate-90" : ""
                }`}
              />
            </button>

            {showResetForm && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                {!resetApiCalled ? (
                  // Step 1: Send OTP
                  <>
                    <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                      📧 Sẽ gửi OTP đến email: {user?.email}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleSendResetOTP}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                        <span>📤</span>
                        <span>Gửi Mã OTP</span>
                      </button>
                      <button
                        onClick={() => setShowResetForm(false)}
                        className="px-3 py-2 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  // Step 2: Enter OTP and new password
                  <>
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center justify-between">
                      <span>✅ OTP đã được gửi đến: {user?.email}</span>
                      {timeRemaining > 0 && (
                        <span className="text-xs text-orange-600">
                          Gửi lại sau: {Math.floor(timeRemaining / 60)}:
                          {(timeRemaining % 60).toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {timeRemaining === 0 && (
                      <button
                        onClick={handleSendResetOTP}
                        className="w-full px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 transition-colors">
                        🔄 Gửi Lại OTP
                      </button>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        OTP (5 phút hiệu lực)
                      </label>
                      <input
                        type="text"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Nhập mã OTP"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            const password = e.target.value;
                            setNewPassword(password);
                            const validation = validatePassword(password);
                            setPasswordValidation(validation);
                          }}
                          className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                            newPassword && !passwordValidation.isValid
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500"
                          }`}
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Password strength indicator */}
                      {newPassword && (
                        <div className="mt-1">
                          {passwordValidation.isValid ? (
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>{passwordValidation.message}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>{passwordValidation.message}</span>
                            </div>
                          )}
                          <div className="mt-1">
                            {(() => {
                              const strength = getPasswordStrength(newPassword);
                              return (
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                                    <div
                                      className={`h-1 rounded-full transition-all ${
                                        strength.score >= 4
                                          ? "bg-green-500"
                                          : strength.score >= 3
                                          ? "bg-blue-500"
                                          : strength.score >= 2
                                          ? "bg-yellow-500"
                                          : strength.score >= 1
                                          ? "bg-orange-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${(strength.score / 5) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <span className={`text-xs ${strength.color}`}>
                                    {strength.label}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          // Validate password before submitting
                          const validation = validatePassword(newPassword);
                          if (!validation.isValid) {
                            console.error(
                              "❌ Password validation failed:",
                              validation.message
                            );
                            return;
                          }

                          try {
                            console.log("🔄 Confirming password reset...");
                            await authService.confirmResetPassword({
                              email: user?.email || "",
                              new_password: newPassword,
                              otp: resetOtp,
                            });
                            console.log("✅ Password reset successfully");

                            // Reset all states after successful reset
                            setShowResetForm(false);
                            setResetOtp("");
                            setNewPassword("");
                            setPasswordValidation({
                              isValid: false,
                              message: "",
                            });
                            setResetApiCalled(false);
                            setTimeRemaining(0);
                          } catch (error) {
                            console.error(
                              "❌ Confirm reset password error:",
                              error
                            );
                          }
                        }}
                        disabled={
                          !passwordValidation.isValid || !resetOtp.trim()
                        }
                        className={`flex-1 px-3 py-2 text-white text-xs rounded-md transition-colors flex items-center justify-center space-x-1 ${
                          passwordValidation.isValid && resetOtp.trim()
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}>
                        <Save className="h-3 w-3" />
                        <span>Xác Nhận Đổi Mật Khẩu</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowResetForm(false);
                          // Don't reset other states - preserve for better UX
                        }}
                        className="px-3 py-2 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Update Account Form */}
          <div className="px-4">
            <button
              onClick={() => {
                setShowUpdateForm(!showUpdateForm);
                if (!showUpdateForm) {
                  setUpdateName(userProfile?.name || user?.name || "");
                  setUpdatePhone(userProfile?.phone || user?.phone || "");
                  // Reset validations
                  setNameValidation({ isValid: true, message: "" });
                  setPhoneValidation({ isValid: true, message: "" });
                }
              }}
              className="w-full py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors text-sm">
              <Edit3 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 flex-1">Cập Nhật Tài Khoản</span>
              <ChevronRight
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  showUpdateForm ? "rotate-90" : ""
                }`}
              />
            </button>

            {showUpdateForm && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={updateName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setUpdateName(name);
                      const validation = validateName(name);
                      setNameValidation(validation);
                    }}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      updateName && !nameValidation.isValid
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Nhập họ tên"
                  />
                  {updateName && !nameValidation.isValid && (
                    <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{nameValidation.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={updatePhone}
                    onChange={(e) => {
                      const phone = e.target.value;
                      setUpdatePhone(phone);
                      const validation = validatePhone(phone);
                      setPhoneValidation(validation);
                    }}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                      updatePhone && !phoneValidation.isValid
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Nhập số điện thoại (VD: 0912345678)"
                  />
                  {updatePhone && !phoneValidation.isValid && (
                    <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{phoneValidation.message}</span>
                    </div>
                  )}
                </div>

                {shouldShowDevControls() && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    🔧 Dev Mode: Validation bypassed for testing
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      // Validate all fields before submitting
                      const nameVal = validateName(updateName);
                      const phoneVal = validatePhone(updatePhone);

                      if (!nameVal.isValid || !phoneVal.isValid) {
                        console.error("❌ Validation failed", {
                          nameVal,
                          phoneVal,
                        });
                        return;
                      }

                      try {
                        console.log("✏️ Updating profile...");
                        const response = await authService.updateUserProfile({
                          name: updateName,
                          phone: updatePhone,
                        });
                        console.log("✅ Profile updated:", response);
                        setShowUpdateForm(false);
                        loadUserProfile(); // Reload profile
                      } catch (error) {
                        console.error("❌ Update profile error:", error);
                      }
                    }}
                    disabled={
                      !nameValidation.isValid || !phoneValidation.isValid
                    }
                    className={`flex-1 px-3 py-2 text-white text-xs rounded-md transition-colors flex items-center justify-center space-x-1 ${
                      nameValidation.isValid && phoneValidation.isValid
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}>
                    <Save className="h-3 w-3" />
                    <span>Lưu Thay Đổi</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateForm(false);
                      // Don't reset field values - preserve for better UX
                    }}
                    className="px-3 py-2 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reload User Info */}
        <button
          onClick={() => {
            loadUserProfile();
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors">
          <RefreshCw
            className={`h-4 w-4 text-gray-400 ${loading ? "animate-spin" : ""}`}
          />
          <span className="text-gray-700">Tải Lại Thông Tin</span>
          {loading && (
            <span className="text-xs text-blue-600">Đang tải...</span>
          )}
        </button>

        <hr className="my-2 border-gray-100" />

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors text-red-600">
          <LogOut className="h-4 w-4" />
          <span>Đăng Xuất</span>
        </button>
      </div>

      {/* API Test Section (Development Controls) */}
      {shouldShowDevControls() && (
        <>
          <hr className="border-gray-100" />
          <div className="p-4 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Dev Tools (Token: 24h | OTP: 5min)
            </div>
            <div className="space-y-1">
              <button
                onClick={async () => {
                  try {
                    console.log("🔄 Testing Reset Password API");
                    const email = user?.email || "test@example.com";
                    const response = await authService.resetPassword(email);
                    console.log("✅ Reset Password Response:", response);
                  } catch (error) {
                    console.error("❌ Reset Password Error:", error);
                  }
                }}
                className="w-full text-xs text-left px-2 py-1 rounded hover:bg-white transition-colors text-gray-600">
                Test Reset Password
              </button>
              <button
                onClick={() => {
                  console.log("👤 Testing Get Profile API");
                  loadUserProfile();
                }}
                className="w-full text-xs text-left px-2 py-1 rounded hover:bg-white transition-colors text-gray-600">
                Test Get Profile
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log("✏️ Testing Update Profile API");
                    const updateData = {
                      name: user?.name + " (Updated)",
                      phone: user?.phone || "0123456789",
                    };
                    const response = await authService.updateUserProfile(
                      updateData
                    );
                    console.log("✅ Update Profile Response:", response);
                    // Reload profile after update
                    loadUserProfile();
                  } catch (error) {
                    console.error("❌ Update Profile Error:", error);
                  }
                }}
                className="w-full text-xs text-left px-2 py-1 rounded hover:bg-white transition-colors text-gray-600">
                Test Update Profile
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
