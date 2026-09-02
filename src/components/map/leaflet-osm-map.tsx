"use client";

import * as React from "react";
import L from "leaflet";

export interface MapVehicle {
  id: string;
  name: string;
  plate: string;
  type: string;
  status: "Running" | "Idle" | "Stopped" | "Inactive";
  speed: number;
  voltage: string;
  time: string;
  address: string;
  driver: string;
  lat: number;
  lng: number;
  heading?: number;
}

interface LeafletOsmMapProps {
  vehicles: MapVehicle[];
  selectedVehicle: MapVehicle | null;
  onSelectVehicle: (vehicle: MapVehicle) => void;
  zoomLevel: number;
  mapLayerType?: "osm" | "humanitarian" | "satellite";
}

// Sample GPS route trajectory between Western Region and Kampala/Entebbe (matching production)
const ROUTE_COORDINATES: [number, number][] = [
  [-0.6010, 30.6810],
  [-0.5841, 30.6521],
  [-0.2155, 30.8410],
  [-0.1983, 30.8251],
  [0.0512, 31.8541],
  [0.1812, 32.2541],
  [0.2212, 32.4210],
  [0.2985, 32.5350],
  [0.3152, 32.5810],
];

export function LeafletOsmMap({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  zoomLevel,
  mapLayerType = "satellite",
}: LeafletOsmMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<L.Map | null>(null);
  const markersRef = React.useRef<Record<string, L.Marker>>({});
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);
  const polylineRef = React.useRef<L.Polyline | null>(null);
  const destMarkerRef = React.useRef<L.Marker | null>(null);

  // Initialize Map with safe boundary bounds and minZoom to prevent blank gaps
  React.useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = selectedVehicle?.lat ?? 0.2985;
    const initialLng = selectedVehicle?.lng ?? 32.5350;

    const mapInstance = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: Math.max(zoomLevel, 8),
      minZoom: 4,
      maxZoom: 19,
      maxBounds: [
        [-85, -180],
        [85, 180],
      ],
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
    });

    // Default to Satellite / Hybrid (matching production) or OpenStreetMap
    const defaultUrl = mapLayerType === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : mapLayerType === "humanitarian"
      ? "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileLayer = L.tileLayer(defaultUrl, {
      maxZoom: 19,
      minZoom: 4,
      bounds: [
        [-85, -180],
        [85, 180],
      ],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    tileLayerRef.current = tileLayer;
    setMap(mapInstance);

    // Invalidate size on mount and window resize so map takes full width immediately
    const handleResize = () => {
      mapInstance.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => {
      mapInstance.invalidateSize();
    }, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
      mapInstance.remove();
      setMap(null);
    };
  }, []);

  // Update Tile Layer when layer type changes
  React.useEffect(() => {
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (mapLayerType === "humanitarian") {
      url = "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
    } else if (mapLayerType === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles &copy; Esri";
    }

    const newTileLayer = L.tileLayer(url, {
      maxZoom: 19,
      minZoom: 4,
      bounds: [
        [-85, -180],
        [85, 180],
      ],
      attribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [map, mapLayerType]);

  // Update Zoom Level safely
  React.useEffect(() => {
    if (!map) return;
    const clampedZoom = Math.max(4, Math.min(19, zoomLevel));
    if (map.getZoom() !== clampedZoom) {
      map.setZoom(clampedZoom);
    }
  }, [map, zoomLevel]);

  // Update Center and draw Route Polyline when selected vehicle changes
  React.useEffect(() => {
    if (!map || !selectedVehicle) return;

    map.panTo([selectedVehicle.lat, selectedVehicle.lng], {
      animate: true,
      duration: 0.8,
    });

    // Draw route polyline trajectory (bright cyan/blue matching production)
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    const routePoints: [number, number][] = [
      ...ROUTE_COORDINATES,
      [selectedVehicle.lat, selectedVehicle.lng]
    ];

    const polyline = L.polyline(routePoints, {
      color: "#0284c7",
      weight: 4,
      opacity: 0.9,
      smoothFactor: 1,
    }).addTo(map);

    polylineRef.current = polyline;

    // Add Destination Marker (Kampala green badge matching production)
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
    }

    const destHtml = `
      <div style="background-color: #65a30d; color: #ffffff; font-weight: bold; font-size: 11px; padding: 3px 8px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.5); display: flex; items-center; gap: 4px; white-space: nowrap;">
        <span>Kampala</span>
      </div>
    `;

    const destIcon = L.divIcon({
      className: "custom-dest-badge",
      html: destHtml,
      iconSize: [80, 26],
      iconAnchor: [40, 13],
    });

    const destMarker = L.marker([0.3152, 32.5810], { icon: destIcon, zIndexOffset: 500 }).addTo(map);
    destMarkerRef.current = destMarker;

  }, [map, selectedVehicle?.id, selectedVehicle?.lat, selectedVehicle?.lng]);

  // Render & Update Vehicle Markers with high visibility
  React.useEffect(() => {
    if (!map) return;

    vehicles.forEach((v) => {
      const isSelected = selectedVehicle?.id === v.id;
      const statusBg =
        v.status === "Running"
          ? "#16a34a"
          : v.status === "Idle"
          ? "#d97706"
          : v.status === "Inactive"
          ? "#0284c7"
          : "#dc2626";

      const pinBorder = isSelected 
        ? "border: 3px solid #2558c4; box-shadow: 0 0 16px rgba(37,88,196,0.9);" 
        : "border: 2px solid #334155; box-shadow: 0 4px 10px rgba(0,0,0,0.3);";

      const htmlContent = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 28px; height: 44px; background-color: #ffffff; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 2px; ${pinBorder}">
            <div style="width: 100%; height: 9px; background-color: #0f172a; border-radius: 2px;"></div>
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${statusBg}; ${
        v.status === "Running" ? "box-shadow: 0 0 8px #22c55e;" : ""
      }"></div>
            <div style="width: 100%; height: 4px; background-color: #cbd5e1; border-radius: 1px;"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-osm-vehicle-icon",
        html: htmlContent,
        iconSize: [28, 44],
        iconAnchor: [14, 44],
      });

      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng([v.lat, v.lng]);
        markersRef.current[v.id].setIcon(customIcon);
        markersRef.current[v.id].setZIndexOffset(isSelected ? 1000 : 100);
      } else {
        const marker = L.marker([v.lat, v.lng], { icon: customIcon, zIndexOffset: isSelected ? 1000 : 100 }).addTo(map);
        marker.on("click", () => {
          onSelectVehicle(v);
        });
        markersRef.current[v.id] = marker;
      }
    });
  }, [map, vehicles, selectedVehicle, onSelectVehicle]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Attribution */}
      <div className="absolute bottom-1 right-12 z-[1000] bg-white/90 dark:bg-card/90 text-[10px] px-2 py-0.5 rounded shadow border border-border text-muted-foreground pointer-events-auto">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-[#1a56db] hover:underline">OpenStreetMap</a> contributors
      </div>
    </div>
  );
}
