import React, { useEffect } from "react";
import { useToast } from "@/context/ToastContext.jsx";

const ERROR_MSG = "Upss... Coś poszło nie tak";
const OFFLINE_MSG = "Brak połączenia z internetem.";

export default function GlobalErrorCatcher({ children }) {
  const { showToast } = useToast();

  function shouldIgnore(raw) {
    const msg = String(raw || "").toLowerCase();

    if (msg.includes("aborterror")) return true; 
    if (msg.includes("timeout")) return true;
    if (msg.includes("canceled")) return true;
    if (msg.includes("resizeobserver")) return true;
    return false;
  }

  function maybeToast(raw) {
    if (navigator && navigator.onLine === false) {
      showToast(OFFLINE_MSG, "error");
      return;
    }

    if (shouldIgnore(raw)) return;

    showToast(ERROR_MSG, "error");
  }

  useEffect(() => {
    const onError = (e) => {
      const raw = e?.error?.message || e?.message || "";
      maybeToast(raw);
    };

    const onRejection = (e) => {
      const reason = e?.reason;
      const raw = (reason && (reason.message || reason.toString?.())) || "";
      maybeToast(raw);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [showToast]);

  return children;
}