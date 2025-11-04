import { useEffect, useRef, useState } from "react";
import ActivityIndicator from "@/components/ActivityIndicator";

export default function LocationSearch({ value, onPick }) {
  const [q, setQ] = useState(value ?? "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!q?.trim()) { setResults([]); return; }
    setIsLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=8`,
          { signal: ctrl.signal, headers: { "Accept-Language": "pl,en" } }
        );
        const data = await res.json();
        setResults(
          (Array.isArray(data) ? data : []).map(d => ({
            id: d.place_id,
            label: d.display_name,
            lat: Number(d.lat),
            lon: Number(d.lon),
          }))
        );
        setOpen(true);
        setIsLoading(false);
      } catch {}
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [q]);

  return (
    <div className="relative w-full">
      <label className="input w-full bg-whitesmoke">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          placeholder="Wpisz nazwę miejscowości"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
        />
        {isLoading && (
            <div>
                <ActivityIndicator size="small"/>
            </div>
        )}
      </label>

      {open && results.length > 0 && (
        <ul
          className="absolute z-9999 mt-2 w-full max-h-72 overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow"
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.map(r => (
            <li key={r.id}>
              <button
                type="button"
                className="btn btn-ghost btn-sm justify-start w-full normal-case"
                onClick={() => {
                  setQ(r.label);
                  setOpen(false);
                  onPick?.({ label: r.label, lat: r.lat, lon: r.lon });
                }}
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}