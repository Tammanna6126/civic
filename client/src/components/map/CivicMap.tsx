import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Complaint, Hotspot, PriorityTier } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Eye, MapPin, AlertOctagon, Layers, Globe, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PAN_INDIA_DEMO_COMPLAINTS } from '../../data/panIndiaComplaints';

// Custom colored SVG pin markers for Leaflet
function createCustomIcon(tier: PriorityTier, isResolved: boolean = false) {
  let color = '#94a3b8'; // default
  let pulseHtml = '';

  if (isResolved) {
    color = '#10b981'; // emerald
  } else if (tier === 'critical') {
    color = '#f43f5e'; // rose/crimson
    pulseHtml = '<div style="position: absolute; top: -4px; left: -4px; width: 36px; height: 36px; border-radius: 50%; background: rgba(244,63,94,0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>';
  } else if (tier === 'high') {
    color = '#f59e0b'; // amber
  } else if (tier === 'medium') {
    color = '#0284c7'; // sky
  }

  const html = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="#0f172a" stroke-width="1.5" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

// Controller to smoothly re-center map if center or zoom prop changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export type MapTileType = 'google_streets' | 'google_satellite' | 'google_terrain' | 'osm';

// Major Indian Metropolitan Quick Presets
export const INDIA_REGIONS = [
  { name: '🇮🇳 Full India', center: [22.5937, 78.9629] as [number, number], zoom: 5 },
  { name: 'Delhi NCR', center: [28.6139, 77.2090] as [number, number], zoom: 11 },
  { name: 'Mumbai', center: [19.0760, 72.8777] as [number, number], zoom: 11 },
  { name: 'Bengaluru', center: [12.9716, 77.5946] as [number, number], zoom: 12 },
  { name: 'Hyderabad', center: [17.3850, 78.4867] as [number, number], zoom: 11 },
  { name: 'Chennai', center: [13.0827, 80.2707] as [number, number], zoom: 11 },
  { name: 'Kolkata', center: [22.5726, 88.3639] as [number, number], zoom: 11 },
  { name: 'Pune', center: [18.5204, 73.8567] as [number, number], zoom: 11 },
  { name: 'Ahmedabad', center: [23.0225, 72.5714] as [number, number], zoom: 11 },
  { name: 'Jaipur', center: [26.9124, 75.7873] as [number, number], zoom: 11 },
  { name: 'Lucknow', center: [26.8467, 80.9462] as [number, number], zoom: 11 },
  { name: 'Kochi', center: [9.9656, 76.2421] as [number, number], zoom: 11 },
  { name: 'Chandigarh', center: [30.7380, 76.7820] as [number, number], zoom: 11 },
  { name: 'Guwahati', center: [26.1584, 91.7770] as [number, number], zoom: 11 }
];

interface CivicMapProps {
  complaints: Complaint[];
  hotspots?: Hotspot[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (c: Complaint) => void;
  height?: string;
  showHotspots?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints,
  hotspots = [],
  selectedComplaintId,
  onSelectComplaint,
  height = '620px',
  showHotspots = true
}) => {
  // Default to Full India View (Nagpur / Central India coordinates, zoom level 5)
  const [center, setCenter] = useState<[number, number]>([22.5937, 78.9629]);
  const [zoom, setZoom] = useState<number>(5);
  const [activeRegion, setActiveRegion] = useState<string>('🇮🇳 Full India');
  const [tileType, setTileType] = useState<MapTileType>('google_streets');

  // Combine DB complaints with Pan-India demo complaints ensuring full coverage
  const allComplaints = useMemo(() => {
    const existingTickets = new Set(complaints.map((c) => c.ticket_number));
    const extraComplaints = PAN_INDIA_DEMO_COMPLAINTS.filter(
      (c) => !existingTickets.has(c.ticket_number)
    );
    return [...complaints, ...extraComplaints];
  }, [complaints]);

  // If a specific complaint is selected, pan and zoom into it
  useEffect(() => {
    if (selectedComplaintId) {
      const target = allComplaints.find((c) => c.id === selectedComplaintId);
      if (target && !isNaN(target.latitude) && !isNaN(target.longitude)) {
        setCenter([target.latitude, target.longitude]);
        setZoom(15);
      }
    }
  }, [selectedComplaintId, allComplaints]);

  const handleSelectRegion = (region: (typeof INDIA_REGIONS)[0]) => {
    setActiveRegion(region.name);
    setCenter(region.center);
    setZoom(region.zoom);
  };

  // Tile layer configuration (Google Maps vs Satellite vs OpenStreetMap)
  const getTileConfig = () => {
    switch (tileType) {
      case 'google_satellite':
        return {
          url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps Hybrid Satellite',
          maxZoom: 20
        };
      case 'google_terrain':
        return {
          url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps Terrain',
          maxZoom: 20
        };
      case 'osm':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        };
      case 'google_streets':
      default:
        return {
          url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps',
          maxZoom: 20
        };
    }
  };

  const tileConfig = getTileConfig();

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-2 bg-slate-950">
      {/* Top Controls Toolbar: Region Presets & Google Map Layer Switcher */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* City / National Jump Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 pr-1 shrink-0">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Region:</span>
          </span>
          {INDIA_REGIONS.map((r) => (
            <button
              key={r.name}
              type="button"
              onClick={() => handleSelectRegion(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeRegion === r.name
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Google Maps Layer Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950/80 border border-slate-700/80 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-1 hidden md:inline">
            <Layers className="w-3 h-3 text-emerald-400 inline mr-1" />
            Map:
          </span>
          <button
            type="button"
            onClick={() => setTileType('google_streets')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
              tileType === 'google_streets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ Google Map
          </button>
          <button
            type="button"
            onClick={() => setTileType('google_satellite')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
              tileType === 'google_satellite'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            type="button"
            onClick={() => setTileType('osm')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
              tileType === 'osm'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🌐 Carto
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full" style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#090d16' }}
        >
          <ChangeView center={center} zoom={zoom} />

          {/* Dynamic Google Maps / Satellite Tiles */}
          <TileLayer
            key={tileType}
            attribution={tileConfig.attribution}
            url={tileConfig.url}
            maxZoom={tileConfig.maxZoom}
          />

          {/* Hotspot density circles */}
          {showHotspots &&
            hotspots.map((h, idx) => (
              <Circle
                key={`hotspot-${idx}`}
                center={[h.centerLat, h.centerLng]}
                radius={h.riskLevel === 'critical' ? 1200 : 800}
                pathOptions={{
                  color: h.riskLevel === 'critical' ? '#f43f5e' : '#f59e0b',
                  fillColor: h.riskLevel === 'critical' ? '#f43f5e' : '#f59e0b',
                  fillOpacity: 0.22,
                  weight: 2,
                  dashArray: '5, 8'
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-slate-100">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <AlertOctagon className="w-4 h-4" />
                      <span>HOTSPOT CLUSTER</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{h.ward}</div>
                    <div className="text-xs text-slate-300">
                      Active reports: <span className="font-bold text-rose-400">{h.count}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Primary issue: <span className="capitalize font-mono">{h.dominantCategory}</span>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

          {/* Complaint Markers */}
          {allComplaints.map((c) => {
            if (!c.latitude || !c.longitude) return null;
            const isResolved = c.status === 'resolved';
            const icon = createCustomIcon(c.priority_tier, isResolved);

            return (
              <Marker
                key={c.id}
                position={[c.latitude, c.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectComplaint && onSelectComplaint(c)
                }}
              >
                <Popup>
                  <div className="p-2.5 max-w-xs space-y-2 text-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {c.ticket_number}
                      </span>
                      <PriorityBadge tier={c.priority_tier} score={c.priority_score} size="sm" />
                    </div>

                    <h4 className="font-semibold text-sm line-clamp-2 text-white">
                      {c.title}
                    </h4>

                    <div className="flex items-center space-x-1 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <StatusBadge status={c.status} size="sm" />
                      <div className="flex items-center space-x-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-sky-400 hover:text-sky-300"
                        >
                          Google Maps ↗
                        </a>
                        <Link
                          to={`/complaints/${c.id}`}
                          className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-xs space-y-1.5 shadow-xl pointer-events-auto">
          <div className="font-bold text-[11px] text-slate-400 tracking-wider">MAP LEGEND</div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-200">Critical Hazard (Score 85-100)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-200">High Priority (65-84)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-200">Medium Priority (35-64)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-200">Resolved Ticket</span>
          </div>
        </div>
      </div>
    </div>
  );
};
