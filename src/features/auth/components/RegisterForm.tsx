import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { User, Mail, Lock } from 'lucide-react';
import { authService } from '../services/authService';
interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface RegisterFormProps {
  onSuccess?: (email: string, name: string, password: string) => void;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSuccess, 
  onClose, 
  onSwitchToLogin 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: RegisterCredentials) => {
  setLoading(true);
  setError(null);

  try {
    const res = await authService.register(values);
    // Truyền đủ email, username, password
    onSuccess?.(values.email, values.username, values.password);
  } catch (err: any) {
    setError(err.message || 'Đăng ký thất bại');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Đăng Ký Tài Khoản</h2>
      
      <Form
        onFinish={onFinish}
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          name="username"
          label="Tên người dùng"
          rules={[
            { required: true, message: 'Vui lòng nhập tên người dùng' },
            { min: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự' }
          ]}
        >
          <Input 
            prefix={<User className="text-gray-400" size={18} />}
            size="large"
            placeholder="Nhập tên người dùng"
          />
        </Form.Item>

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

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<Lock className="text-gray-400" size={18} />}
            size="large"
            placeholder="Nhập lại mật khẩu"
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
            Đăng Ký
          </Button>
        </Form.Item>

        {error && <Alert message={error} type="error" />}

        <div className="text-center mt-4">
          <span className="text-gray-400">Đã có tài khoản? </span>
          <a 
            className="text-blue-500 hover:text-blue-600 cursor-pointer"
            onClick={onSwitchToLogin}
          >
            Đăng nhập ngay
          </a>
        </div>
      </Form>
    </div>
  );
};
