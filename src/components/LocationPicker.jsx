import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const FALLBACK = [52.2297, 21.0122];
function toNumMaybe(v) {
  if (v === null || v === undefined || v === "") return NaN;
  const n = typeof v === "string" ? Number(v.trim()) : Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function sanitize(lat, lng, fallback = FALLBACK) {
  const nlat = toNumMaybe(lat), nlng = toNumMaybe(lng);
  return (Number.isFinite(nlat) && Math.abs(nlat) <= 90 &&
          Number.isFinite(nlng) && Math.abs(nlng) <= 180)
    ? [nlat, nlng]
    : fallback;
}

function MapClickSetter({ onClickAt }) {
  useMapEvent("click", (e) => onClickAt([e.latlng.lat, e.latlng.lng], e));
  return null;
}

export default function LocationPicker({ nameLat = "lat", nameLng = "lng", initial = { lat: 52.2297, lng: 21.0122 }, zoom = 13, onPick }) {
  const initialPos = useMemo(() => sanitize(initial?.lat, initial?.lng), [initial?.lat, initial?.lng]);
  const [markerPos, setMarkerPos] = useState(initialPos);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("idle");
  const abortRef = useRef(null);

  const fetchAddress = useMemo(() => {
    return async (lat, lon) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        setStatus("loading");
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          { signal: ctrl.signal, headers: { "Accept-Language": "pl,en", "Referer": location.origin } }
        );
        const d = await r.json();
        setAddress(d?.display_name || "");
        setStatus("ok");
      } catch (e) {
        if (e.name !== "AbortError") setStatus("error");
      }
    };
  }, []);

  const handleMapClick = (latlng) => {
    const [lat, lng] = sanitize(latlng[0], latlng[1]);
    setMarkerPos([lat, lng]);
    fetchAddress(lat, lng);
    onPick?.(lat, lng);
  };

  return (
    <div className="w-full max-w-5xl h-96">
      <input type="hidden" name={nameLat} value={markerPos[0]} readOnly />
      <input type="hidden" name={nameLng} value={markerPos[1]} readOnly />

      <div className="relative h-full overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={initialPos} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickSetter onClickAt={handleMapClick} />
          <Marker position={markerPos}>
            <Popup>
              {address || "Kliknij na mapie, aby ustawić znacznik"}
              <br />
              [{markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}]
            </Popup>
          </Marker>
        </MapContainer>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-slate-900 drop-shadow-[0_0_2px_#fff]">+</div>

        <div className="absolute inset-x-3 bottom-3 z-999 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm">
          <div className="truncate" title={address || ""}>
            {status === "loading" && "Ładowanie adresu…"}
            {status === "error" && (address ? address : "Nie udało się pobrać adresu")}
            {status !== "loading" && status !== "error" && (address || "Kliknij na mapie, aby wybrać miejsce")}
          </div>
          <div className="font-mono">
            {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
}