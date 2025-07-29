import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { testDirectAPI, testCORS } from "../utils/apiDebug";
import type {
  RegisterRequest,
  ConfirmRegisterRequest,
  UpdateUserRequest,
} from "../shared/types/backend-api.types";

const ApiTestPanel: React.FC = () => {
  const {
    login,
    register,
    confirmRegister,
    updateProfile,
    logout,
    user,
    token,
    loading,
    error,
    isAuthenticated,
  } = useAuthContext();

  const [formData, setFormData] = useState({
    email: "devtest01@mailnesia.com",
    password: "abcd1234",
    name: "Ken Tran",
    phone: "0936912309",
    otp: "156134",
  });

  const [result, setResult] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const testRegister = async () => {
    const registerData: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
    };

    const response = await register(registerData);
    setResult(JSON.stringify(response, null, 2));
  };

  const testConfirmRegister = async () => {
    const confirmData: ConfirmRegisterRequest = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      otp: formData.otp,
    };

    const response = await confirmRegister(confirmData);
    setResult(JSON.stringify(response, null, 2));
  };

  const testLogin = async () => {
    const response = await login(formData.email, formData.password);
    setResult(JSON.stringify(response, null, 2));
  };

  const testUpdateProfile = async () => {
    const updateData: UpdateUserRequest = {
      name: formData.name,
      phone: formData.phone,
    };

    const response = await updateProfile(updateData);
    setResult(JSON.stringify(response, null, 2));
  };

  const testLogout = async () => {
    await logout();
    setResult("Logged out successfully");
  };

  const testDirectLogin = async () => {
    try {
      const response = await testDirectAPI();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Direct API Error: ${error}`);
    }
  };

  const testCORSPreflight = async () => {
    try {
      const status = await testCORS();
      setResult(`CORS Preflight Status: ${status}`);
    } catch (error) {
      setResult(`CORS Error: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">API Test Panel</h2>

      {/* Auth Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Auth Status:</h3>
        <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
        <p>Loading: {loading ? "Yes" : "No"}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
        {user && (
          <div className="mt-2">
            <p>
              User: {user.name} ({user.email})
            </p>
            {user.phone && <p>Phone: {user.phone}</p>}
          </div>
        )}
        {token && (
          <p className="text-xs text-gray-500 mt-2">
            Token: {token.substring(0, 20)}...
          </p>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">OTP:</label>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* API Test Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <button
          onClick={testRegister}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          1. Register
        </button>
        <button
          onClick={testConfirmRegister}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
          2. Confirm Register
        </button>
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50">
          3. Login
        </button>
        <button
          onClick={testUpdateProfile}
          disabled={loading || !isAuthenticated}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50">
          4. Update Profile
        </button>
        <button
          onClick={testLogout}
          disabled={loading || !isAuthenticated}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50">
          5. Logout
        </button>
      </div>

      {/* Debug Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={testDirectLogin}
          disabled={loading}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50">
          🔍 Debug: Direct Login API
        </button>
        <button
          onClick={testCORSPreflight}
          disabled={loading}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50">
          🔍 Debug: Test CORS
        </button>
      </div>

      {/* Result Display */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">API Response:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
          {result || "No response yet..."}
        </pre>
      </div>
    </div>
  );
};

export default ApiTestPanel;
