import { useEffect, useState } from "react";
import ActivityIndicator from "@/components/ActivityIndicator";

export default function Loading() {
  const [size, setSize] = useState("medium");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setSize(mq.matches ? "large" : "medium");

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary">
      <ActivityIndicator size={size} />
    </div>
  );
}
