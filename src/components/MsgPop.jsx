import { useRef, useEffect, useState } from "react";

export default function MsgPop({ onSend, onClose }) {
    const panelRef = useRef(null);
    const [msg, setMsg] = useState("Dzień dobry, jesteśmy zainteresowani ogłoszeniem. Można prosić o więcej szczegółów?");
    const [error, setError] = useState(null);

    const send = () => {
        if(!msg || msg.trim().length === 0){ setError("error"); return; }

        onSend(msg);
    };

    useEffect(() => {
      const onKey = (e) => e.key === "Escape" && onClose?.();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

  return (
    <div onClick={() => onClose?.()} className="fixed inset-0 z-999 flex items-center justify-center bg-black/60">
        <div ref={panelRef} className="w-full flex flex-col gap-3 items-center p-6 max-w-3xl min-h-96 bg-base-100 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <p className="text-2xl font-marker tracking-widest">Od czegos trzeba zaczac...</p>
            <textarea onChange={(e) => {setMsg(e.target.value); setError(null)}} value={msg} type="text" className={`textarea textarea-bordered w-full min-h-64 text-md tracking-wide resize-none ${error ? "border-red-500" : ""}`} />
            {error && (
                <p className="text-red-500 tracking-wide">Ale tak bez dzień dobry?</p>
            )}
            <button onClick={() => send()} className="btn btn-success w-full tracking-wider">Wyślij wiadomość</button>
        </div>
    </div>
  );
}