import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Layers } from 'lucide-react';

const pinIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16,185,129,0.3); animation: ping 1.8s infinite;"></div>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#10b981" stroke="#047857" stroke-width="1.5" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  className: 'pin-picker-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

interface PinPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

function DraggableMarker({
  latitude,
  longitude,
  onChange
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

  // Click on map to place pin
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        if (marker != null) {
          const latlng = marker.getLatLng();
          setPosition([latlng.lat, latlng.lng]);
          onChange(latlng.lat, latlng.lng);
        }
      }
    }),
    [onChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={pinIcon}
    />
  );
}

export const PinPicker: React.FC<PinPickerProps> = ({
  latitude,
  longitude,
  onChange
}) => {
  const [isSatellite, setIsSatellite] = useState(false);

  const tileUrl = isSatellite
    ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
    : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner h-64 bg-slate-950">
      {/* Google Maps Layer Switcher */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-center space-x-1.5 shadow-lg">
        <button
          type="button"
          onClick={() => setIsSatellite(!isSatellite)}
          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
        >
          <Layers className="w-3 h-3 inline" />
          <span>{isSatellite ? '🗺️ Google Street' : '🛰️ Google Satellite'}</span>
        </button>
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={isSatellite ? 'sat' : 'street'}
          attribution="&copy; Google Maps"
          url={tileUrl}
          maxZoom={20}
        />
        <DraggableMarker
          latitude={latitude}
          longitude={longitude}
          onChange={onChange}
        />
      </MapContainer>

      {/* Floating coordinates indicator */}
      <div className="absolute top-2.5 left-2.5 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-center space-x-2 shadow-lg">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span>Click or drag pin ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
      </div>
    </div>
  );
};
