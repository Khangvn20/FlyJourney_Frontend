import { useState } from "react";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    console.log("Mock login with:", { email, password });
    setToken("mock-token");
  };

  const logout = () => setToken(null);

  return { token, login, logout };
};
