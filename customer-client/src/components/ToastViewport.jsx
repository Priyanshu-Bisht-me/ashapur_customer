import { useEffect, useState } from "react";
import { subscribeToToasts } from "../utils/toastBus";

function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToToasts((toast) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, ...toast }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 2800);
    });
  }, []);

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type || "success"}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
