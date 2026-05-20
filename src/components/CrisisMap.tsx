import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crisis, Resource, TrafficPoint } from "../../server/types";

// Fix Leaflet marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ResourceIcon = (type: string, status: string) => L.divIcon({
  html: `
    <div class="relative">
      ${status === 'DEPLOYED' ? '<div class="absolute -inset-2 bg-blue-400 opacity-20 rounded-full animate-ping"></div>' : ''}
      <div class="w-4 h-4 rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] ${status === 'DEPLOYED' ? 'bg-blue-500' : 'bg-gray-600'} transition-all duration-1000"></div>
    </div>
  `,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

interface Props {
  crises: Crisis[];
  resources: Resource[];
  selectedCrisis?: Crisis;
  mapMode: 'streets' | 'satellite' | 'topology';
  trafficPoints: TrafficPoint[];
  showHeatmap: boolean;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function CrisisMap({ crises, resources, selectedCrisis, mapMode, trafficPoints, showHeatmap }: Props) {
  const [animatedResources, setAnimatedResources] = useState<Resource[]>(resources);

  useEffect(() => {
    setAnimatedResources(resources);
  }, [resources]);

  const center: [number, number] = selectedCrisis?.location 
    ? [selectedCrisis.location.lat, selectedCrisis.location.lng] 
    : (crises.length > 0 && crises[0].location) ? [crises[0].location.lat, crises[0].location.lng] : [31.5204, 74.3587];

  const getTileUrl = () => {
    switch (mapMode) {
      case 'satellite': return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'topology': return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default: return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  const getSubdomains = () => {
    if (mapMode === 'satellite') return [];
    return ['a', 'b', 'c'];
  };

  return (
    <div className="h-full w-full bg-[#0A0B0D] relative">
      {/* Grid Overlay Effect */}
      <div className="absolute inset-0 z-[500] pointer-events-none opacity-20 bg-[radial-gradient(#2D3139_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%", background: "#0A0B0D" }}
        zoomControl={false}
      >
        <TileLayer
          key={mapMode}
          url={getTileUrl()}
          subdomains={getSubdomains()}
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapResizer />
        
        {showHeatmap && (
          <HeatmapLayer
            fitBoundsOnUpdate
            points={trafficPoints}
            longitudeExtractor={(m: any) => m.lng}
            latitudeExtractor={(m: any) => m.lat}
            intensityExtractor={(m: any) => m.intensity}
            radius={20}
            blur={15}
            max={1}
            gradient={{
              0.4: 'blue',
              0.6: 'cyan',
              0.7: 'lime',
              0.8: 'yellow',
              1.0: 'red'
            }}
          />
        )}

        {selectedCrisis?.location && <MapController center={[selectedCrisis.location.lat, selectedCrisis.location.lng]} />}

        {crises.map(crisis => {
          if (!crisis.location) return null;
          return (
            <React.Fragment key={crisis.id}>
              <Circle 
                center={[crisis.location.lat, crisis.location.lng]}
                radius={crisis.radius}
                pathOptions={{ 
                  color: crisis.severity === "CRITICAL" ? "#ff3e3e" : "#f4ea16", 
                  fillColor: crisis.severity === "CRITICAL" ? "#ff3e3e" : "#f4ea16",
                  fillOpacity: 0.05,
                  weight: 1,
                  dashArray: "4 8"
                }}
              />
              {/* Pulsing Core */}
              <Circle 
                center={[crisis.location.lat, crisis.location.lng]}
                radius={crisis.radius / 10}
                pathOptions={{ 
                  color: crisis.severity === "CRITICAL" ? "#ff3e3e" : "#3b82f6", 
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
            </React.Fragment>
          );
        })}

        {crises.map(crisis => 
          crisis.blockedRoutes?.map((route, i) => (
            <Polyline 
              key={`${crisis.id}-route-${i}`}
              positions={route.points}
              pathOptions={{
                color: route.color,
                weight: 5,
                opacity: 0.8,
                dashArray: "10, 10",
                lineCap: "round"
              }}
            />
          ))
        )}

        {animatedResources.map(resource => {
          if (!resource.location) return null;
          return (
            <Marker 
              key={resource.id}
              position={[resource.location.lat, resource.location.lng]}
              icon={ResourceIcon(resource.type, resource.status)}
            >
              <Popup>
                <div className="text-[10px] font-mono p-1">
                  <div className="font-bold border-b border-gray-200 mb-1">{resource.name}</div>
                  <div>TYPE: {resource.type}</div>
                  <div className={resource.status === 'DEPLOYED' ? 'text-blue-600' : 'text-gray-400'}>
                    STATUS: {resource.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
