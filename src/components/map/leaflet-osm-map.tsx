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

export function LeafletOsmMap({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  zoomLevel,
  mapLayerType = "osm",
}: LeafletOsmMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<L.Map | null>(null);
  const markersRef = React.useRef<Record<string, L.Marker>>({});
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);

  // Initialize Map
  React.useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = selectedVehicle?.lat ?? 0.2985;
    const initialLng = selectedVehicle?.lng ?? 32.5350;

    const mapInstance = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: zoomLevel,
      zoomControl: false,
      attributionControl: false,
    });

    // Default OpenStreetMap Tile Layer
    const tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
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
      attribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [map, mapLayerType]);

  // Update Zoom Level
  React.useEffect(() => {
    if (!map) return;
    if (map.getZoom() !== zoomLevel) {
      map.setZoom(zoomLevel);
    }
  }, [map, zoomLevel]);

  // Update Center when selected vehicle changes
  React.useEffect(() => {
    if (!map || !selectedVehicle) return;

    map.panTo([selectedVehicle.lat, selectedVehicle.lng], {
      animate: true,
      duration: 0.8,
    });
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
          </div>
          <div style="margin-top: 3px; background-color: ${statusBg}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap; border: 1px solid rgba(255,255,255,0.4);">
            ${v.name} - ${v.speed} km/h
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-osm-vehicle-icon",
        html: htmlContent,
        iconSize: [140, 75],
        iconAnchor: [70, 75],
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
