import React, { createContext, useContext, useCallback, useState, useRef } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children, position = "toast-end" }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", { duration = 3000, id = crypto.randomUUID() } = {}) => {
      const toast = { id, message, type };
      setToasts((prev) => [...prev, toast]);
      const t = setTimeout(() => removeToast(id), duration);
      timers.current.set(id, t);
      return id;
    },
    [removeToast]
  );

  const value = { showToast, removeToast };

  const typeClass = (type) =>
    type === "error"
      ? "alert-error"
      : type === "success"
      ? "alert-success"
      : type === "warning"
      ? "alert-warning"
      : "alert-info";

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast ${position} z-9999 cursor-pointer`}>
        {toasts.map((t) => (
          <div key={t.id} className={`alert ${typeClass(t.type)} shadow-lg`} onClick={() => removeToast(t.id)}>
            <span className="tracking-wide" >{t.message}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 float-right">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}