import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Button, Alert } from 'antd';
import { Mail, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService'; 
interface OtpVerificationProps {
  email: string;
  name: string;
  password: string;
  onSuccess?: () => void;
  onBack: () => void;
  onClose: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  email,
  name,
  password,
  onSuccess,
  onBack,
  onClose
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOtp({
        name,
        email,
        otp: otpValue,
        password
      });
      console.log('OTP verify response:', response);
      // On success
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError(null);

    try {
      // TODO: Implement API call to resend OTP
      console.log('Resending OTP to:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset OTP inputs
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
      
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Xác Minh Email</h2>
        <p className="text-gray-600">
          Chúng tôi đã gửi mã xác minh 6 số đến
        </p>
        <p className="text-blue-600 font-semibold">{email}</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-center space-x-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              value={digit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={1}
            />
          ))}
        </div>

        {error && <Alert message={error} type="error" className="mb-4" />}

        <Button
          type="primary"
          loading={loading}
          onClick={handleVerify}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 mb-4"
          size="large"
        >
          Xác Minh
        </Button>

        <div className="flex justify-center items-center space-x-4">
          <Button
            type="text"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Quay lại
          </Button>
          
          <Button
            type="text"
            loading={resendLoading}
            onClick={handleResendOtp}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-blue-500 hover:text-blue-700"
          >
            Gửi lại mã
          </Button>
        </div>
      </div>
    </div>
  );
};
