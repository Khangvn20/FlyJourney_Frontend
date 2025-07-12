import { LoginCredentials, RegisterCredentials, AuthResponse, OtpVerificationRequest } from '../types';

class AuthService {
  private API_URL = import.meta.env.VITE_API_URL || '';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('AuthService login - API_URL:', this.API_URL);
      console.log('AuthService login - credentials:', credentials);
      
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      console.log('AuthService login - response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      console.log('AuthService login - response data:', data);
      
      // Transform backend response to match our AuthResponse type
      if (data.status && data.data) {
        const authResponse: AuthResponse = {
          user: {
            id: data.data.user_id.toString(),
            email: data.data.email,
            name: data.data.name
          },
          token: data.data.token
        };
        console.log('AuthService login - transformed response:', authResponse);
        return authResponse;
      } else {
        throw new Error(data.errorMessage || 'Login failed');
      }
    } catch (error) {
      console.error('AuthService login - error:', error);
      throw new Error('Login failed');
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> {
  try {

    const payload = {
      name: credentials.username, 
      email: credentials.email,
      password: credentials.password
    };
    console.log('AuthService register - payload:', payload);
    console.log('AuthService register - API_URL:', this.API_URL);

    const response = await fetch(`${this.API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
}   );

    console.log('AuthService register - response status:', response.status);

    const data = await response.json();
    console.log('AuthService register - response data:', data);

    if (!response.ok) {
      throw new Error(data.errorMessage || 'Registration failed');
    }

    return {
      success: data.status || false,
      message: data.errorMessage || 'OTP đã được gửi đến email của bạn'
    };
  } catch (error) {
    console.error('AuthService register - error:', error);
    throw new Error('Registration failed');
  }
}

  async verifyOtp(request: OtpVerificationRequest): Promise<AuthResponse> {
  try {
    // Đảm bảo truyền đúng key cho backend
    const payload = {
      Name: request.name,
      email: request.email,
      otp: request.otp,
      password: request.password
    };
    console.log('AuthService verifyOtp - payload:', payload);

    const response = await fetch(`${this.API_URL}/auth/confirm-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('AuthService verifyOtp - response status:', response.status);

    const data = await response.json();
    console.log('AuthService verifyOtp - response data:', data);

    if (!response.ok) {
      throw new Error(data.errorMessage || 'OTP verification failed');
    }

    // Chuẩn hóa dữ liệu trả về giống login
    if (data.status && data.data) {
      const authResponse: AuthResponse = {
        user: {
          id: data.data.user_id?.toString() || '',
          email: data.data.email,
          name: data.data.name
        },
        token: data.data.token
      };
      return authResponse;
    } else {
      throw new Error(data.errorMessage || 'OTP verification failed');
    }
  } catch (error) {
    console.error('AuthService verifyOtp - error:', error);
    throw new Error('OTP verification failed');
  }
}

  async resendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('AuthService resendOtp - email:', email);
      
      const response = await fetch(`${this.API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      console.log('AuthService resendOtp - response status:', response.status);
      
      const data = await response.json();
      console.log('AuthService resendOtp - response data:', data);
      
      if (!response.ok) {
        throw new Error(data.errorMessage || 'Failed to resend OTP');
      }
      
      return {
        success: data.status || false,
        message: data.errorMessage || 'OTP sent successfully'
      };
    } catch (error) {
      console.error('AuthService resendOtp - error:', error);
      throw new Error('Failed to resend OTP');
    }
  }
  async logout(): Promise<void> {
    try {
      const token = sessionStorage.getItem('token');
      
      if (token) {
        console.log('AuthService logout - calling API');
        const response = await fetch(`${this.API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        console.log('AuthService logout - response status:', response.status);
        
        if (!response.ok) {
          console.warn('Logout API call failed, but continuing with local logout');
        }
      }
      
      // Always clear local storage regardless of API response
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      console.log('AuthService logout - local storage cleared');
    } catch (error) {
      console.error('AuthService logout - error:', error);
      // Still clear local storage even if API call fails
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }
}

export const authService = new AuthService();
