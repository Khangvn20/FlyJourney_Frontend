export const authService = async (email: string, password: string) => {
  console.log("Mock auth with:", { email, password });
  return { token: "mocked-token" };
};
