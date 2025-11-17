import { useEffect, useState } from "react";

export default function ViewportGuard({ minWidth = 1024, children }) {
  const [tooSmall, setTooSmall] = useState(false);

  useEffect(() => {
    function check() {
      setTooSmall(window.innerWidth < minWidth);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [minWidth]);

  if (tooSmall) {
    return (
      <div className="w-screen h-screen absolute bg-primary flex flex-col gap-3 items-center justify-center px-3">
        <p className="text-[128px] font-marker text-accent tracking-wide rotate-90">:C</p>
        <p className="text-lg font-marker text-accent tracking-[0.4rem] text-center">Small screens aren’t supported. It wasn’t worth it, and I didn’t have time for that.</p>
      </div>
    );
  }

  return children;
}