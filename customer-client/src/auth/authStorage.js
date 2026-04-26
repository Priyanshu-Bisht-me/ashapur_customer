const STORAGE_KEY = "aasapureCustomerSession";

export function saveSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getSession() {
  const value = localStorage.getItem(STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
