const STORAGE_KEY = "aasapure-session";
const SESSION_EVENT = "aasapure-session-change";

function emitSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emitSessionChange();
}

export function getSession() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function updateSessionUser(user) {
  const session = getSession();

  if (!session) {
    return;
  }

  saveSession({
    ...session,
    user
  });
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  emitSessionChange();
}

export function subscribeToSessionChange(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
