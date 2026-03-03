import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type RefObject,
} from "react";
import { SearchBox } from "@mapbox/search-js-react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { Location } from "@/types/map";

interface SearchMarkersProps {
  locations: Location[];
  mapRef: RefObject<MapboxMap | null>;
  accessToken: string;
  onSelect: (location: Location) => void;
}

const MAX_SUGGESTIONS = 8;

export function SearchMarkers({
  locations,
  mapRef,
  accessToken,
  onSelect,
}: SearchMarkersProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim().length > 0
      ? locations
          .filter((loc) =>
            loc.label.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, MAX_SUGGESTIONS)
      : [];

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setIsOpen(value.trim().length > 0);
  }, []);

  const handleSelect = useCallback(
    (location: Location) => {
      const map = mapRef.current;
      if (!map) return;

      setQuery("");
      setIsOpen(false);

      const flyZoom = Math.max(map.getZoom(), 10);
      map.flyTo({ center: location.coordinates, zoom: flyZoom });

      // After fly completes, notify parent — parent will project pixel from final map position
      map.once("moveend", () => {
        onSelect(location);
      });
    },
    [mapRef, onSelect],
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 15,
        width: "280px",
        fontFamily: "sans-serif",
      }}
    >
      <SearchBox
        accessToken={accessToken}
        value={query}
        onChange={handleChange}
        placeholder="Search locations…"
        // Prevent Mapbox geocoding API calls — we handle suggestions locally
        interceptSearch={() => ""}
        theme={{
          variables: {
            colorBackground: "#2c3e50",
            colorBackgroundHover: "#34495e",
            colorText: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            borderRadius: "4px",
            border: "1px solid rgba(255,255,255,0.15)",
            colorPrimary: "#ffffff",
          },
          cssText: "mapbox-search-box input { color: #ffffff !important; }",
        }}
      />
      {isOpen && filtered.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            margin: 0,
            padding: "4px 0",
            listStyle: "none",
            background: "#2c3e50",
            borderRadius: "4px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.15)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {filtered.map((loc) => (
            <li key={loc.id}>
              <button
                onMouseDown={(e) => {
                  // Use mousedown to fire before the blur that closes the list
                  e.preventDefault();
                  handleSelect(loc);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "none";
                }}
              >
                {loc.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
