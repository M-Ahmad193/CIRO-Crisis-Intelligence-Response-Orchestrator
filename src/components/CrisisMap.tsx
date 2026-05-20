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

const TacticalMarker = (type: string, severity: string, isSelected: boolean) => L.divIcon({
  html: `
    <div class="relative group">
      <div class="absolute -inset-6 bg-${severity === 'CRITICAL' ? 'red' : 'amber'}-500/20 rounded-full animate-pulse"></div>
      <div class="absolute -inset-3 bg-${severity === 'CRITICAL' ? 'red' : 'amber'}-500/40 rounded-full"></div>
      <div class="w-8 h-8 rounded-xl ${severity === 'CRITICAL' ? 'bg-red-600 shadow-[0_0_25px_rgba(239,68,68,0.6)]' : 'bg-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.6)]'} border-2 border-white flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 rotate-12' : ''}">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            ${severity === 'CRITICAL' ? '<path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>'}
         </svg>
      </div>
      ${isSelected ? '<div class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-bounce shadow-lg"></div>' : ''}
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const ResourceIcon = (type: string, status: string) => {
  let iconContent = '';
  switch(type) {
    case 'AMBULANCE': iconContent = '<path d="M4.5 16.5c-1.5 0-2 1.5-2 2.5s.5 2.5 2 2.5 2-1.5 2-2.5-.5-2.5-2-2.5zm15 0c-1.5 0-2 1.5-2 2.5s.5 2.5 2 2.5 2-1.5 2-2.5-.5-2.5-2-2.5zM3.5 17h1M3.5 9.5h1m16 0h1m-1 7.5h1M11.5 5.5v11m-7-5.5h14m-12-6h10l2 2v6h-14v-6l2-2z"/>'; break;
    case 'POLICE': iconContent = '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'; break;
    default: iconContent = '<path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/>'; break;
  }

  return L.divIcon({
    html: `
      <div class="relative group">
        ${status === 'DEPLOYED' ? '<div class="absolute -inset-3 bg-blue-400 opacity-20 rounded-full animate-pulse"></div>' : ''}
        <div class="w-5 h-5 rounded border border-white/50 shadow-lg ${status === 'DEPLOYED' ? 'bg-blue-600' : 'bg-gray-800'} flex items-center justify-center transition-all">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${iconContent}
           </svg>
        </div>
      </div>
    `,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

interface Props {
  crises: Crisis[];
  resources: Resource[];
  selectedCrisis?: Crisis;
  mapMode: 'streets' | 'satellite' | 'topology';
  trafficPoints: TrafficPoint[];
  showHeatmap: boolean;
  position: { center: [number, number]; zoom: number };
  onPositionChange: (pos: { center: [number, number]; zoom: number }) => void;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function MapController({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      const targetZoom = zoom ?? currentZoom;
      
      const dist = Math.sqrt(
        Math.pow(currentCenter.lat - center[0], 2) + 
        Math.pow(currentCenter.lng - center[1], 2)
      );

      // Only move if significantly different to avoid infinite loops
      if (dist > 0.0001 || (zoom !== undefined && Math.abs(currentZoom - zoom) > 0.1)) {
        map.setView(center, targetZoom, { animate: true });
      }
    }
  }, [center, zoom, map]);
  return null;
}

function MapEventsHandler({ onPositionChange }: { onPositionChange: (pos: { center: [number, number]; zoom: number }) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const onMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      // Use functional update or equality check in parent, but here we can at least avoid 
      // triggering if it's already very close to what we last reported (optional optimization)
      onPositionChange({
        center: [center.lat, center.lng],
        zoom: zoom
      });
    };
    
    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
    };
  }, [map, onPositionChange]);

  return null;
}

export default function CrisisMap({ crises, resources, selectedCrisis, mapMode, trafficPoints, showHeatmap, position, onPositionChange }: Props) {
  const [animatedResources, setAnimatedResources] = useState<Resource[]>(resources);

  useEffect(() => {
    setAnimatedResources(resources);
  }, [resources]);

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
        center={position.center} 
        zoom={position.zoom} 
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
        <MapEventsHandler onPositionChange={onPositionChange} />
        <MapController center={position.center} zoom={position.zoom} />
        
        {/* Heatmap Layer */}
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

        {crises.map(crisis => {
          if (!crisis.location) return null;
          return (
            <React.Fragment key={crisis.id}>
              <Marker 
                position={[crisis.location.lat, crisis.location.lng]}
                icon={TacticalMarker(crisis.type, crisis.severity, selectedCrisis?.id === crisis.id)}
              >
                <Popup>
                   <div className="text-[10px] font-mono p-1">
                      <div className="font-bold border-b border-gray-200 mb-1 uppercase tracking-tight">{crisis.title}</div>
                      <div className="text-red-600 font-black">SEVERITY: {crisis.severity}</div>
                      <div className="text-gray-500">{crisis.description.substring(0, 50)}...</div>
                   </div>
                </Popup>
              </Marker>
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
                color: "#ff0000",
                weight: 8,
                opacity: 0.9,
                dashArray: "5, 10",
                lineCap: "butt",
                lineJoin: "miter"
              }}
            >
               <Popup>
                 <div className="text-[10px] font-bold text-red-600 uppercase p-1">
                   Full Blockage: Path Compromised
                 </div>
               </Popup>
            </Polyline>
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
