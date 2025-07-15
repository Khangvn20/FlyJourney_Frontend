import { UserInfo } from '../types';

export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const res = await response.json();
    if (!response.ok || !res.status) throw new Error(res.errorMessage || 'Không lấy được thông tin người dùng');
    const data = res.data || {};
    return {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
    };
  } catch (err) {
    console.error('Lỗi lấy thông tin user:', err);
    return null;
  }
}

export async function updateUserInfo(data: { name: string; email: string; phone: string }): Promise<{ status: boolean; errorMessage?: string }> {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) return { status: false, errorMessage: 'Chưa đăng nhập' };
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/users/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const res = await response.json();
    if (!response.ok || !res.status) {
      return { status: false, errorMessage: res.errorMessage || 'Cập nhật thất bại' };
    }
    return { status: true };
  } catch (err) {
    console.error('Lỗi cập nhật thông tin user:', err);
    return { status: false, errorMessage: 'Lỗi hệ thống' };
  }
}
