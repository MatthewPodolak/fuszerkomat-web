import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

export default function MapPin(props) {
  const { lat = 52.2297, lng = 21.0122, zoom = 16, minZoom = 3, maxZoom = 19 } = props;
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [placeName, setPlaceName] = useState("Ładowanie...");

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [lat, lng],
        zoom,
        minZoom,
        maxZoom,
        dragging: false,
        scrollWheelZoom: "center",
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      setTimeout(() => mapInstanceRef.current && mapInstanceRef.current.invalidateSize(), 0);
    }

    const map = mapInstanceRef.current;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    markerRef.current = L.marker([lat, lng]).addTo(map);

    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: { Accept: "application/json", "User-Agent": "LeafletMapPinDemo/1.0" },
        signal: controller.signal,
      }
    )
      .then((r) => r.json())
      .then((data) => {
        const name = data && (data.name || data.display_name)
          ? data.name || data.display_name
          : "Unknown place";
        setPlaceName(name);
        if (markerRef.current) markerRef.current.bindPopup(name).openPopup();
      })
      .catch(() => {
        setPlaceName("Unknown place");
        if (markerRef.current) markerRef.current.bindPopup("Unknown place").openPopup();
      });

    const keepCenter = () => map.setView([lat, lng], map.getZoom(), { animate: false });
    map.setView([lat, lng], zoom, { animate: false });
    map.on("zoomend", keepCenter);

    return () => {
      controller.abort();
      map.off("zoomend", keepCenter);
    };
  }, [lat, lng, zoom, minZoom, maxZoom]);

  return (
    <div className="w-full flex">
      <div className="flex-1">
        <div ref={mapRef} className="w-full h-80 rounded-xl overflow-hidden" />
      </div>
    </div>
  );
}