export const useApiTest = () => {
  const testApi = async (
    url: string,
    method: string,
    params: string,
    token?: string
  ) => {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: ["GET", "DELETE"].includes(method) ? undefined : params,
      });
      return await res.json();
    } catch (error) {
      return { error };
    }
  };

  return { testApi };
};
