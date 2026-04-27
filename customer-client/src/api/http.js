import { clearSession, getSession } from "../auth/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function request(path, options = {}) {
  const session = getSession();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 && session?.token) {
      clearSession();
    }

    throw new Error(payload?.message || "Something went wrong");
  }

  return payload;
}

export { API_BASE_URL };
