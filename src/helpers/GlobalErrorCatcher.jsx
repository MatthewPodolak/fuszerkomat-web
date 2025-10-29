import React, { useEffect } from "react";
import { useToast } from "@/context/ToastContext.jsx";

const ERROR_MSG = "Upss... Coś poszło nie tak";
const OFFLINE_MSG = "Brak połączenia z internetem.";
const CONNECT_FAIL_MSG = "Nie możemy nawiązać połączenia z serwerem.";

export default function GlobalErrorCatcher({ children }) {
  const { showToast } = useToast();

  function isNetworkLikeError(raw) {
    const msg = String(raw || "").toLowerCase();
    return (
      msg.includes("networkerror") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed") ||
      msg.includes("the network connection was lost") ||
      msg.includes("cors") ||
      msg.includes("typeerror")
    );
  }

  function shouldIgnore(raw) {
    const msg = String(raw || "").toLowerCase();

    if (msg.includes("aborterror")) return true; 
    if (msg.includes("timeout")) return true;
    if (msg.includes("canceled")) return true;
    if (msg.includes("resizeobserver")) return true;
    return false;
  }

  function maybeToast(raw) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      showToast(OFFLINE_MSG, "error");
      return;
    }
    if (isNetworkLikeError(raw)) {
      showToast(CONNECT_FAIL_MSG, "error");
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

    const onOffline = () => showToast(OFFLINE_MSG, "error");
    const onOnline = () => showToast("Połączenie z internetem przywrócone.", "info");

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [showToast]);

  return children;
}