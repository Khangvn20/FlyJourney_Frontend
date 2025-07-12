import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../context/AuthProvider';
import { LoginCredentials } from '../types';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onClose }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await login(values); // This updates user state in context
      onSuccess?.();
      onClose();
      // Header will automatically re-render to show user menu
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Đăng Nhập</h2>
      
      <Form
        onFinish={onFinish}
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <Input 
            prefix={<Mail className="text-gray-400" size={18} />}
            size="large"
            placeholder="Nhập email của bạn"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
          ]}
        >
          <Input.Password
            prefix={<Lock className="text-gray-400" size={18} />}
            size="large"
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>

        <Form.Item className="mb-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            size="large"
          >
            Đăng Nhập
          </Button>
        </Form.Item>

        {error && <Alert message={error} type="error" />}

        <div className="text-right">
          <a className="text-blue-500 hover:text-blue-600">
            Quên mật khẩu?
          </a>
        </div>
      </Form>
    </div>
  );
};
