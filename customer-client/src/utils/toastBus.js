const TOAST_EVENT = "aasapure-toast";

export function pushToast(payload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: payload
    })
  );
}

export function subscribeToToasts(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event) => callback(event.detail);
  window.addEventListener(TOAST_EVENT, listener);

  return () => window.removeEventListener(TOAST_EVENT, listener);
}
