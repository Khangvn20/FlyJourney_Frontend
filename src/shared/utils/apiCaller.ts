export const apiCaller = async (
  url: string,
  method: string,
  body?: unknown,
  token?: string
) => {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};
